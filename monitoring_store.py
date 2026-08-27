"""Private, privacy-preserving operational telemetry for Mavis.

This module deliberately stores only aggregate-friendly signals. It never persists chat
content, filenames, passkeys, IP addresses, user-agent strings, or raw visitor IDs.
"""

import hashlib
import hmac
import json
import os
import sqlite3
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
SQLITE_PATH = Path(__file__).resolve().parent / "mavis_monitoring.db"
RETENTION_DAYS = max(7, min(365, int(os.environ.get("MONITORING_RETENTION_DAYS", "90"))))
_HASH_SECRET = (
    os.environ.get("MONITORING_HASH_SECRET")
    or os.environ.get("SESSION_SECRET")
    or "mavis-local-monitoring-only"
)


def _postgres_enabled() -> bool:
    return DATABASE_URL.startswith(("postgres://", "postgresql://"))


def _postgres_connection():
    try:
        import psycopg2
    except ImportError as error:  # pragma: no cover - deployment dependency
        raise RuntimeError("Postgres support requires psycopg2-binary.") from error
    return psycopg2.connect(DATABASE_URL, connect_timeout=5)


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _utc_day() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _visitor_hash(visitor_id: str) -> str | None:
    """Return a non-reversible, installation-scoped anonymous visitor token."""
    cleaned = (visitor_id or "").strip()
    if not cleaned:
        return None
    return hmac.new(
        _HASH_SECRET.encode("utf-8"), cleaned.encode("utf-8"), hashlib.sha256
    ).hexdigest()[:32]


def _safe_metadata(metadata: dict[str, Any] | None) -> str:
    """Keep a small allowlisted metadata record, never arbitrary client payloads."""
    safe = {
        key: str(value)[:80]
        for key, value in (metadata or {}).items()
        if key in {"status", "provider", "reason", "surface"}
        and isinstance(value, (str, int, float, bool))
    }
    return json.dumps(safe, separators=(",", ":")) if safe else "{}"


def _cleanup_sqlite(connection: sqlite3.Connection) -> None:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)).isoformat()
    connection.execute("DELETE FROM mavis_monitoring_events WHERE occurred_at < ?", (cutoff,))


def _cleanup_postgres(cursor) -> None:
    cursor.execute(
        "DELETE FROM mavis_monitoring_events WHERE occurred_at < NOW() - (%s * INTERVAL '1 day')",
        (RETENTION_DAYS,),
    )


