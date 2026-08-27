"""Fail-open Telegram notifications for serious Mavis operational errors."""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

_COOLDOWN_SECONDS = max(
    60,
    min(86400, int(os.environ.get("TELEGRAM_ALERT_COOLDOWN_SECONDS", "900"))),
)
_alert_lock = threading.Lock()
_last_sent: dict[str, float] = {}


def configured() -> bool:
    """Return whether Telegram alerts are explicitly enabled and configured."""
    return (
        os.environ.get("TELEGRAM_ALERTS_ENABLED", "false").strip().lower()
        in {"1", "true", "yes", "on"}
        and bool(os.environ.get("TELEGRAM_BOT_TOKEN", "").strip())
        and bool(os.environ.get("TELEGRAM_CHAT_ID", "").strip())
    )


def _message(event_type: str, route: str, outcome: str) -> str:
    occurred_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return (
        "MAVIS ALERT\n"
        f"Type: {event_type}\n"
        f"Route: {route}\n"
        f"Signal: {outcome}\n"
        f"Time: {occurred_at}\n\n"
        "Open the owner Monitoring desk for more context."
    )


def _send(event_type: str, route: str, outcome: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat_id:
        return

    payload = json.dumps(
        {"chat_id": chat_id, "text": _message(event_type, route, outcome)}
    ).encode("utf-8")
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            if response.status >= 400:
                raise RuntimeError(f"Telegram returned HTTP {response.status}")
    except (OSError, RuntimeError, urllib.error.URLError) as error:
        # Alerts must never turn a Mavis failure into a second visitor-facing failure.
        print(f"WARNING: Telegram alert delivery failed: {error}")


def notify_error(event_type: str, route: str, outcome: str) -> None:
    """Send one deduplicated alert in the background when alerts are configured."""
    if not configured():
        return

    signature = f"{event_type}:{route}:{outcome}"
    now = time.monotonic()
    with _alert_lock:
        previous = _last_sent.get(signature, 0.0)
        if now - previous < _COOLDOWN_SECONDS:
            return
        _last_sent[signature] = now

    threading.Thread(
        target=_send,
        args=(event_type, route, outcome),
        daemon=True,
        name="mavis-telegram-alert",
    ).start()
