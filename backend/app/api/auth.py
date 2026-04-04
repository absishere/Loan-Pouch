"""Auth & OTP routes."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import SendOTPRequest, VerifyOTPRequest
from app.services.firebase_service import send_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp", summary="Send OTP to a phone number via Firebase")
async def api_send_otp(payload: SendOTPRequest):
    """
    Triggers a Firebase SMS OTP to the given phone number.
    Returns a session_info token that must be passed to /verify-otp.
    """
    try:
        result = await send_otp(payload.phone_number)
        return {"status": "otp_sent", **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-otp", summary="Verify OTP entered by the user")
async def api_verify_otp(payload: VerifyOTPRequest):
    """
    Verifies the OTP code against the session_info token.
    Returns Firebase ID token on success.
    """
    try:
        result = await verify_otp(payload.session_info, payload.otp_code)
        return {"status": "verified", **result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
