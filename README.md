# 🧬 Loan Pouch
**Empowering the Unbanked through Biometric Identity and Decentralized Trust.**

> Built for **Nakshatra: A Tech Hackathon** | FinTech Track (Problem Statement 2)

---

## 📖 Overview

Over a billion people globally lack access to formal banking and credit scores. **Loan Pouch** is a decentralized, gamified micro-lending platform that replaces traditional banking bureaucracy with Biometric Identity, Social Collateral, and Smart Contract Escrows.

Using zero-knowledge KYC, on-chain trust scoring, and Algorithmic Guardian Weighting, Loan Pouch allows individuals without traditional assets to secure loans safely, transparently, and without centralized control.

---

## ✨ Advanced Features

| Feature | Description |
|---|---|
| 🔒 **ZK-SNARK Identity** | High-value loans (>₹10,00,000) require ZK-proof of citizenship and age-18+ verification |
| 🤝 **Algorithmic Guardian Weighting** | Guardian approvals are weighted by on-chain Trust Score (≥50 = 2× vote) |
| 🏁 **Milestone Disbursements** | Large loans are released in 4 × 25% tranches, preventing rug-pulls |
| 👥 **Group Lending** | Multiple lenders can co-fund a single borrower; repayments auto-distributed pro-rata |
| 🔑 **Identity Recovery** | 2-of-3 Guardian-approved wallet migration with bricking of the compromised wallet |
| 🛡️ **Panic Mode / SMS Lock** | Duress mode routes to decoy vault; text "LOCK WALLET" to freeze account instantly |
| 🎮 **Gamified Trust Score** | On-chain Trust Score updated on every repayment/default (+1 / -1) |
| 🤖 **AI Risk Predictor** | Heuristic AI calculates risk probability before a loan is funded |

---

## 🗂️ Mono-Repo Structure

```
Loan-Pouch/
├── backend/                 # FastAPI Python backend
│   └── app/
│       ├── api/             # REST routes (loans, kyc, guardians)
│       ├── services/        # web3_service, kyc_service
│       └── models/          # Pydantic schemas
├── smart-contracts/         # Hardhat + Solidity
│   ├── contracts/
│   │   ├── LoanPouchEscrow.sol   # Ultimate Advanced Escrow
│   │   └── B_INR.sol             # B-INR stablecoin token
│   └── scripts/
│       └── clean_deploy.js
├── frontend-web/            # Anchita's Next.js 14 web dashboard
├── frontend-mobile/         # Expo React Native mobile app
└── frontend-kyc/            # Rushikesh's Vite KYC face-match module
```

---

## ⚙️ Prerequisites

Ensure the following are installed before proceeding:

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| Python | ≥ 3.10 | https://python.org |
| Git | Any | https://git-scm.com |
| Expo CLI | Latest | `npm i -g expo-cli` |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/absishere/Loan-Pouch.git
cd Loan-Pouch
```

---

### 2. Configure Environment Variables

Create a `.env` file in the root of the project:

```bash
# Root .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
PRIVATE_KEY=<YOUR_WALLET_PRIVATE_KEY>
ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_KEY>
PINATA_API_KEY=<YOUR_PINATA_KEY>
PINATA_API_SECRET=<YOUR_PINATA_SECRET>
WEB3_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
BINR_CONTRACT_ADDRESS=0x6e215881860d93a63Bf3CEb3EB2031F8c925c22e
ESCROW_CONTRACT_ADDRESS=0x5F20ffB3BC50b37A4c7ed930a7D8e690d9f00a35
BACKEND_WALLET_PRIVATE_KEY=<YOUR_DEPLOYER_PRIVATE_KEY>
FIREBASE_WEB_API_KEY=<YOUR_FIREBASE_KEY>
```

> **Note:** The contracts above are already deployed on Sepolia. You only need to redeploy if you make Solidity changes.

---

### 3. 🔗 Smart Contracts (Compile & Deploy)

```bash
cd smart-contracts

