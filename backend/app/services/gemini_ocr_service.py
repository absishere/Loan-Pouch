import base64
import logging
from typing import Any

import requests

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _extract_json_block(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    return cleaned


def _build_prompt(doc_type: str) -> str:
    if doc_type == "aadhaar":
        return (
            "Extract Aadhaar details as strict JSON with keys: "
            "name, dob, documentNumber, documentType. "
            "documentType must be 'Aadhar'. If missing field use empty string."
        )
    return (
        "Extract PAN card details as strict JSON with keys: "
        "name, dob, documentNumber, documentType. "
        "documentType must be 'PAN'. If missing field use empty string."
    )


def extract_document_with_gemini(image_bytes: bytes, mime_type: str, doc_type: str) -> dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing on backend")

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": _build_prompt(doc_type)},
                    {"inline_data": {"mime_type": mime_type, "data": b64}},
                ]
            }
        ]
    }
    resp = requests.post(url, json=payload, timeout=30)
    if resp.status_code >= 400:
        logger.error("Gemini OCR request failed: %s %s", resp.status_code, resp.text)
        raise ValueError("Gemini OCR request failed")

    data = resp.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("No Gemini OCR candidates")

    text = (
        candidates[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )
    if not text:
        raise ValueError("Empty Gemini OCR response")

    import json

    parsed = json.loads(_extract_json_block(text))
    return {
        "name": parsed.get("name", ""),
        "dob": parsed.get("dob", ""),
        "documentNumber": parsed.get("documentNumber", ""),
        "documentType": parsed.get("documentType", "Aadhar" if doc_type == "aadhaar" else "PAN"),
        "source": "gemini_backend",
    }
