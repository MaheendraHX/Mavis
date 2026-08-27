"""Isolated workspace utilities for owner-uploaded temporary code projects.

This module never shares a filesystem root with Mavis's own source workspace. Uploaded files
are treated as untrusted data, constrained to a small text-only allowlist, and can only be
changed through reviewed exact-match replacements.
"""

from __future__ import annotations

import json
import os
import shutil
import time
import uuid
import zipfile
from io import BytesIO
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parent
TEMP_PROJECT_ROOT = Path(
    os.environ.get("TEMP_PROJECT_ROOT", BASE_DIR / "temporary_projects")
).expanduser().resolve()
MAX_FILE_BYTES = 120_000
MAX_PROJECT_BYTES = 1_200_000
MAX_PROJECT_FILES = 60
MAX_SELECTED_FILES = 6
MAX_CONTEXT_BYTES = 24_000
MAX_OUTPUT_CHARS = 12_000

IGNORED_DIRS = {
    ".git",
    ".mavis-checkpoints",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    ".output",
    "coverage",
    ".pytest_cache",
    ".mypy_cache",
}

BLOCKED_FILENAMES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    "id_rsa",
    "id_ed25519",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
}

ALLOWED_SUFFIXES = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".html",
    ".md",
    ".yaml",
    ".yml",
    ".toml",
    ".txt",
    ".sh",
}


class TemporaryProjectError(ValueError):
    """Raised when an uploaded project request exceeds a temporary-workspace boundary."""


def workspace_enabled() -> bool:
    """Opt in with a dedicated flag or reuse the existing private Coding Mode switch."""
    raw = os.environ.get(
        "TEMP_PROJECT_MODE_ENABLED",
        os.environ.get("CODE_WORKSPACE_ENABLED", "false"),
    )
    return raw.strip().lower() == "true"


def _project_directory(project_id: str) -> Path:
    if not project_id.startswith("temp_") or not project_id[5:].isalnum() or len(project_id) != 37:
        raise TemporaryProjectError("That temporary project identifier is invalid.")
    root = TEMP_PROJECT_ROOT.resolve()
    path = (root / project_id).resolve()
    try:
        path.relative_to(root)
    except ValueError as error:
        raise TemporaryProjectError("The temporary project path is invalid.") from error
    if not path.exists() or not path.is_dir():
        raise TemporaryProjectError("That temporary project has expired or is unavailable.")
    return path


