import os
import sqlite3
import tempfile
from pathlib import Path
from types import SimpleNamespace

os.environ["ALLOWED_ORIGINS"] = "https://mavis.example.com"
os.environ["OWNER_PASSKEY"] = "test-owner-passkey"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"
os.environ["MODEL_PROVIDER"] = "gemini"

from fastapi.testclient import TestClient

import api
import memory
import usage_store


GUEST_ID = "f1e2d3c4-b5a6-7788-9900-aabbccddeeff"
SESSION_ID = "11111111-2222-3333-4444-555555555555"


class FakeResponse:
    def __init__(self, text: str = "Gemini is ready.", status_code: int = 200):
        self.text = text
        self.status_code = status_code

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            error = RuntimeError(f"HTTP {self.status_code}")
            error.status_code = self.status_code
            raise error

    def json(self):
        return {"candidates": [{"content": {"parts": [{"text": self.text}]}}]}


class FakeCompletions:
    def create(self, **_kwargs):
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="Groq fallback is ready."))]
        )


def stream_payload(message: str, owner_session: str = "") -> dict:
    return {
        "message": message,
        "session_id": SESSION_ID,
        "owner_session": owner_session,
        "web_search": False,
        "incognito": True,
        "persona": "default",
    }


def run() -> None:
    with tempfile.TemporaryDirectory() as directory:
        memory.DB_PATH = Path(directory) / "mavis-test.db"
        usage_store.SQLITE_PATH = Path(directory) / "mavis-usage-test.db"
        memory.init_db()
        usage_store.init()
        api.GEMINI_API_KEY = "test-gemini-key"
        api.OWNER_PASSKEY = "test-owner-passkey"
        api.client = None

        test_client = TestClient(api.app)
        preflight = test_client.options(
            "/chat/stream",
            headers={
                "Origin": "https://mavis.example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,x-guest-id",
            },
        )
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == "https://mavis.example.com"

        api.requests.post = lambda *args, **kwargs: FakeResponse()
        gemini_stream = test_client.post(
            "/chat/stream",
            json=stream_payload("Hello from the Gemini test."),
            headers={"X-Guest-ID": GUEST_ID},
        )
        assert gemini_stream.status_code == 200
        assert "Gemini is ready." in gemini_stream.text
        assert "\n\n" in gemini_stream.text
        assert "\\n\\n" not in gemini_stream.text
        assert '"provider": "gemini"' in gemini_stream.text
        assert '"remaining": 9' in gemini_stream.text

        api.requests.post = lambda *args, **kwargs: FakeResponse(status_code=429)
        api.client = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))
        fallback_stream = test_client.post(
            "/chat/stream",
            json=stream_payload("Exercise fallback."),
            headers={"X-Guest-ID": GUEST_ID},
        )
        assert fallback_stream.status_code == 200
        assert "Groq fallback is ready." in fallback_stream.text
        assert '"provider": "groq"' in fallback_stream.text

        for _ in range(8):
            usage_store.increment(GUEST_ID)
        limit_stream = test_client.post(
            "/chat/stream",
            json=stream_payload("This should be limited."),
            headers={"X-Guest-ID": GUEST_ID},
        )
        assert '"limit_reached": true' in limit_stream.text

        rate_guest_id = "a1b2c3d4-e5f6-7788-9900-112233445566"
        original_rate = api.PUBLIC_REQUESTS_PER_MINUTE
        try:
            api.PUBLIC_REQUESTS_PER_MINUTE = 1
            first_rate_request = test_client.post(
                "/chat/stream",
                json=stream_payload("First rate test."),
                headers={"X-Guest-ID": rate_guest_id},
            )
            assert first_rate_request.status_code == 200
            second_rate_request = test_client.post(
                "/chat/stream",
                json=stream_payload("Second rate test."),
                headers={"X-Guest-ID": rate_guest_id},
            )
            assert second_rate_request.status_code == 429
        finally:
            api.PUBLIC_REQUESTS_PER_MINUTE = original_rate

        auth = test_client.post("/auth/owner", json={"passkey": "test-owner-passkey"})
        assert auth.status_code == 200
        owner_session = auth.json()["session_id"]
        owner_stream = test_client.post(
            "/chat/stream",
            json=stream_payload("Owner remains unlimited.", owner_session),
            headers={"X-Guest-ID": GUEST_ID},
        )
        assert owner_stream.status_code == 200
        assert '"provider": "groq"' in owner_stream.text
        assert '"usage": null' in owner_stream.text

        health = test_client.get("/health")
        assert health.status_code == 200
        assert health.json()["model_provider"] == "gemini"

    print("Mavis core tests passed")


if __name__ == "__main__":
    run()
