# Loan Pouch Prototype Runbook

## Deployed Sepolia Contracts
- `LPINR (B_INR)`: `0x65E0a7226ECdCB7C47b5F998A98f1c55B42102AA`
- `LoanPouchEscrow`: `0x2E28542574ec5F7b75c0264f590eE21C59F3cD57`
- `IdentityRegistry`: `0x9E0be66DdF425fbfEfEFBa289809862f4f212704`

## What Was Stabilized
- Backend loan APIs now include compatibility write routes:
  - `POST /api/loans/request`
  - `POST /api/loans/fund`
  - `POST /api/loans/repay`
- Backend now persists shared demo state to `backend/data/loan_state.json`:
  - current requests
  - past requests
  - status transitions / event log
- Added hashed user registry in `backend/data/users_registry.json` (no raw Aadhaar/PAN storage).
- Added on-chain identity commitment registration (`IdentityRegistry`) to enforce one wallet per phone+document identity.
- Added mock payment flow with UPI/card thresholds:
  - UPI allowed only for amount `< 100000`
  - amount `>= 100000` requires card path
- Risk score API now accepts both old and new client payload shapes.
- Web frontend uses correct API base and supports direct wallet funding in Lend.
- Mobile TypeScript/build issues fixed; loan list rendering aligned to backend payloads.
- Sepolia deploy scripts added in `smart-contracts/package.json`.

## Required Secrets / Setup
Set these in root `.env` (and keep existing ones):
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY` (deployer/relayer wallet)
- `BACKEND_WALLET_PRIVATE_KEY` (can be same for prototype)
- `FIREBASE_WEB_API_KEY`
- `IDENTITY_REGISTRY_CONTRACT_ADDRESS=0x9E0be66DdF425fbfEfEFBa289809862f4f212704`
- `NEXT_PUBLIC_GEMINI_API_KEY`

Optional but recommended:
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`
- `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000/api`

## Start Order (Demo)
1. Backend:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Web:
```powershell
cd frontend-web
npm run dev
```

3. Mobile:
```powershell
cd frontend-mobile
npm start
```

4. Contracts (already deployed; redeploy only if needed):
```powershell
cd smart-contracts
npm run deploy:clean
```

## Demo Flow (Mentoring Round)
1. Register user on web (`/register`), complete KYC + OTP (fallback exists for demo).
2. Add funds from dashboard (mock card/UPI + faucet mint to B-INR).
3. Borrower creates loan from `/borrow` (direct wallet tx).
4. Lender funds loan from `/lend` (direct wallet tx).
5. Guaranter approval via `/guaranter`.
6. Track state in `/dashboard`, `/history`, `/analytics`.
7. Mobile app demonstrates complementary flows and API-connected marketplace screens.

## How To Confirm Funded MetaMask Wallet
1. Open MetaMask and switch network to `Sepolia`.
2. Confirm native balance is non-zero (`ETH > 0.01` recommended).
3. Confirm the wallet address matches the one derived from `.env` private key.
4. Optional token check:
   - Add custom token `LPINR` with contract: `0x65E0a7226ECdCB7C47b5F998A98f1c55B42102AA`
   - Verify balance is present (or mint via dashboard faucet/on-ramp flow).

For this prototype, backend relay mode is enabled for reliability. That means:
- Transactions are still submitted to Sepolia.
- Demo is not blocked by client wallet popups on every step.

## Notes
- If backend cannot reach Sepolia (restricted network/proxy), read routes gracefully return empty/mock-safe results.
- Smart contract compilation may fail in some sandboxes due native `solc`; deploy scripts use `--no-compile` with tracked artifacts for prototype speed.
