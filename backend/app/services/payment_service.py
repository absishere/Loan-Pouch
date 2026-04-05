import random
import string
from datetime import datetime, timezone

try:
    import razorpay
except Exception:  # pragma: no cover - optional dependency in mock mode
    razorpay = None

from app.core.config import get_settings


class PaymentService:
    def __init__(self):
        settings = get_settings()
        self.mode = (settings.PAYMENT_MODE or "mock").lower()
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.client = None
        if self.mode == "razorpay" and self.key_id and self.key_secret and razorpay is not None:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))

    @staticmethod
    def _random_id(prefix: str) -> str:
        suffix = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(14))
        return f"{prefix}_{suffix}"

    @staticmethod
    def _luhn_valid(card_number: str) -> bool:
        digits = [int(d) for d in card_number if d.isdigit()]
        if len(digits) < 12:
            return False
        checksum = 0
        parity = len(digits) % 2
        for i, d in enumerate(digits):
            if i % 2 == parity:
                d *= 2
                if d > 9:
                    d -= 9
            checksum += d
        return checksum % 10 == 0

    def create_order(self, amount_inr: float, receipt: str | None = None, method: str | None = None) -> dict:
        amount_inr = float(amount_inr)
        if amount_inr <= 0:
            return {"error": "Amount must be greater than zero"}

        method_l = (method or "").strip().lower()
        if method_l and method_l not in {"card", "upi"}:
            return {"error": "Unsupported payment method"}

        upi_allowed = amount_inr < 100000
        if method_l == "upi" and not upi_allowed:
            return {"error": "UPI is only allowed below INR 100000"}
        if self.mode == "razorpay" and self.client:
            payload = {
                "amount": int(amount_inr * 100),
                "currency": "INR",
                "receipt": receipt or self._random_id("rcpt"),
                "payment_capture": 1,
            }
            order = self.client.order.create(data=payload)
            order["mode"] = "razorpay"
            order["upi_allowed"] = upi_allowed
            allowed = ["card", "upi"] if upi_allowed else ["card"]
            if method_l:
                allowed = [method_l]
            order["allowed_methods"] = allowed
            return order

        allowed_methods = ["card", "upi"] if upi_allowed else ["card"]
        if method_l:
            allowed_methods = [method_l]

        return {
            "id": self._random_id("order_mock"),
            "amount": int(amount_inr * 100),
            "currency": "INR",
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "mode": "mock",
            "allowed_methods": allowed_methods,
            "upi_allowed": upi_allowed,
            "card_requires_valid_details": amount_inr >= 100000,
        }

    def mock_charge(self, order_id: str, amount_inr: float, method: str, card_number: str | None = None, upi_id: str | None = None) -> dict:
        amount_inr = float(amount_inr)
        method = (method or "").lower()
        if amount_inr <= 0:
            return {"error": "Amount must be greater than zero"}

        if amount_inr >= 100000 and method == "upi":
            return {"error": "UPI is only allowed for amount below INR 100000"}

        if method == "upi":
            upi = (upi_id or "").strip()
            if "@" not in upi or len(upi) < 5:
                return {"error": "Enter a valid UPI ID"}
        elif method == "card":
            card = "".join(ch for ch in (card_number or "") if ch.isdigit())
            if len(card) < 12 or len(card) > 19:
                return {"error": "Enter a valid card number"}
            if amount_inr >= 100000 and not self._luhn_valid(card):
                return {"error": "For amount >= INR 100000, provide a valid card"}
        else:
            return {"error": "Unsupported payment method"}

        return {
            "status": "captured",
            "verified": True,
            "payment_id": self._random_id("pay_mock"),
            "order_id": order_id,
            "method": method,
            "amount": int(amount_inr * 100),
            "currency": "INR",
        }

    def verify_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        if not self.client:
            return False
        params_dict = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
        try:
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except Exception:
            return False


_payment_service = None


def get_payment_service():
    global _payment_service
    if _payment_service is None:
        _payment_service = PaymentService()
    return _payment_service

