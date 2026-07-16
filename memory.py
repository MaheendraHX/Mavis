import sqlite3
import json
from datetime import datetime

DB_PATH = "aria_memory.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT,
            user_type TEXT,
            guest_id TEXT DEFAULT 'anonymous',
            created_at TEXT
        )
    """)

    # Add guest_id column if it doesn't exist (for existing databases)
    try:
        cursor.execute("ALTER TABLE conversations ADD COLUMN guest_id TEXT DEFAULT 'anonymous'")
    except sqlite3.OperationalError:
        pass  # Column already exists

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT,
            updated_at TEXT
        )
    """)

    conn.commit()
    conn.close()

def create_conversation(conv_id, title, user_type, guest_id="anonymous"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO conversations (id, title, user_type, guest_id, created_at) VALUES (?, ?, ?, ?, ?)",
        (conv_id, title, user_type, guest_id, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def update_conversation_title(conv_id, title):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE conversations SET title = ? WHERE id = ?", (title, conv_id))
    conn.commit()
    conn.close()

def add_message(conv_id, role, content):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (conv_id, role, content, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def get_conversation_messages(conv_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC",
        (conv_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in rows]

def has_messages(conv_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM messages WHERE conversation_id = ? LIMIT 1", (conv_id,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

def get_all_conversations(user_type=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if user_type:
        cursor.execute(
            "SELECT id, title, created_at FROM conversations WHERE user_type = ? ORDER BY created_at DESC",
            (user_type,)
        )
    else:
        cursor.execute("SELECT id, title, created_at FROM conversations ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "created_at": r[2]} for r in rows]


def get_all_conversations_for_guest(guest_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title, created_at FROM conversations WHERE guest_id = ? ORDER BY created_at DESC",
        (guest_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "created_at": r[2]} for r in rows]


def conversation_belongs_to_guest(conv_id, guest_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM conversations WHERE id = ? AND guest_id = ?",
        (conv_id, guest_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None

def delete_conversation(conv_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
    cursor.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
    conn.commit()
    conn.close()

def set_memory(key, value):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO memories (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?",
        (key, value, datetime.now().isoformat(), value, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def get_memory(key):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM memories WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def get_all_memories():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM memories")
    rows = cursor.fetchall()
    conn.close()
    return {r[0]: r[1] for r in rows}