def _relative_path(value: str) -> Path:
    raw = (value or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or raw.startswith("~") or "\x00" in raw:
        raise TemporaryProjectError("Choose a valid project-relative file path.")
    candidate = Path(raw)
    if any(part in {"", ".", ".."} for part in candidate.parts):
        raise TemporaryProjectError("File paths must stay inside the temporary project.")
    if candidate.name.lower() in BLOCKED_FILENAMES or candidate.suffix.lower() == ".env":
        raise TemporaryProjectError("Mavis never reads or edits secret environment files.")
    if any(part.lower() in IGNORED_DIRS for part in candidate.parts):
        raise TemporaryProjectError("That folder is excluded from Temporary Project Mode.")
    if candidate.suffix.lower() not in ALLOWED_SUFFIXES:
        raise TemporaryProjectError("That file type is not available in Temporary Project Mode.")
    return candidate


def _resolve_file(project_id: str, value: str, *, must_exist: bool = True) -> Path:
    root = _project_directory(project_id)
    relative = _relative_path(value)
    path = (root / relative).resolve()
    try:
        path.relative_to(root)
    except ValueError as error:
        raise TemporaryProjectError("File paths must stay inside the temporary project.") from error
    if must_exist and (not path.exists() or not path.is_file()):
        raise TemporaryProjectError("That temporary project file does not exist.")
    if path.exists() and path.stat().st_size > MAX_FILE_BYTES:
        raise TemporaryProjectError("That temporary project file is too large for a focused coding task.")
    return path


def _normalize_upload_path(filename: str) -> Path:
    path = _relative_path(filename)
    if len(path.as_posix()) > 220:
        raise TemporaryProjectError("An uploaded file path is too long.")
    return path


def create_project(files: Iterable[tuple[str, bytes]]) -> dict[str, object]:
    incoming = list(files)
    if not incoming:
        raise TemporaryProjectError("Upload at least one supported code or text file.")
    if len(incoming) > MAX_PROJECT_FILES:
        raise TemporaryProjectError(f"Upload no more than {MAX_PROJECT_FILES} files at once.")

    staged: list[tuple[Path, str]] = []
    total = 0
    seen: set[str] = set()
    for filename, raw_content in incoming:
        relative = _normalize_upload_path(filename)
        key = relative.as_posix().lower()
        if key in seen:
            raise TemporaryProjectError("Every uploaded file must have a unique path.")
        seen.add(key)
        if len(raw_content) > MAX_FILE_BYTES:
            raise TemporaryProjectError(f"{relative.name} is larger than 120 KB. Upload a smaller focused file.")
        total += len(raw_content)
        if total > MAX_PROJECT_BYTES:
            raise TemporaryProjectError("The temporary project is too large. Keep total uploads below 1.2 MB.")
        try:
            content = raw_content.decode("utf-8")
        except UnicodeDecodeError as error:
            raise TemporaryProjectError(f"{relative.name} must be UTF-8 text.") from error
        if "\x00" in content:
            raise TemporaryProjectError(f"{relative.name} is not a supported text source file.")
        staged.append((relative, content))

    TEMP_PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    project_id = f"temp_{uuid.uuid4().hex}"
    root = (TEMP_PROJECT_ROOT / project_id).resolve()
    root.mkdir(parents=True, exist_ok=False)
    try:
        for relative, content in staged:
            target = (root / relative).resolve()
            target.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
    except OSError as error:
        shutil.rmtree(root, ignore_errors=True)
        raise TemporaryProjectError("Mavis could not safely create the temporary project.") from error

    return {
        "project_id": project_id,
        "files": list_project_files(project_id),
        "total_bytes": total,
        "created_at": int(time.time()),
    }


def list_project_files(project_id: str) -> list[dict[str, object]]:
    root = _project_directory(project_id)
    results: list[dict[str, object]] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        try:
            relative = path.relative_to(root)
        except ValueError:
            continue
        if any(part.lower() in IGNORED_DIRS for part in relative.parts):
            continue
        if path.name.lower() in BLOCKED_FILENAMES or path.suffix.lower() == ".env":
            continue
        if path.suffix.lower() not in ALLOWED_SUFFIXES or path.stat().st_size > MAX_FILE_BYTES:
            continue
        results.append({"path": relative.as_posix(), "size": path.stat().st_size})
    return sorted(results, key=lambda item: str(item["path"]).lower())[:MAX_PROJECT_FILES]


def read_project_file(project_id: str, value: str) -> dict[str, object]:
    root = _project_directory(project_id)
    path = _resolve_file(project_id, value)
    return {
        "path": path.relative_to(root).as_posix(),
        "content": path.read_text(encoding="utf-8", errors="replace"),
        "size": path.stat().st_size,
    }


def read_project_context(project_id: str, paths: Iterable[str]) -> list[dict[str, str]]:
    unique: list[str] = []
    for value in paths:
        if isinstance(value, str) and value not in unique:
            unique.append(value)
    if not unique:
        raise TemporaryProjectError("Select at least one temporary project file before asking Mavis to edit code.")
    if len(unique) > MAX_SELECTED_FILES:
        raise TemporaryProjectError(f"Select no more than {MAX_SELECTED_FILES} files for one coding task.")

    total = 0
    context: list[dict[str, str]] = []
    for value in unique:
        item = read_project_file(project_id, value)
        text = str(item["content"])
        total += len(text.encode("utf-8"))
        if total > MAX_CONTEXT_BYTES:
            raise TemporaryProjectError("The selected files contain too much code for one plan. Choose one to three smaller, focused files.")
        context.append({"path": str(item["path"]), "content": text})
    return context


def _checkpoint_root(project_id: str) -> Path:
    return _project_directory(project_id) / ".mavis-checkpoints"


def _checkpoint_path(project_id: str, checkpoint_id: str, relative_path: str) -> Path:
    if not checkpoint_id or not checkpoint_id.isalnum():
        raise TemporaryProjectError("Invalid checkpoint identifier.")
    root = _checkpoint_root(project_id).resolve()
    target = (root / checkpoint_id / _relative_path(relative_path)).resolve()
    try:
        target.relative_to(root)
    except ValueError as error:
        raise TemporaryProjectError("Invalid checkpoint path.") from error
    return target


def apply_changes(project_id: str, changes: list[dict[str, str]]) -> dict[str, object]:
    if not changes:
        raise TemporaryProjectError("The proposal contains no edits to apply.")
    if len(changes) > MAX_SELECTED_FILES:
        raise TemporaryProjectError("A temporary-project proposal may change at most six files.")

    root = _project_directory(project_id)
    checkpoint_id = uuid.uuid4().hex
    staged: list[tuple[Path, str, str]] = []
    seen: set[str] = set()
    for change in changes:
        path_value = str(change.get("path") or "")
        operation = str(change.get("operation") or "replace")
        find = str(change.get("find") or "")
        replace = str(change.get("replace") or "")
        if path_value in seen:
            raise TemporaryProjectError("Each file may be changed only once per proposal.")
        seen.add(path_value)
        if operation != "replace":
            raise TemporaryProjectError("Temporary Project Mode supports replacements in uploaded files only.")
        path = _resolve_file(project_id, path_value, must_exist=True)
        original = path.read_text(encoding="utf-8", errors="replace")
        if not find or original.count(find) != 1:
            raise TemporaryProjectError("The proposed original text no longer matches the temporary project exactly. Refresh the proposal.")
        updated = original.replace(find, replace, 1)
        if len(updated.encode("utf-8")) > MAX_FILE_BYTES:
            raise TemporaryProjectError("The resulting file would be too large for Temporary Project Mode.")
        staged.append((path, original, updated))

    for path, original, _updated in staged:
        backup = _checkpoint_path(project_id, checkpoint_id, path.relative_to(root).as_posix())
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_text(original, encoding="utf-8")

    temporary_files: list[tuple[Path, Path]] = []
    try:
        for path, _original, updated in staged:
            temporary = path.with_suffix(path.suffix + ".mavis-tmp")
            temporary.write_text(updated, encoding="utf-8")
            temporary_files.append((path, temporary))
        for path, temporary in temporary_files:
            temporary.replace(path)
    except OSError as error:
        for _path, temporary in temporary_files:
            temporary.unlink(missing_ok=True)
        for path, original, _updated in staged:
            path.write_text(original, encoding="utf-8")
        raise TemporaryProjectError("Mavis could not safely apply every temporary-project change, so the upload was restored.") from error

    return {
        "checkpoint_id": checkpoint_id,
        "changed_files": [path.relative_to(root).as_posix() for path, _, _ in staged],
    }


def rollback_checkpoint(project_id: str, checkpoint_id: str, changed_files: Iterable[str]) -> list[str]:
    root = _project_directory(project_id)
    restored: list[str] = []
    for value in changed_files:
        path = _resolve_file(project_id, str(value), must_exist=False)
        backup = _checkpoint_path(project_id, checkpoint_id, str(value))
        if not backup.exists():
            raise TemporaryProjectError("The requested checkpoint is no longer available.")
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(backup, path)
        restored.append(path.relative_to(root).as_posix())
    return restored


def verify_project(project_id: str, command_id: str) -> dict[str, object]:
    files = list_project_files(project_id)
    if command_id == "project_scan":
        total = sum(int(item["size"]) for item in files)
        return {
            "command": command_id,
            "label": "Scan temporary project",
            "success": True,
            "exit_code": 0,
            "output": f"Temporary project contains {len(files)} supported source files ({total:,} bytes). No executable commands were run.",
        }
    if command_id == "json_validate":
        json_files = [item for item in files if str(item["path"]).lower().endswith(".json")]
        if not json_files:
            return {
                "command": command_id,
                "label": "Validate JSON files",
                "success": True,
                "exit_code": 0,
                "output": "No JSON files were included in this temporary project.",
            }
        invalid: list[str] = []
        root = _project_directory(project_id)
        for item in json_files:
            path = root / str(item["path"])
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                invalid.append(str(item["path"]))
        return {
            "command": command_id,
            "label": "Validate JSON files",
            "success": not invalid,
            "exit_code": 0 if not invalid else 1,
            "output": "All uploaded JSON files are valid." if not invalid else f"Invalid JSON: {', '.join(invalid)}",
        }
    raise TemporaryProjectError("That temporary-project verification check is not allowed.")


def export_project(project_id: str) -> bytes:
    root = _project_directory(project_id)
    stream = BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for item in list_project_files(project_id):
            relative = str(item["path"])
            archive.write(root / relative, arcname=relative)
    return stream.getvalue()


def delete_project(project_id: str) -> None:
    root = _project_directory(project_id)
    shutil.rmtree(root, ignore_errors=True)


def cleanup_expired_projects(ttl_seconds: int) -> list[str]:
    if not TEMP_PROJECT_ROOT.exists():
        return []
    cutoff = time.time() - ttl_seconds
    removed: list[str] = []
    for directory in TEMP_PROJECT_ROOT.iterdir():
        if not directory.is_dir() or not directory.name.startswith("temp_"):
            continue
        try:
            if directory.stat().st_mtime < cutoff:
                shutil.rmtree(directory, ignore_errors=True)
                removed.append(directory.name)
        except OSError:
            continue
    return removed