def init() -> None:
    """Initialize the telemetry schema without ever blocking Mavis startup."""
    try:
        if _postgres_enabled():
            with _postgres_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS mavis_monitoring_events (
                            id BIGSERIAL PRIMARY KEY,
                            occurred_at TIMESTAMPTZ NOT NULL,
                            day DATE NOT NULL,
                            event_type TEXT NOT NULL,
                            visitor_hash TEXT,
                            route TEXT NOT NULL DEFAULT '',
                            outcome TEXT NOT NULL DEFAULT '',
                            metadata JSONB NOT NULL DEFAULT '{}'::jsonb
                        )
                        """
                    )
                    cursor.execute(
                        "CREATE INDEX IF NOT EXISTS idx_mavis_monitoring_day ON mavis_monitoring_events(day)"
                    )
                    cursor.execute(
                        "CREATE INDEX IF NOT EXISTS idx_mavis_monitoring_type ON mavis_monitoring_events(event_type)"
                    )
                    _cleanup_postgres(cursor)
            return

        with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS mavis_monitoring_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    occurred_at TEXT NOT NULL,
                    day TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    visitor_hash TEXT,
                    route TEXT NOT NULL DEFAULT '',
                    outcome TEXT NOT NULL DEFAULT '',
                    metadata TEXT NOT NULL DEFAULT '{}'
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_mavis_monitoring_day ON mavis_monitoring_events(day)"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_mavis_monitoring_type ON mavis_monitoring_events(event_type)"
            )
            _cleanup_sqlite(connection)
    except Exception as error:  # Monitoring must remain fail-open.
        print(f"WARNING: Mavis monitoring storage is unavailable: {error}")


def record_event(
    event_type: str,
    *,
    visitor_id: str = "",
    route: str = "",
    outcome: str = "",
    metadata: dict[str, Any] | None = None,
) -> None:
    """Store one safe operational signal. Failures never affect chat availability."""
    try:
        visitor_hash = _visitor_hash(visitor_id)
        occurred_at = _timestamp()
        values = (
            occurred_at,
            _utc_day(),
            event_type[:48],
            visitor_hash,
            route[:120],
            outcome[:80],
            _safe_metadata(metadata),
        )
        if _postgres_enabled():
            with _postgres_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO mavis_monitoring_events
                        (occurred_at, day, event_type, visitor_hash, route, outcome, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                        """,
                        values,
                    )
            return

        with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
            connection.execute(
                """
                INSERT INTO mavis_monitoring_events
                (occurred_at, day, event_type, visitor_hash, route, outcome, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                values,
            )
    except Exception as error:  # Monitoring must never interrupt a visitor request.
        print(f"WARNING: Mavis monitoring event could not be stored: {error}")


def _empty_daily(days: int) -> list[dict[str, int | str]]:
    today = datetime.now(timezone.utc).date()
    return [
        {
            "day": (today - timedelta(days=offset)).isoformat(),
            "visitors": 0,
            "page_views": 0,
            "chat_requests": 0,
            "completed_chats": 0,
            "errors": 0,
        }
        for offset in range(days - 1, -1, -1)
    ]


def _normalize_daily(rows: list[tuple], days: int) -> list[dict[str, int | str]]:
    daily = {item["day"]: item for item in _empty_daily(days)}
    for row in rows:
        day = str(row[0])[:10]
        if day not in daily:
            continue
        daily[day].update(
            {
                "visitors": int(row[1] or 0),
                "page_views": int(row[2] or 0),
                "chat_requests": int(row[3] or 0),
                "completed_chats": int(row[4] or 0),
                "errors": int(row[5] or 0),
            }
        )
    return list(daily.values())


def _summary_from_row(row: tuple) -> dict[str, int | float]:
    unique_visitors = int(row[0] or 0)
    page_views = int(row[1] or 0)
    chat_requests = int(row[2] or 0)
    completed_chats = int(row[3] or 0)
    demo_limit_hits = int(row[4] or 0)
    client_errors = int(row[5] or 0)
    server_errors = int(row[6] or 0)
    provider_fallbacks = int(row[7] or 0)
    return {
        "unique_visitors": unique_visitors,
        "page_views": page_views,
        "chat_requests": chat_requests,
        "completed_chats": completed_chats,
        "demo_limit_hits": demo_limit_hits,
        "client_errors": client_errors,
        "server_errors": server_errors,
        "provider_fallbacks": provider_fallbacks,
        "errors": client_errors + server_errors,
        "chat_completion_rate": round((completed_chats / chat_requests) * 100, 1)
        if chat_requests
        else 0.0,
    }


def overview(days: int = 7) -> dict[str, Any]:
    """Return owner-safe aggregates; never return IDs, messages, or error text."""
    days = max(1, min(90, int(days)))
    cutoff_day = (date.today() - timedelta(days=days - 1)).isoformat()
    try:
        if _postgres_enabled():
            with _postgres_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT
                            COUNT(DISTINCT visitor_hash) FILTER (WHERE visitor_hash IS NOT NULL),
                            COUNT(*) FILTER (WHERE event_type = 'page_view'),
                            COUNT(*) FILTER (WHERE event_type = 'chat_request'),
                            COUNT(*) FILTER (WHERE event_type = 'chat_completed'),
                            COUNT(*) FILTER (WHERE event_type = 'demo_limit_reached'),
                            COUNT(*) FILTER (WHERE event_type = 'client_error'),
                            COUNT(*) FILTER (WHERE event_type IN ('server_error', 'request_failed')),
                            COUNT(*) FILTER (WHERE event_type = 'provider_fallback')
                        FROM mavis_monitoring_events
                        WHERE day >= %s
                        """,
                        (cutoff_day,),
                    )
                    summary = _summary_from_row(cursor.fetchone())
                    cursor.execute(
                        """
                        SELECT
                            day::text,
                            COUNT(DISTINCT visitor_hash) FILTER (WHERE visitor_hash IS NOT NULL),
                            COUNT(*) FILTER (WHERE event_type = 'page_view'),
                            COUNT(*) FILTER (WHERE event_type = 'chat_request'),
                            COUNT(*) FILTER (WHERE event_type = 'chat_completed'),
                            COUNT(*) FILTER (WHERE event_type IN ('client_error', 'server_error', 'request_failed'))
                        FROM mavis_monitoring_events
                        WHERE day >= %s
                        GROUP BY day
                        ORDER BY day ASC
                        """,
                        (cutoff_day,),
                    )
                    daily = _normalize_daily(cursor.fetchall(), days)
                    cursor.execute(
                        """
                        SELECT occurred_at::text, event_type, route, outcome
                        FROM mavis_monitoring_events
                        WHERE day >= %s
                          AND event_type IN ('client_error', 'server_error', 'request_failed', 'provider_fallback')
                        ORDER BY occurred_at DESC
                        LIMIT 20
                        """,
                        (cutoff_day,),
                    )
                    signals = [
                        {
                            "occurred_at": str(item[0]),
                            "event_type": item[1],
                            "route": item[2],
                            "outcome": item[3],
                        }
                        for item in cursor.fetchall()
                    ]
        else:
            with sqlite3.connect(SQLITE_PATH, timeout=10) as connection:
                summary_query = """
                    SELECT
                        COUNT(DISTINCT CASE WHEN visitor_hash IS NOT NULL THEN visitor_hash END),
                        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'chat_request' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'chat_completed' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'demo_limit_reached' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'client_error' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type IN ('server_error', 'request_failed') THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'provider_fallback' THEN 1 ELSE 0 END)
                    FROM mavis_monitoring_events
                    WHERE day >= ?
                """
                summary = _summary_from_row(connection.execute(summary_query, (cutoff_day,)).fetchone())
                daily_query = """
                    SELECT
                        day,
                        COUNT(DISTINCT CASE WHEN visitor_hash IS NOT NULL THEN visitor_hash END),
                        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'chat_request' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type = 'chat_completed' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN event_type IN ('client_error', 'server_error', 'request_failed') THEN 1 ELSE 0 END)
                    FROM mavis_monitoring_events
                    WHERE day >= ?
                    GROUP BY day
                    ORDER BY day ASC
                """
                daily = _normalize_daily(connection.execute(daily_query, (cutoff_day,)).fetchall(), days)
                signals_query = """
                    SELECT occurred_at, event_type, route, outcome
                    FROM mavis_monitoring_events
                    WHERE day >= ?
                      AND event_type IN ('client_error', 'server_error', 'request_failed', 'provider_fallback')
                    ORDER BY occurred_at DESC
                    LIMIT 20
                """
                signals = [
                    {
                        "occurred_at": str(item[0]),
                        "event_type": item[1],
                        "route": item[2],
                        "outcome": item[3],
                    }
                    for item in connection.execute(signals_query, (cutoff_day,)).fetchall()
                ]
    except Exception as error:
        print(f"WARNING: Mavis monitoring overview is unavailable: {error}")
        summary = _summary_from_row((0, 0, 0, 0, 0, 0, 0, 0))
        daily = _empty_daily(days)
        signals = []

    return {
        "range_days": days,
        "storage": "postgres" if _postgres_enabled() else "sqlite-fallback",
        "summary": summary,
        "daily": daily,
        "recent_signals": signals,
        "privacy": {
            "visitor_identity": "Anonymous, non-reversible installation-scoped identifiers only",
            "message_content": "Never collected",
            "ip_addresses": "Never collected",
            "retention_days": RETENTION_DAYS,
        },
    }


def backend_name() -> str:
    return "postgres" if _postgres_enabled() else "sqlite-fallback"
