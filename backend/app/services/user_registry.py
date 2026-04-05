import hashlib
import json
import threading
from pathlib import Path
from typing import Any


_LOCK = threading.Lock()
_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
_USERS_FILE = _DATA_DIR / "users_registry.json"

_DEFAULT = {"users": []}


def _ensure_store() -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not _USERS_FILE.exists():
        _USERS_FILE.write_text(json.dumps(_DEFAULT, indent=2), encoding="utf-8")


def _read_unlocked() -> dict[str, Any]:
    _ensure_store()
    try:
        data = json.loads(_USERS_FILE.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return {"users": []}
        users = data.get("users")
        if not isinstance(users, list):
            data["users"] = []
        return data
    except Exception:
        return {"users": []}


def _write_unlocked(data: dict[str, Any]) -> None:
    _ensure_store()
    _USERS_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def normalize_phone(phone: str) -> str:
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) == 10:
        return f"91{digits}"
    return digits


def phone_hash(phone: str) -> str:
    return _sha256(normalize_phone(phone))


def doc_hash(name: str, dob: str, aadhaar: str, pan: str) -> str:
    canonical = "|".join(
        [
            (name or "").strip().lower(),
            "".join(ch for ch in (dob or "") if ch.isdigit()),
            "".join(ch for ch in (aadhaar or "") if ch.isdigit()),
            (pan or "").strip().upper(),
        ]
    )
    return _sha256(canonical)


def pin_hash(pin: str) -> str:
    return _sha256((pin or "").strip())


def find_by_phone_hash(p_hash: str) -> dict[str, Any] | None:
    with _LOCK:
        data = _read_unlocked()
        for user in data["users"]:
            if user.get("phone_hash") == p_hash:
                return user
    return None


def find_by_doc_hash(d_hash: str) -> dict[str, Any] | None:
    with _LOCK:
        data = _read_unlocked()
        for user in data["users"]:
            if user.get("doc_hash") == d_hash:
                return user
    return None


def register_user(record: dict[str, Any]) -> dict[str, Any]:
    with _LOCK:
        data = _read_unlocked()
        data["users"].append(record)
        _write_unlocked(data)
    return record


def update_user_wallet(phone_hash_value: str, new_wallet: str) -> dict[str, Any] | None:
    with _LOCK:
        data = _read_unlocked()
        for i, user in enumerate(data["users"]):
            if user.get("phone_hash") == phone_hash_value:
                user["wallet_address"] = new_wallet
                data["users"][i] = user
                _write_unlocked(data)
                return user
    return None


def find_by_wallet(wallet_address: str) -> dict[str, Any] | None:
    wallet_l = (wallet_address or "").lower()
    with _LOCK:
        data = _read_unlocked()
        for user in data["users"]:
            if str(user.get("wallet_address", "")).lower() == wallet_l:
                return user
    return None
