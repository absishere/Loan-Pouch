from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.payment_service import PaymentService, get_payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


class CreateOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    method: str | None = None


class MockChargeRequest(BaseModel):
    order_id: str
    amount: float
    method: str
    card_number: str | None = None
    upi_id: str | None = None


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
async def create_order(request: CreateOrderRequest, service: PaymentService = Depends(get_payment_service)):
    order = service.create_order(amount_inr=request.amount, method=request.method)
    if "error" in order:
        raise HTTPException(status_code=400, detail=order["error"])
    return order


@router.post("/mock-charge")
async def mock_charge(request: MockChargeRequest, service: PaymentService = Depends(get_payment_service)):
    result = service.mock_charge(
        order_id=request.order_id,
        amount_inr=request.amount,
        method=request.method,
        card_number=request.card_number,
        upi_id=request.upi_id,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/verify")
async def verify_payment(request: VerifyPaymentRequest, service: PaymentService = Depends(get_payment_service)):
    is_valid = service.verify_signature(
        razorpay_order_id=request.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    return {"status": "success", "message": "Payment verified successfully", "verified": True}

