"""Constrained local workspace operations used by Mavis Coding Mode.

This module deliberately exposes a small, owner-only capability set. It never accepts
absolute paths, refuses secrets and dependency folders, and only runs a short list of
verification commands. The chat model proposes patches; it never receives direct shell
access.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = Path(os.environ.get("CODE_WORKSPACE_ROOT", BASE_DIR)).expanduser().resolve()
MAX_FILE_BYTES = 80_000
MAX_CONTEXT_BYTES = 24_000
MAX_SELECTED_FILES = 6
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
    "uploads",
    "temporary_projects",
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


class WorkspaceError(ValueError):
    """Raised for a request that falls outside Mavis's allowed coding workspace."""


def workspace_enabled() -> bool:
    """Require an explicit deployment opt-in before source access is exposed."""
    return os.environ.get("CODE_WORKSPACE_ENABLED", "false").strip().lower() == "true"


def _relative_path(value: str) -> Path:
    raw = (value or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or raw.startswith("~") or "\x00" in raw:
        raise WorkspaceError("Choose a valid project-relative file path.")
    candidate = Path(raw)
    if any(part in {"", ".", ".."} for part in candidate.parts):
        raise WorkspaceError("File paths must stay inside the project workspace.")
    if candidate.name.lower() in BLOCKED_FILENAMES or candidate.suffix.lower() == ".env":
        raise WorkspaceError("Mavis never reads or edits secret environment files.")
    if any(part.lower() in IGNORED_DIRS for part in candidate.parts):
        raise WorkspaceError("That folder is excluded from Coding Mode.")
    if candidate.suffix.lower() not in ALLOWED_SUFFIXES:
        raise WorkspaceError("That file type is not available in Coding Mode.")
    return candidate


def resolve_workspace_file(value: str, *, must_exist: bool = True) -> Path:
    relative = _relative_path(value)
    path = (WORKSPACE_ROOT / relative).resolve()
    try:
        path.relative_to(WORKSPACE_ROOT)
    except ValueError as error:
        raise WorkspaceError("File paths must stay inside the project workspace.") from error
    if must_exist and (not path.exists() or not path.is_file()):
        raise WorkspaceError("That project file does not exist.")
    if path.exists() and path.stat().st_size > MAX_FILE_BYTES:
        raise WorkspaceError("That project file is too large for a focused coding task.")
    return path


def list_workspace_files() -> list[dict[str, object]]:
    if not WORKSPACE_ROOT.exists():
        raise WorkspaceError("The configured coding workspace is unavailable.")
    results: list[dict[str, object]] = []
    for path in WORKSPACE_ROOT.rglob("*"):
        if not path.is_file():
            continue
        try:
            relative = path.relative_to(WORKSPACE_ROOT)
        except ValueError:
            continue
        if any(part.lower() in IGNORED_DIRS for part in relative.parts):
            continue
        if path.name.lower() in BLOCKED_FILENAMES or path.suffix.lower() == ".env":
            continue
        if path.suffix.lower() not in ALLOWED_SUFFIXES or path.stat().st_size > MAX_FILE_BYTES:
            continue
        results.append({"path": relative.as_posix(), "size": path.stat().st_size})
    return sorted(results, key=lambda item: str(item["path"]).lower())[:500]


def read_workspace_file(value: str) -> dict[str, object]:
    path = resolve_workspace_file(value)
    return {
        "path": path.relative_to(WORKSPACE_ROOT).as_posix(),
        "content": path.read_text(encoding="utf-8", errors="replace"),
        "size": path.stat().st_size,
    }


def read_workspace_context(paths: Iterable[str]) -> list[dict[str, str]]:
    unique: list[str] = []
    for value in paths:
        if isinstance(value, str) and value not in unique:
            unique.append(value)
    if not unique:
        raise WorkspaceError("Select at least one project file before asking Mavis to edit code.")
    if len(unique) > MAX_SELECTED_FILES:
        raise WorkspaceError(f"Select no more than {MAX_SELECTED_FILES} files for one coding task.")

    total = 0
    context: list[dict[str, str]] = []
    for value in unique:
        item = read_workspace_file(value)
        text = str(item["content"])
        total += len(text.encode("utf-8"))
        if total > MAX_CONTEXT_BYTES:
            raise WorkspaceError("The selected files contain too much code for one plan. Choose one to three smaller, focused files.")
        context.append({"path": str(item["path"]), "content": text})
    return context


def _checkpoint_root() -> Path:
    return WORKSPACE_ROOT / ".mavis-checkpoints"


def _checkpoint_path(checkpoint_id: str, relative_path: str) -> Path:
    checkpoint_root = _checkpoint_root()
    target = (checkpoint_root / checkpoint_id / _relative_path(relative_path)).resolve()
    try:
        target.relative_to(checkpoint_root.resolve())
    except ValueError as error:
        raise WorkspaceError("Invalid checkpoint path.") from error
    return target


def apply_changes(changes: list[dict[str, str]]) -> dict[str, object]:
    """Apply exact-match replacements with a checkpoint and all-or-revert writes."""
    if not changes:
        raise WorkspaceError("The proposal contains no edits to apply.")
    if len(changes) > 12:
        raise WorkspaceError("A proposal may change at most 12 files.")

    checkpoint_id = uuid.uuid4().hex
    staged: list[tuple[Path, str, str]] = []
    seen_paths: set[str] = set()
    for change in changes:
        path_value = str(change.get("path") or "")
        operation = str(change.get("operation") or "replace")
        find = str(change.get("find") or "")
        replace = str(change.get("replace") or "")
        if path_value in seen_paths:
            raise WorkspaceError("Each file may be changed only once per proposal.")
        seen_paths.add(path_value)
        if operation != "replace":
            raise WorkspaceError("Initial Coding Mode supports replacements in existing source files only.")
        path = resolve_workspace_file(path_value, must_exist=True)
        original = path.read_text(encoding="utf-8", errors="replace")
        if not find:
            raise WorkspaceError("A replacement proposal must include the original exact text.")
        occurrences = original.count(find)
        if occurrences != 1:
            raise WorkspaceError("The proposed original text no longer matches the workspace exactly. Refresh the proposal.")
        updated = original.replace(find, replace, 1)
        if len(updated.encode("utf-8")) > MAX_FILE_BYTES:
            raise WorkspaceError("The resulting file would be too large for Coding Mode.")
        staged.append((path, original, updated))

    for path, original, _updated in staged:
        backup = _checkpoint_path(checkpoint_id, path.relative_to(WORKSPACE_ROOT).as_posix())
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_text(original, encoding="utf-8")

    temporary_files: list[tuple[Path, Path]] = []
    try:
        for path, _original, updated in staged:
            path.parent.mkdir(parents=True, exist_ok=True)
            temporary = path.with_suffix(path.suffix + ".mavis-tmp")
            temporary.write_text(updated, encoding="utf-8")
            temporary_files.append((path, temporary))
        for path, temporary in temporary_files:
            temporary.replace(path)
    except OSError as error:
        for _path, temporary in temporary_files:
            if temporary.exists():
                temporary.unlink(missing_ok=True)
        for path, original, _updated in staged:
            path.write_text(original, encoding="utf-8")
        raise WorkspaceError("Mavis could not safely apply every change, so the workspace was restored.") from error

    return {
        "checkpoint_id": checkpoint_id,
        "changed_files": [path.relative_to(WORKSPACE_ROOT).as_posix() for path, _, _ in staged],
    }


def rollback_checkpoint(checkpoint_id: str, changed_files: Iterable[str]) -> list[str]:
    if not checkpoint_id or not checkpoint_id.isalnum():
        raise WorkspaceError("Invalid checkpoint identifier.")
    restored: list[str] = []
    for value in changed_files:
        path = resolve_workspace_file(str(value), must_exist=False)
        backup = _checkpoint_path(checkpoint_id, str(value))
        if not backup.exists():
            raise WorkspaceError("The requested checkpoint is no longer available.")
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(backup, path)
        restored.append(path.relative_to(WORKSPACE_ROOT).as_posix())
    return restored


def run_verification(command_id: str) -> dict[str, object]:
    commands: dict[str, tuple[list[str], Path, int, str]] = {
        "frontend_build": (["npm", "run", "build"], WORKSPACE_ROOT / "frontend", 90, "Build the React frontend"),
        "backend_tests": ([sys.executable, "test_mavis_core.py"], WORKSPACE_ROOT, 60, "Run the backend smoke tests"),
        "deployment_tests": ([sys.executable, "test_deployment_smoke.py"], WORKSPACE_ROOT, 60, "Run deployment smoke tests"),
    }
    if command_id not in commands:
        raise WorkspaceError("That verification command is not allowed.")
    command, cwd, timeout, label = commands[command_id]
    if not cwd.exists():
        raise WorkspaceError("The selected verification workspace is unavailable.")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )
        output = ((result.stdout or "") + ("\n" if result.stdout and result.stderr else "") + (result.stderr or "")).strip()
        return {
            "command": command_id,
            "label": label,
            "success": result.returncode == 0,
            "exit_code": result.returncode,
            "output": output[-MAX_OUTPUT_CHARS:] or "Command completed without output.",
        }
    except subprocess.TimeoutExpired:
        return {
            "command": command_id,
            "label": label,
            "success": False,
            "exit_code": None,
            "output": f"Verification timed out after {timeout} seconds.",
        }


def cleanup_checkpoint(checkpoint_id: str) -> None:
    directory = (_checkpoint_root() / checkpoint_id).resolve()
    if directory.exists() and directory.is_dir():
        shutil.rmtree(directory, ignore_errors=True)
