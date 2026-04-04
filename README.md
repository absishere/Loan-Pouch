# 🧬 Loan Pouch
**Empowering the Unbanked through Biometric Identity and Decentralized Trust.**

> Built for **Nakshatra: A Tech Hackathon** | FinTech Track (Problem Statement 2)

---

## 📖 Overview

Over a billion people globally lack access to formal banking and credit scores. **Loan Pouch** is a decentralized, gamified micro-lending platform that replaces traditional banking bureaucracy with Biometric Identity, Social Collateral, and Smart Contract Escrows.

Using **Gemini AI OCR**, client-side **Face Biometrics**, and **Algorithmic Guardian Weighting**, Loan Pouch allows individuals without traditional assets to secure loans safely, transparently, and without centralized control.

---

## ✨ Advanced Features

| Feature | Description |
|---|---|
| 🔐 **ZK-SNARK Identity** | High-value loans (>₹10,00,000) require ZK-proof of verification via IPFS KYC metadata |
| 🤳 **Biometric e-KYC** | Integrated **Gemini 2.5 Flash** for OCR and **Face-API.js** for live biometric matching |
| 💬 **OTP Authentication** | Firebase-powered phone verification with a robust **Mock Fallback** for hackathon testing |
| 🤝 **Social Collateral** | Guardian approvals are weighted by on-chain Trust Score (≥50 = 2× vote) |
| 🏗️ **Milestone Release** | Large loans are released in 4 × 25% tranches, preventing capital risk |
| 🔑 **Identity Recovery** | 2-of-3 Guardian-approved wallet migration with bricking of the compromised wallet |
| 🛡️ **Panic Mode / SMS Lock** | Text "LOCK WALLET" to our webhook to freeze account instantly via smart contract |
| 🎮 **Trust Score** | On-chain Trust Score updated on every repayment/default (+1 / -1) |

---

## 📂 Mono-Repo Structure

```
Loan-Pouch/
├── backend/                 # FastAPI Python Server & EVM Indexer
│   └── app/
│       ├── api/             # REST routes (loans, kyc, auth)
│       ├── services/        # web3, kyc, firebase_service
│       └── models/          # Pydantic schemas
├── smart-contracts/         # Hardhat + Solidity
│   ├── contracts/
│   │   ├── LoanPouchEscrow.sol   # Ultimate Advanced Escrow
│   │   └── B_INR.sol             # B-INR stablecoin token
├── frontend-web/            # Next.js 14 Dashboard + Gemini/Face-API Integration
└── frontend-mobile/         # Expo React Native App
```

---

## ⚙️ Prerequisites

Ensure the following are installed before proceeding:

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| Python | ≥ 3.10 | https://python.org |
| Git | Any | https://git-scm.com |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/absishere/Loan-Pouch.git
cd Loan-Pouch
```

### 2. Configure Environment Variables

Create a `.env` file in the root:

```bash
# Root .env
BINR_CONTRACT_ADDRESS=0x6e215881860d93a63Bf3CEb3EB2031F8c925c22e
ESCROW_CONTRACT_ADDRESS=0x5F20ffB3BC50b37A4c7ed930a7D8e690d9f00a35
FIREBASE_WEB_API_KEY=<YOUR_FIREBASE_KEY>
NEXT_PUBLIC_GEMINI_API_KEY=<YOUR_GEMINI_KEY>
```

### 3. Launch Services

**Backend (Terminal 1):**
```bash
cd backend
python -m uvicorn main:app --reload
```

**Web App (Terminal 2):**
```bash
cd frontend-web
npm install
npm run dev
```

✅ Web Dashboard: **http://localhost:3000** (or 3001)

---

## 🏗️ Smart Contract Architecture

The `LoanPouchEscrow` contract manages the entire loan lifecycle:
- **State Machine:** `Gathering → Pending → Disbursed → Repaid / Defaulted`
- **Milestone Threshold:** ≥ 1,000,000 B-INR triggers tranche-based release.
- **Guardian Weighting:** Users with Trust Score ≥ 50 have doubled voting power for co-signing.

---

## 👥 Team

- **Abbas**: Architecture, Smart Contracts, Backend
- **Anchita**: Web Dashboard & UI/UX
- **Atharv**: Contract State Machine
- **Rushikesh**: Biometric Integration

---

## 📄 License

MIT License — Built for Nakshatra Hackathon
