import sqlite3
from datetime import datetime, timezone
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "aria_memory.db"


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with _connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                user_type TEXT NOT NULL DEFAULT 'guest',
                guest_id TEXT NOT NULL DEFAULT 'anonymous',
                created_at TEXT NOT NULL
            )
            """
        )
        try:
            connection.execute("ALTER TABLE conversations ADD COLUMN guest_id TEXT DEFAULT 'anonymous'")
        except sqlite3.OperationalError:
            pass
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS guest_usage (
                guest_id TEXT PRIMARY KEY,
                message_count INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_conversations_guest_id ON conversations(guest_id, created_at DESC)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, id)"
        )


def create_conversation(conv_id: str, title: str, user_type: str, guest_id: str = "anonymous") -> None:
    with _connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO conversations (id, title, user_type, guest_id, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (conv_id, title, user_type, guest_id, _timestamp()),
        )


def update_conversation_title(conv_id: str, title: str) -> None:
    with _connection() as connection:
        connection.execute("UPDATE conversations SET title = ? WHERE id = ?", (title, conv_id))


def add_message(conv_id: str, role: str, content: str) -> None:
    with _connection() as connection:
        connection.execute(
            """
            INSERT INTO messages (conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (conv_id, role, content, _timestamp()),
        )


def get_conversation_messages(conv_id: str, limit: int | None = None) -> list[dict[str, str]]:
    with _connection() as connection:
        if limit is None:
            rows = connection.execute(
                "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC",
                (conv_id,),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT role, content FROM (
                    SELECT id, role, content FROM messages
                    WHERE conversation_id = ?
                    ORDER BY id DESC
                    LIMIT ?
                ) ORDER BY id ASC
                """,
                (conv_id, limit),
            ).fetchall()
    return [{"role": role, "content": content} for role, content in rows]


def has_messages(conv_id: str) -> bool:
    with _connection() as connection:
        row = connection.execute(
            "SELECT 1 FROM messages WHERE conversation_id = ? LIMIT 1", (conv_id,)
        ).fetchone()
    return row is not None


def get_all_conversations_for_guest(guest_id: str) -> list[dict[str, str]]:
    with _connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, created_at FROM conversations
            WHERE guest_id = ? AND user_type = 'guest'
            ORDER BY created_at DESC
            """,
            (guest_id,),
        ).fetchall()
    return [{"id": row[0], "title": row[1], "created_at": row[2]} for row in rows]


def get_all_owner_conversations() -> list[dict[str, str]]:
    with _connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, created_at FROM conversations
            WHERE user_type = 'owner'
            ORDER BY created_at DESC
            """
        ).fetchall()
    return [{"id": row[0], "title": row[1], "created_at": row[2]} for row in rows]


def conversation_belongs_to_guest(conv_id: str, guest_id: str) -> bool:
    with _connection() as connection:
        row = connection.execute(
            "SELECT 1 FROM conversations WHERE id = ? AND guest_id = ? AND user_type = 'guest'",
            (conv_id, guest_id),
        ).fetchone()
    return row is not None


def conversation_is_owner(conv_id: str) -> bool:
    with _connection() as connection:
        row = connection.execute(
            "SELECT 1 FROM conversations WHERE id = ? AND user_type = 'owner'", (conv_id,)
        ).fetchone()
    return row is not None


def delete_conversation(conv_id: str) -> None:
    with _connection() as connection:
        connection.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
        connection.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))


def get_guest_message_count(guest_id: str) -> int:
    with _connection() as connection:
        row = connection.execute(
            "SELECT message_count FROM guest_usage WHERE guest_id = ?", (guest_id,)
        ).fetchone()
    return int(row[0]) if row else 0


def increment_guest_message_count(guest_id: str) -> int:
    with _connection() as connection:
        connection.execute(
            """
            INSERT INTO guest_usage (guest_id, message_count, updated_at)
            VALUES (?, 1, ?)
            ON CONFLICT(guest_id) DO UPDATE SET
                message_count = message_count + 1,
                updated_at = excluded.updated_at
            """,
            (guest_id, _timestamp()),
        )
        row = connection.execute(
            "SELECT message_count FROM guest_usage WHERE guest_id = ?", (guest_id,)
        ).fetchone()
    return int(row[0])


def set_memory(key: str, value: str) -> None:
    with _connection() as connection:
        connection.execute(
            """
            INSERT INTO memories (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
            """,
            (key, value, _timestamp()),
        )


def get_memory(key: str) -> str | None:
    with _connection() as connection:
        row = connection.execute("SELECT value FROM memories WHERE key = ?", (key,)).fetchone()
    return row[0] if row else None


def get_all_memories() -> dict[str, str]:
    with _connection() as connection:
        rows = connection.execute("SELECT key, value FROM memories").fetchall()
    return {key: value for key, value in rows}
