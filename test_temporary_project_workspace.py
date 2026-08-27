import io
import json
import os
import tempfile
import zipfile
from pathlib import Path

os.environ["OWNER_PASSKEY"] = "test-owner-passkey"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"
os.environ["CODE_WORKSPACE_ENABLED"] = "true"

from fastapi.testclient import TestClient

import api
import temporary_project_workspace


class FakeResponse:
    status_code = 200

    def __init__(self, text: str):
        self.text = text

    def raise_for_status(self) -> None:
        return None

    def json(self):
        return {"candidates": [{"content": {"parts": [{"text": self.text}]}}]}


def files_payload(include_secret: bool = False):
    payload = [
        ("files", ("index.html", "<main>Hello</main>\n", "text/html")),
        ("files", ("script.js", "const greeting = 'hello';\n", "text/javascript")),
        ("files", ("data.json", '{"name":"Mahi"}\n', "application/json")),
    ]
    if include_secret:
        payload.append(("files", (".env", "SECRET=value\n", "text/plain")))
    return payload


def run() -> None:
    with tempfile.TemporaryDirectory() as directory:
        original_root = temporary_project_workspace.TEMP_PROJECT_ROOT
        original_post = api.requests.post
        try:
            temporary_project_workspace.TEMP_PROJECT_ROOT = Path(directory)
            api._temporary_projects.clear()
            api._coding_proposals.clear()
            api.requests.post = lambda *_args, **_kwargs: FakeResponse(
                json.dumps(
                    {
                        "summary": "Personalize the uploaded greeting.",
                        "plan": ["Update the selected script.", "Scan the temporary project after approval."],
                        "questions": [],
                        "changes": [
                            {
                                "path": "script.js",
                                "operation": "replace",
                                "find": "'hello'",
                                "replace": "'hello from Mavis'",
                                "explanation": "Use the requested greeting text.",
                            }
                        ],
                        "verification": ["project_scan", "frontend_build"],
                    }
                )
            )

            client = TestClient(api.app)
            auth = client.post("/auth/owner", json={"passkey": "test-owner-passkey"})
            assert auth.status_code == 200
            owner_session = auth.json()["session_id"]
            headers = {"X-Mavis-Session": owner_session}

            rejected = client.post("/temporary-projects", files=files_payload(True), headers=headers)
            assert rejected.status_code == 400
            assert "secret" in rejected.json()["detail"].lower()

            created = client.post("/temporary-projects", files=files_payload(), headers=headers)
            assert created.status_code == 200
            project = created.json()
            project_id = project["project_id"]
            assert {item["path"] for item in project["files"]} == {"index.html", "script.js", "data.json"}
            assert project["expires_in_seconds"] >= 900

            listed = client.get(f"/temporary-projects/{project_id}", headers=headers)
            assert listed.status_code == 200
            file_view = client.get(f"/temporary-projects/{project_id}/file", params={"path": "script.js"}, headers=headers)
            assert file_view.status_code == 200
            assert "const greeting" in file_view.json()["content"]

            proposal_response = client.post(
                f"/temporary-projects/{project_id}/propose",
                json={
                    "project_id": project_id,
                    "message": "Change the uploaded greeting.",
                    "session_id": "11111111-2222-3333-4444-555555555555",
                    "owner_session": owner_session,
                    "files": ["script.js"],
                    "history": [],
                },
            )
            assert proposal_response.status_code == 200
            proposal = proposal_response.json()
            assert proposal["workspace"] == "temporary"
            assert proposal["verification"] == ["project_scan"]
            assert "hello from Mavis" in proposal["diffs"][0]["diff"]

            applied = client.post(
                f"/temporary-projects/{project_id}/apply",
                json={"project_id": project_id, "proposal_id": proposal["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert applied.status_code == 200
            assert "script.js" in applied.json()["changed_files"]

            verified = client.post(
                f"/temporary-projects/{project_id}/verify",
                json={
                    "project_id": project_id,
                    "proposal_id": proposal["proposal_id"],
                    "command": "project_scan",
                },
                headers=headers,
            )
            assert verified.status_code == 200
            assert verified.json()["success"] is True
            assert "No executable commands" in verified.json()["output"]

            exported = client.get(f"/temporary-projects/{project_id}/download", headers=headers)
            assert exported.status_code == 200
            with zipfile.ZipFile(io.BytesIO(exported.content)) as archive:
                assert "script.js" in archive.namelist()
                assert "hello from Mavis" in archive.read("script.js").decode("utf-8")

            rolled_back = client.post(
                f"/temporary-projects/{project_id}/rollback",
                json={"project_id": project_id, "proposal_id": proposal["proposal_id"], "confirm": True},
                headers=headers,
            )
            assert rolled_back.status_code == 200
            restored = client.get(f"/temporary-projects/{project_id}/file", params={"path": "script.js"}, headers=headers)
            assert "'hello';" in restored.json()["content"]

            generated_result = temporary_project_workspace.apply_changes(
                project_id,
                [
                    {
                        "path": "generated/profile-card.html",
                        "operation": "create",
                        "find": "",
                        "replace": "<main><h1>Generated by Mavis</h1></main>\n",
                    }
                ],
            )
            generated_path = Path(directory) / project_id / "generated" / "profile-card.html"
            assert generated_path.read_text(encoding="utf-8").startswith("<main><h1>Generated")
            temporary_project_workspace.rollback_checkpoint(
                project_id,
                str(generated_result["checkpoint_id"]),
                ["generated/profile-card.html"],
            )
            assert not generated_path.exists()
            try:
                temporary_project_workspace.validate_new_file_path(project_id, ".env")
                raise AssertionError("Generated secret files must be blocked")
            except temporary_project_workspace.TemporaryProjectError:
                pass

            deleted = client.delete(f"/temporary-projects/{project_id}?confirm=true", headers=headers)
            assert deleted.status_code == 200
            unavailable = client.get(f"/temporary-projects/{project_id}", headers=headers)
            assert unavailable.status_code == 404
        finally:
            temporary_project_workspace.TEMP_PROJECT_ROOT = original_root
            api.requests.post = original_post
            api._temporary_projects.clear()
            api._coding_proposals.clear()

    print("Temporary project workspace tests passed")


if __name__ == "__main__":
    run()
