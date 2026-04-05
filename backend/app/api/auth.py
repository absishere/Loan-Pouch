"""Auth, OTP and user account routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import SendOTPRequest, VerifyOTPRequest
from app.services.firebase_service import send_otp, verify_otp
from app.services.user_registry import (
    doc_hash,
    find_by_doc_hash,
    find_by_phone_hash,
    find_by_wallet,
    normalize_phone,
    phone_hash,
    pin_hash,
    register_user,
    update_user_wallet,
)
from app.services.state_store import load_state, save_state, add_event
from app.services.web3_service import (
    get_wallet_by_doc_hash,
    get_wallet_by_phone_hash,
    register_identity_commitment,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterUserRequest(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    mpin: str = Field(..., min_length=4)
    wallet_address: str
    doc_hash: str | None = None
    dob: str | None = None
    aadhaar: str | None = None
    pan: str | None = None
    trust_score: int = 400


class LoginUserRequest(BaseModel):
    phone: str
    mpin: str


class RecoveryInitRequest(BaseModel):
    phone: str
    mpin: str
    lost_wallet: str
    new_wallet: str
    guaranters: list[str] = Field(..., min_length=3, max_length=3)


class RecoveryVoteRequest(BaseModel):
    request_id: int
    guaranter_wallet: str
    approve: bool


@router.post("/send-otp", summary="Send OTP to a phone number via Firebase")
async def api_send_otp(payload: SendOTPRequest):
    try:
        result = await send_otp(payload.phone_number)
        return {"status": "otp_sent", **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-otp", summary="Verify OTP entered by the user")
async def api_verify_otp(payload: VerifyOTPRequest):
    try:
        result = await verify_otp(payload.session_info, payload.otp_code)
        return {"status": "verified", **result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register-user", summary="Register user with one-wallet-per-phone/document enforcement")
async def api_register_user(payload: RegisterUserRequest):
    p_hash = phone_hash(payload.phone)
    if payload.doc_hash:
        d_hash = payload.doc_hash.lower().replace("0x", "")
        if len(d_hash) != 64 or any(ch not in "0123456789abcdef" for ch in d_hash):
            raise HTTPException(status_code=422, detail="doc_hash must be 32-byte hex")
    else:
        if not (payload.dob and payload.aadhaar and payload.pan):
            raise HTTPException(status_code=422, detail="Either doc_hash or dob+aadhaar+pan is required")
        d_hash = doc_hash(payload.name, payload.dob, payload.aadhaar, payload.pan)

    existing_local_phone = find_by_phone_hash(p_hash)
    if existing_local_phone and existing_local_phone.get("wallet_address") != payload.wallet_address:
        raise HTTPException(status_code=409, detail="Phone number is already mapped to a different wallet")

    existing_local_doc = find_by_doc_hash(d_hash)
    if existing_local_doc and existing_local_doc.get("wallet_address") != payload.wallet_address:
        raise HTTPException(status_code=409, detail="Document identity is already mapped to a different wallet")

    chain_phone_wallet = get_wallet_by_phone_hash("0x" + p_hash)
    if chain_phone_wallet and chain_phone_wallet.lower() != payload.wallet_address.lower():
        raise HTTPException(status_code=409, detail="Phone already registered on-chain")

    chain_doc_wallet = get_wallet_by_doc_hash("0x" + d_hash)
    if chain_doc_wallet and chain_doc_wallet.lower() != payload.wallet_address.lower():
        raise HTTPException(status_code=409, detail="Document already registered on-chain")

    commitment_hex = "0x" + pin_hash(f"{p_hash}|{d_hash}|{payload.wallet_address}")
    chain_tx = register_identity_commitment(
        wallet=payload.wallet_address,
        phone_hash_hex="0x" + p_hash,
        doc_hash_hex="0x" + d_hash,
        commitment_hex=commitment_hex,
    )

    existing_user = find_by_phone_hash(p_hash)
    if not existing_user:
        register_user(
            {
                "name": payload.name,
                "phone_hash": p_hash,
                "phone_last4": normalize_phone(payload.phone)[-4:],
                "doc_hash": d_hash,
                "mpin_hash": pin_hash(payload.mpin),
                "wallet_address": payload.wallet_address,
                "trust_score": payload.trust_score,
            }
        )

    return {
        "status": "registered",
        "wallet_address": payload.wallet_address,
        "phone_last4": normalize_phone(payload.phone)[-4:],
        "trust_score": payload.trust_score,
        "chain_tx_hash": chain_tx,
    }


@router.post("/login-user", summary="Login with phone and mPIN")
async def api_login_user(payload: LoginUserRequest):
    p_hash = phone_hash(payload.phone)
    user = find_by_phone_hash(p_hash)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    if user.get("mpin_hash") != pin_hash(payload.mpin):
        raise HTTPException(status_code=401, detail="Invalid mPIN")

    return {
        "status": "authenticated",
        "user": {
            "name": user.get("name"),
            "phoneLast4": user.get("phone_last4"),
            "trustScore": user.get("trust_score", 400),
            "walletAddress": user.get("wallet_address"),
        },
    }


def _next_recovery_id(recoveries: list[dict]) -> int:
    if not recoveries:
        return 1
    return max(int(x.get("id", 0)) for x in recoveries) + 1


def _get_recovery(state: dict, request_id: int) -> dict | None:
    for item in state.get("recoveries", []):
        if int(item.get("id", -1)) == int(request_id):
            return item
    return None


@router.post("/recovery/init", summary="Initiate lost wallet recovery request")
async def init_recovery(payload: RecoveryInitRequest):
    p_hash = phone_hash(payload.phone)
    user = find_by_phone_hash(p_hash)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    if user.get("mpin_hash") != pin_hash(payload.mpin):
        raise HTTPException(status_code=401, detail="Invalid mPIN")

    current_wallet = str(user.get("wallet_address", "")).lower()
    if current_wallet != payload.lost_wallet.lower():
        raise HTTPException(status_code=400, detail="Lost wallet does not match registered wallet")

    existing_new_wallet = find_by_wallet(payload.new_wallet)
    if existing_new_wallet and existing_new_wallet.get("phone_hash") != p_hash:
        raise HTTPException(status_code=409, detail="New wallet already belongs to another user")

    if payload.lost_wallet.lower() == payload.new_wallet.lower():
        raise HTTPException(status_code=400, detail="New wallet must be different from lost wallet")

    state = load_state()
    recoveries = state.get("recoveries", [])

    # close previous pending requests for same user
    for r in recoveries:
        if r.get("phone_hash") == p_hash and r.get("status") == "pending":
            r["status"] = "superseded"

    request_id = _next_recovery_id(recoveries)
    request = {
        "id": request_id,
        "phone_hash": p_hash,
        "doc_hash": user.get("doc_hash"),
        "lost_wallet": payload.lost_wallet,
        "new_wallet": payload.new_wallet,
        "guaranters": payload.guaranters,
        "approvals": [],
        "rejections": [],
        "status": "pending",
    }
    recoveries.append(request)
    state["recoveries"] = recoveries
    save_state(state)
    add_event("recovery_initiated", {"request_id": request_id, "lost_wallet": payload.lost_wallet, "new_wallet": payload.new_wallet})
    return {"status": "pending", "request_id": request_id}


@router.get("/recovery/guaranter/pending/{guaranter_wallet}", summary="Get pending recovery requests for guaranter")
async def get_pending_recoveries_for_guaranter(guaranter_wallet: str):
    g = guaranter_wallet.lower()
    pending = []
    for r in load_state().get("recoveries", []):
        if r.get("status") != "pending":
            continue
        guaranters = [x.lower() for x in r.get("guaranters", [])]
        if g in guaranters:
            pending.append(
                {
                    "id": r.get("id"),
                    "lost_wallet": r.get("lost_wallet"),
                    "new_wallet": r.get("new_wallet"),
                    "approval_count": len(r.get("approvals", [])),
                    "rejection_count": len(r.get("rejections", [])),
                    "has_voted": g in [x.lower() for x in (r.get("approvals", []) + r.get("rejections", []))],
                }
            )
    return pending


@router.post("/recovery/vote", summary="Vote as guaranter for wallet recovery")
async def vote_recovery(payload: RecoveryVoteRequest):
    state = load_state()
    recovery = _get_recovery(state, payload.request_id)
    if not recovery:
        raise HTTPException(status_code=404, detail="Recovery request not found")
    if recovery.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Recovery request is no longer pending")

    voter = payload.guaranter_wallet.lower()
    guaranters = [x.lower() for x in recovery.get("guaranters", [])]
    if voter not in guaranters:
        raise HTTPException(status_code=403, detail="Wallet is not a designated guaranter")

    approvals_l = [x.lower() for x in recovery.get("approvals", [])]
    rejections_l = [x.lower() for x in recovery.get("rejections", [])]
    if voter in approvals_l or voter in rejections_l:
        raise HTTPException(status_code=400, detail="Guaranter already voted")

    if payload.approve:
        recovery["approvals"].append(payload.guaranter_wallet)
    else:
        recovery["rejections"].append(payload.guaranter_wallet)

    if len(recovery.get("approvals", [])) >= 2:
        updated = update_user_wallet(recovery.get("phone_hash"), recovery.get("new_wallet"))
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update user wallet during recovery")
        recovery["status"] = "approved"
        # best-effort commitment refresh
        try:
            p_hash = recovery.get("phone_hash")
            d_hash = recovery.get("doc_hash")
            commitment_hex = "0x" + pin_hash(f"{p_hash}|{d_hash}|{recovery.get('new_wallet')}")
            register_identity_commitment(
                wallet=recovery.get("new_wallet"),
                phone_hash_hex="0x" + p_hash,
                doc_hash_hex="0x" + d_hash,
                commitment_hex=commitment_hex,
            )
        except Exception:
            pass
        add_event("recovery_approved", {"request_id": payload.request_id, "new_wallet": recovery.get("new_wallet")})
    elif len(recovery.get("rejections", [])) >= 2:
        recovery["status"] = "rejected"
        add_event("recovery_rejected", {"request_id": payload.request_id})

    save_state(state)
    return {
        "status": recovery.get("status"),
        "request_id": payload.request_id,
        "approval_count": len(recovery.get("approvals", [])),
        "rejection_count": len(recovery.get("rejections", [])),
    }


@router.get("/recovery/status/{request_id}", summary="Get recovery request status")
async def recovery_status(request_id: int):
    state = load_state()
    recovery = _get_recovery(state, request_id)
    if not recovery:
        raise HTTPException(status_code=404, detail="Recovery request not found")
    return {
        "id": recovery.get("id"),
        "status": recovery.get("status"),
        "lost_wallet": recovery.get("lost_wallet"),
        "new_wallet": recovery.get("new_wallet"),
        "approval_count": len(recovery.get("approvals", [])),
        "rejection_count": len(recovery.get("rejections", [])),
    }