# Install dependencies
npm install

# Compile contracts (uses viaIR to handle large contract)
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/clean_deploy.js --network sepolia
```

After deploying, copy the printed addresses into your root `.env` as `BINR_CONTRACT_ADDRESS` and `ESCROW_CONTRACT_ADDRESS`.

---

### 4. 🐍 Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ API docs available at: **http://127.0.0.1:8000/docs**

---

### 5. 🌐 Web Frontend (Next.js)

```bash
cd frontend-web

# Install dependencies
npm install

# The .env.local is already configured. To override:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
# NEXT_PUBLIC_ESCROW_ADDRESS=0x5F20ffB3BC50b37A4c7ed930a7D8e690d9f00a35

# Start development server
npm run dev
```

✅ Web dashboard available at: **http://localhost:3000**

---

### 6. 📱 Mobile App (Expo)

```bash
cd frontend-mobile

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with [Expo Go](https://expo.dev/client) on your physical device

> **Android emulator note:** The app uses `10.0.2.2:8000` to reach the host machine's backend. iOS simulator uses `127.0.0.1:8000`.

---

### 7. 🧠 KYC / Face-Match Module (Vite)

```bash
cd frontend-kyc/frontend

# Install dependencies
npm install

# Download ML face detection models
python ../download_models.py

# Start the KYC module
npm run dev
```

✅ KYC module available at: **http://localhost:5173**

---

## 🔄 Full System Flow

```
User (Mobile/Web)
       │
       ▼
FastAPI Backend (:8000)
   │         │
   │         ▼
   │    web3_service.py ──► Sepolia Testnet
   │    kyc_service.py  ──► IPFS via Pinata
   │
   ▼
LoanPouchEscrow.sol (Sepolia)
   ├── requestLoan()         — Creates escrow entry
   ├── fundLoan()            — Lender deposits B-INR
   ├── approveByGuardian()   — Weighted trust-score approval
   ├── claimDisbursementTranche() — 25% Milestone release
   ├── repayLoan()           — Repayment + Trust Score update
   └── migrateWallet()       — 2-of-3 Guardian recovery
```

---

## 🧪 Testing the Flow

### Check backend is live:
```bash
curl http://127.0.0.1:8000/health
```

### Get AI risk score:
```bash
curl -X POST http://127.0.0.1:8000/api/loans/risk-score \
  -H "Content-Type: application/json" \
  -d '{"trust_score": 450, "loan_amount": 15000, "duration_days": 30, "guardian_count": 3}'
```

### Query a live loan from the blockchain:
```bash
curl http://127.0.0.1:8000/api/loans/0
```

---

## 🏛️ Smart Contract Architecture

| Contract | Address (Sepolia) |
|---|---|
| `B_INR` (Stablecoin) | `0x6e215881860d93a63Bf3CEb3EB2031F8c925c22e` |
| `LoanPouchEscrow` | `0x5F20ffB3BC50b37A4c7ed930a7D8e690d9f00a35` |

Key contract features:
- **State Machine:** `Gathering → Pending → Disbursed → Repaid / Defaulted / Cancelled`
- **Max Active Loans:** 2 per borrower
- **Milestone Threshold:** ≥ 10,00,000 B-INR triggers 4-tranche disbursement
- **Guardian Weighting:** Trust Score ≥ 50 = `approvalWeight = 2`
- **ZK Gate:** `verifyIdentityProof()` required for all loans above threshold

---

## 👥 Team

| Member | Branch | Contribution |
|---|---|---|
| Abbas | `main` | Architecture, Smart Contracts, Backend, Integration |
| Anchita | `anchita` | Web Dashboard (Next.js) |
| Atharv | `atharv` | Smart Contract State Machine |
| Rushikesh | `Rushikesh` | KYC Face-Match ML Module |

---

## 📄 License

MIT License — Built with ❤️ for Nakshatra Hackathon
