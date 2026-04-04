"""
Wallet security routes:
 - Trust Score query
 - SMS Lock webhook (called by Twilio/Firebase when user SMSs 'LOCK WALLET')
 - Panic Mode endpoint
"""
import logging
import re
from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import WalletLockRequest, TrustScoreResponse, SMSWebhookPayload
from app.services.web3_service import get_trust_score, set_wallet_lock, is_wallet_locked

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/wallet", tags=["Wallet & Security"])

# ── Interest rate gamification constants ───────────────────────────────────────
BASE_INTEREST_RATE_PCT = 12.0   # 12% base annual interest
RATE_DECREASE_PER_POINT = 0.2  # -0.2% per +1 trust point
RATE_INCREASE_PER_PENALTY = 0.5  # +0.5% per -1 trust point
MIN_INTEREST_RATE_PCT = 6.0    # floor
MAX_INTEREST_RATE_PCT = 24.0   # ceiling


def _compute_interest_modifier(trust_score: int) -> tuple[float, str]:
    if trust_score >= 0:
        modifier = -trust_score * RATE_DECREASE_PER_POINT
    else:
        modifier = abs(trust_score) * RATE_INCREASE_PER_PENALTY

    effective_rate = max(MIN_INTEREST_RATE_PCT,
                         min(MAX_INTEREST_RATE_PCT, BASE_INTEREST_RATE_PCT + modifier))

    if effective_rate <= 8:
        tier = "Elite Borrower 🏆"
    elif effective_rate <= 12:
        tier = "Trusted Borrower ✅"
    elif effective_rate <= 18:
        tier = "Standard 📋"
    else:
        tier = "High Risk ⚠️"

    return round(modifier, 2), tier


@router.get("/trust-score/{wallet_address}", response_model=TrustScoreResponse)
async def api_get_trust_score(wallet_address: str):
    """Returns the on-chain trust score and resulting interest rate impact."""
    score = get_trust_score(wallet_address)
    modifier, tier = _compute_interest_modifier(score)
    return TrustScoreResponse(
        wallet_address=wallet_address,
        trust_score=score,
        interest_modifier_pct=modifier,
        risk_tier=tier
    )


@router.get("/is-locked/{wallet_address}")
async def api_is_locked(wallet_address: str):
    """Check if a wallet is currently SMS-locked."""
    locked = is_wallet_locked(wallet_address)
    return {"wallet_address": wallet_address, "is_locked": locked}


@router.post("/lock", summary="Manually lock or unlock a wallet (admin)")
async def api_lock_wallet(payload: WalletLockRequest):
    """
    Admin-signed transaction to lock/unlock a wallet on-chain.
    In practice, this is triggered automatically by the SMS webhook.
    """
    try:
        tx_hash = set_wallet_lock(payload.wallet_address, payload.lock)
        return {
            "status": "locked" if payload.lock else "unlocked",
            "wallet": payload.wallet_address,
            "tx_hash": tx_hash
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sms-webhook", summary="Twilio/Firebase SMS webhook for LOCK WALLET command")
async def api_sms_webhook(payload: SMSWebhookPayload):
    """
    Called by Twilio (or Firebase SMS handler) when the user sends an SMS.
    If the body contains 'LOCK WALLET', the backend locks that user's wallet on-chain.

    Setup:
      - Configure your Twilio number's webhook URL to point to this endpoint.
      - The phone number in `from_number` must map to a registered wallet.

    NOTE: For the hackathon we use a simple phone→wallet mapping.
    In production use Firebase Auth to resolve the phone number.
    """
    body = payload.body.strip().upper()

    # Map phone number ↔ wallet address (MOCK — replace with real lookup)
    PHONE_TO_WALLET = {
        "+919876543210": "0xYourTestWalletAddress",
        # Add more during testing
    }

    if "LOCK WALLET" in body:
        wallet = PHONE_TO_WALLET.get(payload.from_number)
        if not wallet:
            logger.warning(f"SMS lock request from unregistered number: {payload.from_number}")
            return {"status": "ignored", "reason": "Phone not registered"}

        tx_hash = set_wallet_lock(wallet, True)
        logger.info(f"🔒 Wallet locked via SMS: {wallet} (tx: {tx_hash})")
        return {"status": "locked", "wallet": wallet, "tx_hash": tx_hash}

    elif "UNLOCK WALLET" in body:
        wallet = PHONE_TO_WALLET.get(payload.from_number)
        if wallet:
            tx_hash = set_wallet_lock(wallet, False)
            return {"status": "unlocked", "wallet": wallet, "tx_hash": tx_hash}

    return {"status": "ignored", "reason": "No recognized command"}
