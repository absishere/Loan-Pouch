import json
import threading
from copy import deepcopy
from pathlib import Path
from typing import Any


_LOCK = threading.Lock()
_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
_STATE_FILE = _DATA_DIR / "loan_state.json"

_DEFAULT_STATE = {
    "loans": [],
    "events": [],
}


def _ensure_store() -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not _STATE_FILE.exists():
        _STATE_FILE.write_text(json.dumps(_DEFAULT_STATE, indent=2), encoding="utf-8")


def _read_state_unlocked() -> dict[str, Any]:
    _ensure_store()
    try:
        raw = _STATE_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)
        if not isinstance(data, dict):
            return deepcopy(_DEFAULT_STATE)
        data.setdefault("loans", [])
        data.setdefault("events", [])
        return data
    except Exception:
        return deepcopy(_DEFAULT_STATE)


def _write_state_unlocked(state: dict[str, Any]) -> None:
    _ensure_store()
    _STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def load_state() -> dict[str, Any]:
    with _LOCK:
        return _read_state_unlocked()


def save_state(state: dict[str, Any]) -> None:
    with _LOCK:
        _write_state_unlocked(state)


def add_event(event_type: str, payload: dict[str, Any]) -> None:
    with _LOCK:
        state = _read_state_unlocked()
        events = state.get("events", [])
        events.append(
            {
                "type": event_type,
                "payload": payload,
            }
        )
        state["events"] = events[-1000:]
        _write_state_unlocked(state)
