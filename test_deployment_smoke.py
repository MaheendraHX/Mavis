import os
import uuid
from types import SimpleNamespace

os.environ.pop("GROQ_API_KEY", None)
os.environ["ALLOWED_ORIGINS"] = "https://mavis.example.com"

from fastapi.testclient import TestClient

import api


def run() -> None:
    test_client = TestClient(api.app)

    health = test_client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "MAVIS is online"
    assert health.json()["groq_configured"] is False

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

    stream = test_client.post(
        "/chat/stream",
        json={
            "message": "Hello",
            "user_type": "guest",
            "session_id": "deployment-smoke",
            "web_search": False,
        },
        headers={"X-Guest-ID": "deployment-smoke"},
    )
    assert stream.status_code == 200
    assert "Mavis is temporarily unavailable" in stream.text

    class FakeCompletions:
        def create(self, **_kwargs):
            return SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content="Mavis is ready."))]
            )

    original_client = api.client
    try:
        api.client = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))
        configured_guest_id = f"configured-{uuid.uuid4()}"
        configured_stream = test_client.post(
            "/chat/stream",
            json={
                "message": "Hello",
                "user_type": "guest",
                "session_id": configured_guest_id,
                "incognito": True,
                "web_search": False,
                "model_name": "llama-3.1-8b-instant",
            },
            headers={"X-Guest-ID": configured_guest_id},
        )
        assert configured_stream.status_code == 200
        assert "Mavis is ready." in configured_stream.text
        assert '"type": "done"' in configured_stream.text
    finally:
        api.client = original_client

    print("Deployment smoke tests passed")


if __name__ == "__main__":
    run()
