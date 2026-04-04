# Loan Pouch Backend

FastAPI backend for the Loan Pouch decentralized micro-lending platform.

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Place your firebase-service-account.json in this folder (see Firebase Setup below)

# 4. Run the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: **http://localhost:8000/docs**

## Firebase Setup (One-time)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project â†’ Name it `loan-pouch`
3. Enable **Phone Authentication**: Authentication â†’ Sign-in method â†’ Phone â†’ Enable
4. Enable **Cloud Messaging (FCM)**: Project Settings â†’ Cloud Messaging â†’ Enable
5. Go to **Project Settings â†’ Service Accounts** â†’ Generate new private key â†’ Download JSON
6. Rename the downloaded file to `firebase-service-account.json`
7. Place it inside this `backend/` folder
8. Copy your **Web API Key** from Project Settings â†’ General â†’ add to `.env`:
   ```
   FIREBASE_WEB_API_KEY=AIzaSy...
   ```

## Environment Variables

Copy the root `.env` file values â€” `config.py` reads from `../.env` automatically.

| Variable | Description |
|---|---|
| `FIREBASE_WEB_API_KEY` | From Firebase Console â†’ Project Settings â†’ General |
| `PINATA_API_KEY` | Already in your `.env` |
| `PINATA_API_SECRET` | Already in your `.env` |
| `WEB3_RPC_URL` | `http://127.0.0.1:8545` for Hardhat, or Sepolia URL |
| `BINR_CONTRACT_ADDRESS` | After blockchain team deploys |
| `ESCROW_CONTRACT_ADDRESS` | After blockchain team deploys |
| `BACKEND_WALLET_PRIVATE_KEY` | Admin wallet for backend-signed txns |

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/send-otp` | Send OTP via Firebase |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/kyc/extract-aadhaar` | OCR from Aadhaar image |
| POST | `/api/v1/kyc/extract-pan` | OCR from PAN image |
| POST | `/api/v1/kyc/match-face` | Live selfie vs document face match |
| POST | `/api/v1/kyc/complete` | Pin KYC metadata to IPFS |
| GET  | `/api/v1/loans/{loan_id}` | Fetch loan from chain + AI risk |
| POST | `/api/v1/loans/risk-score` | Pre-submission AI risk score |
| POST | `/api/v1/loans/notify-guardians` | Send FCM to guardians |
| GET  | `/api/v1/wallet/trust-score/{address}` | Trust score + interest modifier |
| GET  | `/api/v1/wallet/is-locked/{address}` | Check SMS lock status |
| POST | `/api/v1/wallet/lock` | Admin lock/unlock wallet |
| POST | `/api/v1/wallet/sms-webhook` | SMS LOCK WALLET command |
