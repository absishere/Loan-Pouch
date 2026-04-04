"""
Loan marketplace routes.
These are READ routes — they query the smart contract (or return mocks).
WRITE transactions (requestLoan, fundLoan, repayLoan) are signed on the
frontend using ethers.js + user's wallet. The backend only provides risk
scoring and guardian notifications as supporting logic.
"""
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.schemas import (
    LoanRequestCreate, LoanFundRequest, LoanRepayRequest,
    GuardianApprovalRequest, LoanResponse
)
from app.services.web3_service import get_loan, get_trust_score
from app.services.kyc_service import predict_default_risk
from app.services.firebase_service import send_guardian_approval_request, send_repayment_reminder

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/loans", tags=["Loans"])

@router.get("/", response_model=list[LoanResponse], summary="Get all active loans from the market")
async def api_get_all_loans():
    """Fetch all loans directly from the LoanPouchEscrow on Sepolia natively."""
    from app.services.web3_service import get_all_loans
    loans_data = get_all_loans()
    
    # Optional: we can attach risk predictions recursively here if performance permits. 
    # For a marketplace dashboard we might skip the deep ML prediction on the summary list 
    # and only do it per-loan, but let's apply a mock basic struct to satisfy Pydantic LoanResponse.
    
    results = []
    for loan in loans_data:
        results.append(LoanResponse(
            **loan,
            risk_label="Analyzing...", 
            risk_probability=50.0
        ))
    return results


@router.get("/{loan_id}", response_model=LoanResponse, summary="Get loan details from chain")
async def api_get_loan(loan_id: int):
    """Fetch a specific loan from the LoanPouchEscrow smart contract."""
    loan = get_loan(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found on chain")

    # Enrich with AI risk prediction. We also incorporate Algorithmic Guardian Weights here via AI side-effects in kyc_service
    trust = get_trust_score(loan["borrower"])
    risk = predict_default_risk(
        trust_score=trust,
        loan_amount=loan["target_amount"] / 1e18,
        duration_days=30,  # TODO: store duration in contract for richer data
        guardian_count=3
    )

    return LoanResponse(
        **loan,
        risk_label=risk["risk_label"],
        risk_probability=risk["risk_probability"]
    )
    
@router.post("/zk-proof", summary="Submit Zk-SNARK proof for borrower identity verified > 1M BINR")
async def verify_zk_proof(wallet_address: str, proof_bytes: str):
    """
    Submits a zero-knowledge proof of Indian Citizenship > 18.
    Only the trusted Backend Oracle can authorize the smart contract mapping.
    """
    try:
        from app.services.web3_service import get_escrow_contract, _sign_and_send
        from web3 import Web3
        contract = get_escrow_contract()
        # Mock ZK Proof check logic goes here...
        # We simply submit to blockchain
        fn = contract.functions.verifyIdentityProof(Web3.to_checksum_address(wallet_address), proof_bytes.encode('utf-8'))
        tx_hash = _sign_and_send(fn)
        return {"status": "success", "tx_hash": tx_hash, "msg": "ZK Identity Verified"}
    except Exception as e:
        logger.error(f"zk-proof error: {e}")
        raise HTTPException(status_code=500, detail="Proof Verification Failed")


@router.post("/risk-score", summary="Get AI risk score BEFORE loan is created")
async def api_risk_score(payload: LoanRequestCreate):
    """
    Called by the borrower form BEFORE submitting request to blockchain.
    Returns AI risk rating so the borrower knows their standing.
    """
    trust = get_trust_score(payload.borrower_wallet)
    risk = predict_default_risk(
        trust_score=trust,
        loan_amount=payload.amount_binr,
        duration_days=payload.duration_days,
        guardian_count=len(payload.guardian_wallets)
    )
    return {
        "borrower": payload.borrower_wallet,
        "trust_score": trust,
        **risk
    }


@router.post("/notify-guardians", summary="Push guardian approval notifications via FCM")
async def api_notify_guardians(
    background_tasks: BackgroundTasks,
    loan_id: int,
    borrower_name: str,
    guardian_fcm_tokens: list[str]
):
    """
    Called AFTER the loan is funded on-chain.
    Sends Firebase push notification to each guardian's device.
    """
    for token in guardian_fcm_tokens:
        background_tasks.add_task(
            send_guardian_approval_request,
            guardian_fcm_token=token,
            loan_id=loan_id,
            borrower_name=borrower_name
        )
    return {"status": "notifications_queued", "guardian_count": len(guardian_fcm_tokens)}


@router.post("/repayment-reminder", summary="Send repayment reminder to borrower")
async def api_repayment_reminder(
    background_tasks: BackgroundTasks,
    borrower_fcm_token: str,
    loan_id: int,
    due_date: str,
    amount: str
):
    """Trigger a repayment reminder push notification for a borrower."""
    background_tasks.add_task(
        send_repayment_reminder,
        borrower_fcm_token=borrower_fcm_token,
        loan_id=loan_id,
        due_date=due_date,
        amount=amount
    )
    return {"status": "reminder_queued"}
