import json
import os
import tempfile
from pathlib import Path

os.environ["OWNER_PASSKEY"] = "test-owner-passkey"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"
os.environ["CODE_WORKSPACE_ENABLED"] = "true"

from fastapi.testclient import TestClient

import api
import coding_workspace


class FakeResponse:
    status_code = 200

    def __init__(self, text: str):
        self.text = text

    def raise_for_status(self) -> None:
        return None

    def json(self):
        return {"candidates": [{"content": {"parts": [{"text": self.text}]}}]}


def run() -> None:
    with tempfile.TemporaryDirectory() as directory:
        workspace = Path(directory)
        source = workspace / "frontend" / "src" / "App.tsx"
        source.parent.mkdir(parents=True)
        source.write_text("export const greeting = 'hello';\n", encoding="utf-8")
        (workspace / ".env").write_text("SECRET=value\n", encoding="utf-8")

        original_root = coding_workspace.WORKSPACE_ROOT
        original_post = api.requests.post
        gemini_requests: list[dict] = []

        def fake_post(*_args, **kwargs):
            request_json = kwargs.get("json", {})
            gemini_requests.append(request_json)
            if "Generate a new profile card" in json.dumps(request_json):
                return FakeResponse(
                    json.dumps(
                        {
                            "summary": "Create a standalone profile card.",
                            "answer": "",
                            "plan": ["Create the requested HTML page."],
                            "questions": [],
                            "changes": [
                                {
                                    "path": "frontend/src/generated/profile-card.html",
                                    "operation": "create",
                                    "find": "",
                                    "replace": "<main><h1>Mavis profile</h1></main>\n",
                                    "explanation": "Add the requested standalone previewable page.",
                                }
                            ],
                            "verification": ["frontend_build"],
                        }
                    )
                )
            return FakeResponse(
                json.dumps(
                    {
                        "summary": "Rename the greeting value.",
                        "answer": "",
                        "plan": [
                            "Update the selected constant.",
                            "Build the frontend after approval.",
                        ],
                        "questions": [],
                        "changes": [
                            {
                                "path": "frontend/src/App.tsx",
                                "operation": "replace",
                                "find": "'hello'",
                                "replace": "'hello from Mavis'",
                                "explanation": "Use the requested greeting text.",
                            }
                        ],
                        "verification": ["frontend_build", "not_allowed"],
                    }
                )
            )

        try:
            coding_workspace.WORKSPACE_ROOT = workspace
            api._coding_proposals.clear()
            api.requests.post = fake_post

            recovered = api._clean_json_response(
                'Here is the proposal: {"summary": "Recovered"}'
            )
            assert recovered["summary"] == "Recovered"
            assert "rate-limited" in api._coding_failure_detail(
                RuntimeError("429 quota exceeded")
            )
            assert "fewer selected files" in api._coding_failure_detail(
                RuntimeError("request timeout")
            )
            provider_413 = RuntimeError("Mavis could not contact its fallback model provider.")
            provider_413.__cause__ = RuntimeError("413 Request Entity Too Large")
            assert "too much code" in api._coding_failure_detail(provider_413)
            review = api._normalize_coding_proposal(
                {
                    "summary": "This is a simple component.",
                    "answer": "The component exports a greeting constant and has no runtime logic.",
                    "plan": [],
                    "questions": [],
                    "changes": [],
                    "verification": [],
                },
                [{"path": "frontend/src/App.tsx", "content": source.read_text(encoding="utf-8")}],
            )
            assert review["answer"].startswith("The component exports")
            assert review["questions"] == []

            files = coding_workspace.list_workspace_files()
            assert {item["path"] for item in files} == {"frontend/src/App.tsx"}
            try:
                coding_workspace.read_workspace_file(".env")
                raise AssertionError("Secret files must be blocked")
            except coding_workspace.WorkspaceError:
                pass
            try:
                coding_workspace.read_workspace_file("../outside.py")
                raise AssertionError("Paths must not escape the workspace")
            except coding_workspace.WorkspaceError:
                pass

            large_source = workspace / "frontend" / "src" / "large.ts"
            large_source.write_text("x" * (coding_workspace.MAX_CONTEXT_BYTES + 1), encoding="utf-8")
            try:
                coding_workspace.read_workspace_context(["frontend/src/large.ts"])
                raise AssertionError("Oversized model context must be rejected before a provider call")
            except coding_workspace.WorkspaceError as error:
                assert "too much code" in str(error)

            client = TestClient(api.app)
            auth = client.post("/auth/owner", json={"passkey": "test-owner-passkey"})
            assert auth.status_code == 200
            owner_session = auth.json()["session_id"]
            headers = {"X-Mavis-Session": owner_session}

            workspace_response = client.get("/coding/workspace", headers=headers)
            assert workspace_response.status_code == 200
            assert workspace_response.json()["files"][0]["path"] == "frontend/src/App.tsx"

            proposal_response = client.post(
                "/coding/propose",
                json={
                    "message": "Change the greeting.",
                    "session_id": "11111111-2222-3333-4444-555555555555",
                    "owner_session": owner_session,
                    "files": ["frontend/src/App.tsx"],
                    "history": [],
                },
            )
            assert proposal_response.status_code == 200
            assert gemini_requests[-1]["generationConfig"]["responseMimeType"] == "application/json"
            proposal = proposal_response.json()
            assert len(proposal["proposed_changes"]) == 1
            assert proposal["proposed_changes"][0]["path"] == "frontend/src/App.tsx"
            assert "hello from Mavis" in proposal["diffs"][0]["diff"]
            assert proposal["verification"] == ["frontend_build"]

            rejected_apply = client.post(
                "/coding/apply",
                json={"proposal_id": proposal["proposal_id"], "confirm": False},
                headers=headers,
            )
            assert rejected_apply.status_code == 400
            applied = client.post(
                "/coding/apply",
                json={"proposal_id": proposal["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert applied.status_code == 200
            assert "hello from Mavis" in source.read_text(encoding="utf-8")

            blocked_verify = client.post(
                "/coding/verify",
                json={"proposal_id": proposal["proposal_id"], "command": "backend_tests"},
                headers=headers,
            )
            assert blocked_verify.status_code == 400

            rolled_back = client.post(
                "/coding/rollback",
                json={"proposal_id": proposal["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert rolled_back.status_code == 200
            assert source.read_text(encoding="utf-8") == "export const greeting = 'hello';\n"

            generated_response = client.post(
                "/coding/propose",
                json={
                    "message": "Generate a new profile card in a separate HTML file.",
                    "session_id": "11111111-2222-3333-4444-555555555555",
                    "owner_session": owner_session,
                    "files": [],
                    "history": [],
                },
            )
            assert generated_response.status_code == 200
            generated = generated_response.json()
            assert generated["proposed_changes"][0]["operation"] == "create"
            assert generated["proposed_changes"][0]["path"] == "frontend/src/generated/profile-card.html"
            assert "Mavis profile" in generated["proposed_changes"][0]["content"]
            assert "+<main>" in generated["diffs"][0]["diff"]
            generated_path = workspace / "frontend" / "src" / "generated" / "profile-card.html"
            assert not generated_path.exists()
            generated_apply = client.post(
                "/coding/apply",
                json={"proposal_id": generated["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert generated_apply.status_code == 200
            assert generated_path.read_text(encoding="utf-8") == "<main><h1>Mavis profile</h1></main>\n"
            generated_rollback = client.post(
                "/coding/rollback",
                json={"proposal_id": generated["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert generated_rollback.status_code == 200
            assert not generated_path.exists()
            try:
                coding_workspace.validate_new_file_path(".env")
                raise AssertionError("Generated secret files must be blocked")
            except coding_workspace.WorkspaceError:
                pass
        finally:
            coding_workspace.WORKSPACE_ROOT = original_root
            api.requests.post = original_post
            api._coding_proposals.clear()

    print("Coding workspace tests passed")


if __name__ == "__main__":
    run()
