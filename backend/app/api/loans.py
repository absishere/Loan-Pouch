"""Loan marketplace and relay routes."""

import logging
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import LoanResponse, RiskScoreRequest
from app.services.firebase_service import send_guardian_approval_request, send_repayment_reminder
from app.services.kyc_service import predict_default_risk
from app.services.state_store import add_event, load_state, save_state
from app.services.web3_service import (
    fund_loan_via_backend,
    get_all_loans,
    get_loan,
    get_trust_score,
    repay_loan_via_backend,
    request_loan_via_backend,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/loans", tags=["Loans"])

TERMINAL_STATES = {3, 4, 5}


def _state() -> dict:
    return load_state()


def _save(state: dict) -> None:
    save_state(state)


def _next_local_id(loans: list[dict]) -> int:
    if not loans:
        return 1
    return max(int(x["id"]) for x in loans) + 1


def _get_local_loan(loans: list[dict], loan_id: int) -> dict | None:
    for loan in loans:
        if int(loan.get("id", -1)) == int(loan_id):
            return loan
    return None


@router.get("/", response_model=list[LoanResponse], summary="Get all active loans from market")
async def api_get_all_loans(skip: int = 0, limit: int = 50):
    loans_data = get_all_loans()
    results = [LoanResponse(**loan, risk_label="Analyzing", risk_probability=0.5) for loan in loans_data]

    if not results:
        local_loans = _state().get("loans", [])
        results = [LoanResponse(**x, risk_label="Analyzing", risk_probability=0.5) for x in local_loans]

    return results[skip : skip + limit]


@router.get("/snapshot", summary="Current requests, past requests, statuses and event log")
async def api_get_snapshot():
    state = _state()
    loans = state.get("loans", [])
    current_requests = [x for x in loans if int(x.get("state", 0)) not in TERMINAL_STATES]
    past_requests = [x for x in loans if int(x.get("state", 0)) in TERMINAL_STATES]

    status_counts: dict[str, int] = {}
    for loan in loans:
        key = str(int(loan.get("state", 0)))
        status_counts[key] = status_counts.get(key, 0) + 1

    return {
        "current_requests": current_requests,
        "past_requests": past_requests,
        "status_counts": status_counts,
        "events": state.get("events", [])[-300:],
    }


@router.get("/{loan_id}", response_model=LoanResponse, summary="Get loan details")
async def api_get_loan(loan_id: int):
    loan = get_loan(loan_id)
    if not loan:
        local = _get_local_loan(_state().get("loans", []), loan_id)
        if not local:
            raise HTTPException(status_code=404, detail="Loan not found")
        loan = local

    trust = get_trust_score(loan["borrower"])
    risk = predict_default_risk(
        trust_score=trust,
        loan_amount=loan["target_amount"] / 1e18,
        duration_days=30,
        guardian_count=3,
    )

    return LoanResponse(**loan, risk_label=risk["risk_label"], risk_probability=risk["risk_probability"])


@router.post("/risk-score", summary="Get AI risk score before loan create")
async def api_risk_score(payload: RiskScoreRequest):
    borrower = payload.borrower_wallet
    trust = payload.trust_score if payload.trust_score is not None else 0
    if borrower:
        trust = get_trust_score(borrower)

    amount_binr = payload.amount_binr if payload.amount_binr is not None else (payload.loan_amount or 0)
    guaranter_count = payload.guardian_count if payload.guardian_count is not None else len(payload.guardian_wallets or [])
    if guaranter_count == 0:
        guaranter_count = 3

    risk = predict_default_risk(
        trust_score=trust,
        loan_amount=amount_binr,
        duration_days=payload.duration_days,
        guardian_count=guaranter_count,
    )
    return {"borrower": borrower, "trust_score": trust, **risk}


class RelayRequestLoanPayload(BaseModel):
    borrower_address: str
    amount: int | float | str = Field(...)
    interest_amount: int | float | str = Field(...)
    guardians: list[str] = Field(..., min_length=3, max_length=3)
    funding_deadline_days: int = Field(default=3, ge=1, le=30)


class RelayFundPayload(BaseModel):
    loan_id: int
    amount: int | float | str = Field(...)
    lender_address: str


class RelayRepayPayload(BaseModel):
    loan_id: int
    amount: int | None = None
    borrower_address: str | None = None


class GuardianVotePayload(BaseModel):
    loan_id: int
    guardian_wallet: str
    approve: bool


class GuaranterVotePayload(BaseModel):
    loan_id: int
    guaranter_wallet: str
    approve: bool


def _to_wei_int(value: int | float | str, field_name: str) -> int:
    try:
        if isinstance(value, int):
            wei = value
        elif isinstance(value, float):
            wei = int(Decimal(str(value)))
        else:
            text = str(value).strip()
            if not text:
                raise ValueError("empty")
            wei = int(Decimal(text))
    except (InvalidOperation, ValueError):
        raise HTTPException(status_code=422, detail=f"Invalid {field_name} value")
    if wei < 0:
        raise HTTPException(status_code=422, detail=f"{field_name} must be >= 0")
    return wei


@router.post("/request", summary="Relay loan request")
async def relay_request_loan(payload: RelayRequestLoanPayload):
    amount_wei = _to_wei_int(payload.amount, "amount")
    interest_wei = _to_wei_int(payload.interest_amount, "interest_amount")
    if amount_wei <= 0:
        raise HTTPException(status_code=422, detail="amount must be > 0")

    try:
        secs = payload.funding_deadline_days * 24 * 60 * 60
        tx_hash = request_loan_via_backend(
            target_amount_wei=amount_wei,
            target_interest_wei=interest_wei,
            guardians=payload.guardians,
            funding_duration_secs=secs,
            repayment_duration_secs=secs,
        )

        state = _state()
        loans = state.get("loans", [])
        local_loan = {
            "id": _next_local_id(loans),
            "target_amount": amount_wei,
            "gathered_amount": 0,
            "target_interest": interest_wei,
            "borrower": payload.borrower_address,
            "guardians": payload.guardians[:3],
            "approvals": 0,
            "rejections": 0,
            "state": 0,
            "funding_deadline": 0,
            "guardian_deadline": 0,
            "repayment_deadline": 0,
            "total_repaid_amount": 0,
            "is_milestone": amount_wei >= 1_000_000 * 10**18,
            "claimed_tranches": 0,
            "repaid_tranches": 0,
            "tx_hash": tx_hash,
            "voted_guardians": [],
        }
        loans.append(local_loan)
        state["loans"] = loans
        _save(state)
        add_event("loan_requested", {"loan_id": local_loan["id"], "tx_hash": tx_hash, "borrower": payload.borrower_address})

        return {
            "status": "submitted",
            "tx_hash": tx_hash,
            "mode": "backend_relay_demo",
            "borrower_address": payload.borrower_address,
            "loan_id": local_loan["id"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("relay request failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fund", summary="Relay fund loan")
async def relay_fund_loan(payload: RelayFundPayload):
    amount_wei = _to_wei_int(payload.amount, "amount")
    if amount_wei <= 0:
        raise HTTPException(status_code=422, detail="amount must be > 0")

    try:
        tx_hash = fund_loan_via_backend(payload.loan_id, amount_wei)
        state = _state()
        loans = state.get("loans", [])
        local = _get_local_loan(loans, payload.loan_id)
        if local:
            local["gathered_amount"] = min(int(local["target_amount"]), int(local["gathered_amount"]) + int(amount_wei))
            if local["gathered_amount"] >= local["target_amount"]:
                local["state"] = 1
            _save(state)
        add_event("loan_funded", {"loan_id": payload.loan_id, "amount": amount_wei, "tx_hash": tx_hash, "lender": payload.lender_address})
        return {
            "status": "funded",
            "tx_hash": tx_hash,
            "mode": "backend_relay_demo",
            "lender_address": payload.lender_address,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("relay fund failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repay", summary="Relay repay loan")
async def relay_repay_loan(payload: RelayRepayPayload):
    try:
        tx_hash = repay_loan_via_backend(payload.loan_id)
        state = _state()
        loans = state.get("loans", [])
        local = _get_local_loan(loans, payload.loan_id)
        if local:
            local["state"] = 3
            local["total_repaid_amount"] = int(local["target_amount"]) + int(local["target_interest"])
            _save(state)
        add_event("loan_repaid", {"loan_id": payload.loan_id, "tx_hash": tx_hash, "borrower": payload.borrower_address})
        return {
            "status": "repaid",
            "tx_hash": tx_hash,
            "mode": "backend_relay_demo",
            "borrower_address": payload.borrower_address,
        }
    except Exception as e:
        logger.error("relay repay failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


def _pending_for_wallet(wallet: str):
    wallet_l = wallet.strip().lower()
    pending = []
    for loan in _state().get("loans", []):
        guardians = [g.lower() for g in loan.get("guardians", [])]
        voted = [g.lower() for g in loan.get("voted_guardians", [])]
        if int(loan.get("state", -1)) == 1 and wallet_l in guardians:
            pending.append(
                {
                    "id": loan["id"],
                    "borrower": loan["borrower"],
                    "target_amount": loan["target_amount"],
                    "approvals": loan["approvals"],
                    "rejections": loan["rejections"],
                    "state": loan["state"],
                    "has_voted": wallet_l in voted,
                }
            )
    return pending


@router.get("/guardian/pending/{guardian_wallet}", summary="Get pending guardian approvals")
async def get_pending_guardian_loans(guardian_wallet: str):
    return _pending_for_wallet(guardian_wallet)


@router.get("/guaranter/pending/{guaranter_wallet}", summary="Get pending guaranter approvals")
async def get_pending_guaranter_loans(guaranter_wallet: str):
    return _pending_for_wallet(guaranter_wallet)


def _vote_loan(loan_id: int, wallet: str, approve: bool):
    state = _state()
    loans = state.get("loans", [])
    loan = _get_local_loan(loans, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if int(loan.get("state", -1)) != 1:
        raise HTTPException(status_code=400, detail="Loan is not pending approvals")

    voter = wallet.strip().lower()
    guardians = [g.lower() for g in loan.get("guardians", [])]
    if voter not in guardians:
        raise HTTPException(status_code=403, detail="Wallet is not assigned to this loan")

    voted = [g.lower() for g in loan.get("voted_guardians", [])]
    if voter in voted:
        raise HTTPException(status_code=400, detail="Wallet already voted")

    loan["voted_guardians"].append(wallet)
    if approve:
        loan["approvals"] = int(loan.get("approvals", 0)) + 1
        if loan["approvals"] >= 2:
            loan["state"] = 2
    else:
        loan["rejections"] = int(loan.get("rejections", 0)) + 1
        if loan["rejections"] >= 2:
            loan["state"] = 4

    _save(state)
    add_event(
        "loan_vote",
        {
            "loan_id": loan_id,
            "wallet": wallet,
            "approve": approve,
            "approvals": loan["approvals"],
            "rejections": loan["rejections"],
            "state": loan["state"],
        },
    )

    return {
        "status": "voted",
        "loan_id": loan["id"],
        "approve": approve,
        "approvals": loan["approvals"],
        "rejections": loan["rejections"],
        "state": loan["state"],
    }


@router.post("/guardian/vote", summary="Vote as guardian")
async def vote_guardian_loan(payload: GuardianVotePayload):
    return _vote_loan(payload.loan_id, payload.guardian_wallet, payload.approve)


@router.post("/guaranter/vote", summary="Vote as guaranter")
async def vote_guaranter_loan(payload: GuaranterVotePayload):
    return _vote_loan(payload.loan_id, payload.guaranter_wallet, payload.approve)


@router.post("/notify-guardians", summary="Push guardian approval notifications")
async def api_notify_guardians(
    background_tasks: BackgroundTasks,
    loan_id: int,
    borrower_name: str,
    guardian_fcm_tokens: list[str],
):
    for token in guardian_fcm_tokens:
        background_tasks.add_task(
            send_guardian_approval_request,
            guardian_fcm_token=token,
            loan_id=loan_id,
            borrower_name=borrower_name,
        )
    return {"status": "notifications_queued", "guardian_count": len(guardian_fcm_tokens)}


@router.post("/repayment-reminder", summary="Send repayment reminder to borrower")
async def api_repayment_reminder(
    background_tasks: BackgroundTasks,
    borrower_fcm_token: str,
    loan_id: int,
    due_date: str,
    amount: str,
):
    background_tasks.add_task(
        send_repayment_reminder,
        borrower_fcm_token=borrower_fcm_token,
        loan_id=loan_id,
        due_date=due_date,
        amount=amount,
    )
    return {"status": "reminder_queued"}

