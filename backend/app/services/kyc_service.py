"""
KYC service — integration stubs for OCR and Face Matching.
These functions are designed so your team's ML engineer can drop their
implementation in directly without changing the API contract.

Current state:
  - extract_id_details()  → returns mock data / calls real EasyOCR model
  - match_face()          → returns mock result / calls real OpenCV model
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ── OCR Pipeline ──────────────────────────────────────────────────────────────

def extract_id_details(image_bytes: bytes, doc_type: str = "aadhaar") -> dict:
    """
    Extract identity details from an ID document image.

    Args:
        image_bytes: Raw bytes of the uploaded image (Aadhaar or PAN).
        doc_type: "aadhaar" | "pan"

    Returns:
        dict with extracted fields. User can correct these in the UI.

    TODO (ML Team): Replace the mock block below with actual EasyOCR pipeline.
    Example integration:
        import easyocr
        reader = easyocr.Reader(['en'])
        result = reader.readtext(image_bytes)
        # parse result → structured dict
    """
    logger.info(f"extract_id_details called for doc_type={doc_type}. Using MOCK data.")

    # ── MOCK RESPONSE (replace with real OCR) ──────────────────────────────
    if doc_type == "aadhaar":
        return {
            "name": "Rahul Sharma",
            "dob": "1998-05-12",
            "gender": "Male",
            "aadhaar_number": "XXXX XXXX 1234",  # masked for privacy
            "address": "123, MG Road, Bengaluru, Karnataka - 560001",
            "phone": "+919876543210",
        }
    elif doc_type == "pan":
        return {
            "name": "Rahul Sharma",
            "dob": "1998-05-12",
            "pan_number": "ABCDE1234F",
            "father_name": "Raj Sharma",
        }
    return {}
    # ── END MOCK ────────────────────────────────────────────────────────────


# ── Face Matching Pipeline ────────────────────────────────────────────────────

def match_face(document_image_bytes: bytes, selfie_image_bytes: bytes) -> dict:
    """
    Compare a live selfie against the document photo to confirm identity.

    Args:
        document_image_bytes: Face cropped (or full) from Aadhaar/PAN.
        selfie_image_bytes:   Live selfie captured by the user.

    Returns:
        {
          "is_match": bool,
          "confidence": float,  # 0.0 – 1.0
          "is_live": bool       # liveness detection result
        }

    TODO (ML Team): Replace the mock block below with actual OpenCV face comparison.
    Example integration:
        import cv2, numpy as np
        # Load face detector, extract embeddings, compute cosine similarity
    """
    logger.info("match_face called. Using MOCK result.")

    # ── MOCK RESPONSE ────────────────────────────────────────────────────────
    return {
        "is_match": True,
        "confidence": 0.94,
        "is_live": True,
    }
    # ── END MOCK ────────────────────────────────────────────────────────────


# ── Risk / Default Predictor ──────────────────────────────────────────────────

def predict_default_risk(trust_score: int, loan_amount: float, duration_days: int,
                          guardian_count: int) -> dict:
    """
    Predict probability of borrower default using trust score + loan features.

    Returns:
        {
          "risk_label": "Low" | "Medium" | "High",
          "risk_probability": float  # 0.0 – 1.0
        }

    TODO (ML Team): Replace mock with trained scikit-learn model.
    Example integration:
        model = joblib.load("risk_model.pkl")
        features = [[trust_score, loan_amount, duration_days, guardian_count]]
        prob = model.predict_proba(features)[0][1]
    """
    logger.info("predict_default_risk called. Using heuristic mock.")

    # ── HEURISTIC MOCK ───────────────────────────────────────────────────────
    score = trust_score
    if score >= 3:
        label, prob = "Low", 0.10
    elif score >= 0:
        label, prob = "Medium", 0.40
    else:
        label, prob = "High", 0.75

    # Boost risk slightly for large amounts
    if loan_amount > 50000:
        prob = min(prob + 0.10, 0.99)
        if label == "Low":
            label = "Medium"

    return {"risk_label": label, "risk_probability": round(prob, 2)}
    # ── END MOCK ────────────────────────────────────────────────────────────
