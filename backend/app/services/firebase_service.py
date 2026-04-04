"""
Firebase Admin SDK initializer.
Reads the service account JSON from the path set in FIREBASE_SERVICE_ACCOUNT_PATH.

HOW TO GET YOUR SERVICE ACCOUNT FILE:
  1. Go to Firebase Console → Project Settings → Service Accounts
  2. Click "Generate new private key" → Download JSON
  3. Rename it to `firebase-service-account.json`
  4. Place it in the `backend/` directory (it is .gitignored automatically)
"""

import firebase_admin
from firebase_admin import credentials, auth, messaging
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

_firebase_app = None


def init_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK (safe to call multiple times)."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    settings = get_settings()
    try:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("✅ Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Firebase initialization failed: {e}")
        logger.warning("Running in MOCK mode — Firebase calls will return placeholders.")
        _firebase_app = None

    return _firebase_app


# ── OTP Helpers (using Firebase Auth Phone sign-in REST API) ──────────────────
# Firebase Phone Auth OTP is browser-SDK flow. For backend-only flows we call
# the Firebase Auth REST API using the Web API Key.

import httpx
from app.core.config import get_settings as _get_settings


async def send_otp(phone_number: str) -> dict:
    """
    Trigger a Firebase phone OTP for `phone_number` (E.164 format, e.g. +919876543210).
    Returns a session_info token that must be verified in verify_otp().
    """
    settings = _get_settings()
    url = f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/sendVerificationCode?key={settings.FIREBASE_WEB_API_KEY}"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={
            "phoneNumber": phone_number,
            "recaptchaToken": "BYPASS_FOR_TESTING"  # Use Firebase Test Numbers in dev
        })

    data = response.json()
    if "sessionInfo" not in data:
        raise ValueError(f"OTP send failed: {data.get('error', data)}")

    return {"session_info": data["sessionInfo"]}


async def verify_otp(session_info: str, otp_code: str) -> dict:
    """
    Verify the OTP entered by the user. Returns Firebase ID token and local ID on success.
    """
    settings = _get_settings()
    url = f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPhoneNumber?key={settings.FIREBASE_WEB_API_KEY}"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={
            "sessionInfo": session_info,
            "code": otp_code,
            "operation": "SIGN_IN_OR_SIGN_UP"
        })

    data = response.json()
    if "idToken" not in data:
        raise ValueError(f"OTP verification failed: {data.get('error', data)}")

    return {
        "id_token": data["idToken"],
        "phone_number": data.get("phoneNumber"),
        "local_id": data.get("localId"),
        "is_new_user": data.get("isNewUser", False)
    }


# ── Push Notification Helpers (FCM) ──────────────────────────────────────────

def send_push_notification(fcm_token: str, title: str, body: str, data: dict = None) -> str:
    """
    Send a push notification via Firebase Cloud Messaging.
    `fcm_token` is the device registration token stored per user.
    Returns the FCM message ID on success.
    """
    if _firebase_app is None:
        logger.warning("Firebase not initialized. Mock push → skipping actual send.")
        return "mock-message-id"

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=fcm_token,
    )

    response = messaging.send(message)
    logger.info(f"FCM notification sent: {response}")
    return response


def send_guardian_approval_request(guardian_fcm_token: str, loan_id: int, borrower_name: str) -> str:
    """
    Specialized helper: notify a guardian that their approval is needed for a loan.
    """
    return send_push_notification(
        fcm_token=guardian_fcm_token,
        title="⚠️ Guardian Approval Required",
        body=f"{borrower_name} is requesting your co-signature for loan #{loan_id}.",
        data={"loan_id": str(loan_id), "action": "GUARDIAN_APPROVE"}
    )


def send_repayment_reminder(borrower_fcm_token: str, loan_id: int, due_date: str, amount: str) -> str:
    """Send a repayment reminder push notification to a borrower."""
    return send_push_notification(
        fcm_token=borrower_fcm_token,
        title="🔔 Loan Repayment Due",
        body=f"Your loan #{loan_id} repayment of ₹{amount} is due on {due_date}.",
        data={"loan_id": str(loan_id), "action": "REPAYMENT_REMINDER"}
    )
