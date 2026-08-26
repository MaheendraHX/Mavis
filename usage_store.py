import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
SQLITE_PATH = Path(__file__).resolve().parent / "mavis_usage.db"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _postgres_enabled() -> bool:
    return DATABASE_URL.startswith(("postgres://", "postgresql://"))


def _postgres_connection():
    try:
        import psycopg2
    except ImportError as error:  # pragma: no cover - installation is verified in deployment
        raise RuntimeError("Postgres support requires psycopg2-binary.") from error
    return psycopg2.connect(DATABASE_URL, connect_timeout=5)


def init() -> None:
    if _postgres_enabled():
        with _postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS mavis_guest_usage (
                        guest_id TEXT PRIMARY KEY,
                        message_count INTEGER NOT NULL DEFAULT 0,
                        updated_at TIMESTAMPTZ NOT NULL
                    )
                    """
                )
        return

    with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS mavis_guest_usage (
                guest_id TEXT PRIMARY KEY,
                message_count INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            )
            """
        )


def get_count(guest_id: str) -> int:
    if _postgres_enabled():
        with _postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT message_count FROM mavis_guest_usage WHERE guest_id = %s", (guest_id,))
                row = cursor.fetchone()
        return int(row[0]) if row else 0

    with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
        row = connection.execute(
            "SELECT message_count FROM mavis_guest_usage WHERE guest_id = ?", (guest_id,)
        ).fetchone()
    return int(row[0]) if row else 0


def increment(guest_id: str) -> int:
    if _postgres_enabled():
        with _postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO mavis_guest_usage (guest_id, message_count, updated_at)
                    VALUES (%s, 1, NOW())
                    ON CONFLICT (guest_id) DO UPDATE SET
                        message_count = mavis_guest_usage.message_count + 1,
                        updated_at = NOW()
                    RETURNING message_count
                    """,
                    (guest_id,),
                )
                count = cursor.fetchone()[0]
        return int(count)

    with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
        connection.execute(
            """
            INSERT INTO mavis_guest_usage (guest_id, message_count, updated_at)
            VALUES (?, 1, ?)
            ON CONFLICT(guest_id) DO UPDATE SET
                message_count = message_count + 1,
                updated_at = excluded.updated_at
            """,
            (guest_id, _now()),
        )
        row = connection.execute(
            "SELECT message_count FROM mavis_guest_usage WHERE guest_id = ?", (guest_id,)
        ).fetchone()
    return int(row[0])


def backend_name() -> str:
    return "postgres" if _postgres_enabled() else "sqlite-fallback"
