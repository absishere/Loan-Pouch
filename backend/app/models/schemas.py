from pydantic import BaseModel, Field
from typing import Optional, List


# ── Auth / KYC models ──────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., example="+919876543210")

class VerifyOTPRequest(BaseModel):
    phone_number: Optional[str] = None
    session_info: str
    otp_code: str

class FaceMatchRequest(BaseModel):
    wallet_address: str
    # Images arrive as multipart form uploads, not JSON body.
    # These are referenced in the API route's Form parameters.

class KYCCompleteRequest(BaseModel):
    wallet_address: str
    name: str
    dob: str
    aadhaar_number: str
    pan_number: str
    phone: str
    face_match_confidence: float
    ipfs_cid: str                  # CID returned from pinning step


# ── Loan models ───────────────────────────────────────────────────────────────

class LoanRequestCreate(BaseModel):
    borrower_wallet: str
    amount_binr: float = Field(..., gt=0, description="Loan amount in B-INR tokens")
    interest_amount_binr: float = Field(..., ge=0)
    duration_days: int = Field(..., gt=0, le=365)
    purpose: str
    guardian_wallets: List[str] = Field(..., min_length=3, max_length=3)

class LoanFundRequest(BaseModel):
    lender_wallet: str
    loan_id: int

class LoanRepayRequest(BaseModel):
    borrower_wallet: str
    loan_id: int

class GuardianApprovalRequest(BaseModel):
    guardian_wallet: str
    loan_id: int

class LoanResponse(BaseModel):
    id: int
    target_amount: int
    gathered_amount: int
    target_interest: int
    borrower: str
    guardians: List[str]
    approvals: int
    rejections: int
    state: int
    funding_deadline: int
    guardian_deadline: int
    repayment_deadline: int
    total_repaid_amount: int
    is_milestone: bool
    claimed_tranches: int
    repaid_tranches: int
    risk_label: Optional[str]
    risk_probability: Optional[float]


class RiskScoreRequest(BaseModel):
    """
    Backward/forward compatible payload for risk scoring.
    Supports both web/mobile client field shapes.
    """
    borrower_wallet: Optional[str] = None
    trust_score: Optional[int] = None
    amount_binr: Optional[float] = None
    loan_amount: Optional[float] = None
    duration_days: int = Field(default=30, gt=0, le=365)
    guardian_count: Optional[int] = None
    guardian_wallets: Optional[List[str]] = None


# ── Wallet / User models ──────────────────────────────────────────────────────

class WalletLockRequest(BaseModel):
    wallet_address: str
    lock: bool

class TrustScoreResponse(BaseModel):
    wallet_address: str
    trust_score: int
    interest_modifier_pct: float   # cumulative interest adjustment in %
    risk_tier: str

class PanicModeRequest(BaseModel):
    wallet_address: str
    amount_binr: float
    decoy_vault_address: str

class SMSWebhookPayload(BaseModel):
    """Payload from Twilio/Firebase SMS webhook."""
    from_number: str
    body: str
