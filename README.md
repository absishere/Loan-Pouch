# Loan Pouch
Decentralized micro-lending prototype with on-chain escrow, social trust approvals, and cross-device account recovery.

## What This Prototype Demonstrates
- Borrowing and lending flow on Sepolia-backed contracts.
- Guaranter approvals (2-of-3 style governance for approvals/recovery).
- Login from different devices using backend account registry.
- Lost wallet recovery workflow with persistent backend state.
- One identity can have only one active wallet (phone + document commitment uniqueness).
- Mock payment on-ramp with card/UPI rules.

## Stack
- Backend: FastAPI (`backend`)
- Web: Next.js (`frontend-web`)
- Mobile: Expo React Native (`frontend-mobile`)
- Contracts: Hardhat + Solidity (`smart-contracts`)

## Contract Addresses (Sepolia)
- `B_INR`: `0x65E0a7226ECdCB7C47b5F998A98f1c55B42102AA`
- `LoanPouchEscrow`: `0x2E28542574ec5F7b75c0264f590eE21C59F3cD57`
- `IdentityRegistry`: `0x9E0be66DdF425fbfEfEFBa289809862f4f212704`

## Key Rules Implemented
- `amount < 100000`: card and UPI both allowed in mock payment flow.
- `amount >= 100000`: UPI blocked; valid card flow only.
- Same phone + same document identity cannot create multiple wallets.
- Recovery updates wallet mapping through guaranter approvals.

## Project Structure
- `backend/` FastAPI APIs, relayer logic, recovery/account registry, persistent demo state.
- `frontend-web/` mentor demo UI for borrow/lend/guaranter/recovery/payment.
- `frontend-mobile/` mobile client flows.
- `smart-contracts/` Solidity contracts and deploy scripts.

## Environment Variables
Create root `.env` and set at minimum:

```env
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...
BACKEND_WALLET_PRIVATE_KEY=...
BINR_CONTRACT_ADDRESS=0x65E0a7226ECdCB7C47b5F998A98f1c55B42102AA
ESCROW_CONTRACT_ADDRESS=0x2E28542574ec5F7b75c0264f590eE21C59F3cD57
IDENTITY_REGISTRY_CONTRACT_ADDRESS=0x9E0be66DdF425fbfEfEFBa289809862f4f212704
FIREBASE_WEB_API_KEY=...
NEXT_PUBLIC_GEMINI_API_KEY=...
PAYMENT_MODE=mock
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000/api
```

## Run Locally
### 1. Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Web
```powershell
cd frontend-web
npm install
npm run dev
```

### 3. Mobile
```powershell
cd frontend-mobile
npm install
npm start
```

## Multi-Laptop Demo Setup
- Keep backend running on one host machine.
- On other laptops, point `NEXT_PUBLIC_API_URL` to host LAN IP.
- This shares live requests, statuses, guaranter queues, and recovery state.

## Recovery Flow
1. User opens `/recovery`, enters phone + mPIN + lost/new wallet + 3 guaranters.
2. Backend stores persistent recovery request.
3. Guaranters approve from `/guaranter` console.
4. At 2 approvals, wallet mapping is migrated.
5. User can log in from any device with same phone + mPIN and receive the new wallet.

## Security/Privacy in Prototype
- Raw document details are not persisted in browser session storage.
- Backend stores hashed identity values for uniqueness checks.
- Identity commitments are anchored on-chain via `IdentityRegistry`.

## Notes
- Required ABI artifacts are intentionally kept for backend web3 reads.
- Runtime state files are ignored via `.gitignore`.
