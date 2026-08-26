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


class RetiredModelFallbackCompletions:
    def __init__(self):
        self.models = []

    def create(self, **kwargs):
        self.models.append(kwargs["model"])
        if kwargs["model"] == "llama-3.3-70b-versatile":
            error = RuntimeError("model_not_found")
            error.status_code = 404
            raise error
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="Current Groq model is ready."))]
        )


def stream_payload(
    message: str,
    owner_session: str = "",
    *,
    incognito: bool = True,
    history: list[dict[str, str]] | None = None,
) -> dict:
    return {
        "message": message,
        "session_id": SESSION_ID,
        "owner_session": owner_session,
        "web_search": False,
        "incognito": incognito,
        "persona": "default",
        "history": history or [],
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

        assert api._is_greeting("Hello!")
        assert not api._is_greeting("What changed recently?")

        original_web_search = api.web_search
        try:
            api.web_search = lambda *_args, **_kwargs: [
                None,
                {"title": "", "url": "https://invalid.example", "snippet": "Skip this."},
                {"title": "Current result", "url": "https://example.com/current", "snippet": "Usable context."},
            ]
            web_request = api.ChatRequest(
                message="What changed recently?",
                session_id=SESSION_ID,
                web_search=True,
            )
            search_prompt, sources = api._search_context_for(web_request, "System prompt")
            assert "Current result" in search_prompt
            assert sources == [{"title": "Current result", "url": "https://example.com/current"}]
        finally:
            api.web_search = original_web_search

        captured_gemini_payloads = []
        api.requests.post = lambda *args, **kwargs: (
            captured_gemini_payloads.append(kwargs.get("json")) or FakeResponse()
        )
        gemini_stream = test_client.post(
            "/chat/stream",
            json=stream_payload(
                "Hello from the Gemini test.",
                history=[{"role": "user", "content": "Remember this preference."}],
            ),
            headers={"X-Guest-ID": GUEST_ID},
        )
        assert gemini_stream.status_code == 200
        assert "Gemini is ready." in gemini_stream.text
        assert "\n\n" in gemini_stream.text
        assert "\\n\\n" not in gemini_stream.text
        assert '"provider": "gemini"' in gemini_stream.text
        assert '"remaining": 9' in gemini_stream.text
        assert "Remember this preference." in str(captured_gemini_payloads[0])

        titled_guest_id = "12345678-1234-5678-1234-567812345678"
        title_text = "hi"
        titled_stream = test_client.post(
            "/chat/stream",
            json=stream_payload(title_text, incognito=False),
            headers={"X-Guest-ID": titled_guest_id},
        )
        assert titled_stream.status_code == 200
        titled_conversations = memory.get_all_conversations_for_guest(titled_guest_id)
        assert titled_conversations[0]["title"] == title_text

        retired_model_completions = RetiredModelFallbackCompletions()
        api.client = SimpleNamespace(chat=SimpleNamespace(completions=retired_model_completions))
        groq_model_answer = api._call_groq_model(
            [{"role": "user", "content": "Verify model fallback."}],
            model_name="llama-3.3-70b-versatile",
        )
        assert groq_model_answer == "Current Groq model is ready."
        assert retired_model_completions.models == ["llama-3.3-70b-versatile", api.GROQ_BACKUP_MODEL]

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

        api.requests.post = lambda *args, **kwargs: FakeResponse(status_code=400)
        invalid_primary_stream = test_client.post(
            "/chat/stream",
            json=stream_payload("Exercise invalid-primary fallback."),
            headers={"X-Guest-ID": "c1d2e3f4-a5b6-7788-9900-112233445566"},
        )
        assert invalid_primary_stream.status_code == 200
        assert "Groq fallback is ready." in invalid_primary_stream.text
        assert '"provider": "groq"' in invalid_primary_stream.text

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
