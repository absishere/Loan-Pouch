# Loan Pouch

**Loan Pouch** is a decentralized micro-lending platform prototype built for the **Nakshatra: A Tech Hackathon** FinTech track (Problem Statement 2). The project focuses on lending for users without access to formal banking by combining biometric identity checks, trust-based underwriting, transparent loan flows, and a claymorphism-inspired web experience.

## Overview

Traditional lending excludes many borrowers because they lack formal credit history, collateral, or banking access. **Loan Pouch** explores an alternative model built around:

- **Biometric Identity Verification**: Real-time ID OCR and Face Matching.
- **Social Collateral**: Trusted guardians as co-signers.
- **Transparent Escrow**: Smart-contract based fund management.
- **Gamified Trust Scoring**: On-chain repayment metrics.

## Live Features (Completed)

- **Biometric e-KYC**: 
  - **Gemini 2.5 Flash OCR**: Automatically extracts details from Aadhaar/PAN upload.
  - **Face-API.js**: Client-side biometric matching between ID photo and live camera feed.
  - **Phone OTP**: Firebase authentication with a robust **Mock Fallback** (Code: `123456`) for hackathon demos.
- **Personalized Dashboards**: Dynamic hydration from verified identity metadata.
- **Smart Contracts**: 
  - `LoanPouchEscrow.sol`: Handles loan requests, funding, and guardian approvals.
  - `B_INR.sol`: Native stablecoin for transaction settlement.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Face-API.js.
- **Backend**: FastAPI (Python), Google Generative AI (Gemini SDK), Firebase Admin.
- **Web3**: Solidity (Hardhat), Ethers.js, Sepolia Testnet.
- **Storage**: IPFS via Pinata.

## Quick Start

```bash
# In Terminal 1 (Backend)
cd backend
python -m uvicorn main:app --reload

# In Terminal 2 (Web App)
cd frontend-web
npm run dev
```

Open **http://localhost:3000** (or 3001) to start the experience.

## Team

- **Abbas**: Architecture & Smart Contracts
- **Anchita**: Web Dashboard
- **Atharv**: Contract State Machine
- **Rushikesh**: ML Biometrics

## License

MIT
