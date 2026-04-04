# ðŸ§¬ Loan Pouch: Complete Project Understanding

## 1. Core Vision & Problem Statement
**Loan Pouch** is a decentralized, gamified micro-lending platform created for the Nakshatra Hackathon (FinTech Track, Problem Statement 2).

It targets over a billion people globally who lack access to formal banking and credit scores. It replaces traditional banking bureaucracy with:
- **Biometric Identity (Zero-Knowledge KYC)**
- **Social Collateral (Guardians)**
- **Smart Contract Escrows (Trustless)**

Instead of requiring traditional physical collateral, Loan Pouch relies on trusted guardians (community trust) and an on-chain gamified Trust Score to evaluate and secure loans.

---

## 2. Platform Architecture & Repository Structure
The project uses a mono-repo structure with specialized components:

### 2.1 Backend (`backend/`)
- **Technology**: FastAPI (Python), Uvicorn.
- **Responsibilities**:
  - **Auth**: Firebase SMS OTP integration.
  - **KYC Services**: ID Document Extraction (Aadhaar/PAN OCR) and live face matching.
  - **Web3 Integration**: Interaction with smart contracts, IPFS pinning for KYC metadata (via Pinata).
  - **AI Risk**: Pre-submission heuristic risk scoring to aid lenders.
  - **Security Routes**: Duress lock (`LOCK WALLET` via SMS webhook) and guardian notifications.

### 2.2 Smart Contracts (`smart-contracts/`)
- **Technology**: Solidity, Hardhat, deployed on the Sepolia Testnet.
- **Key Contracts**:
  - `Loan PouchEscrow.sol`: The ultimate advanced escrow holding state machine (`Gathering â†’ Pending â†’ Disbursed â†’ Repaid / Defaulted / Cancelled`).
  - `B_INR.sol`: The custom stablecoin token used for all lending/borrowing settlement.
- **Features**: Max 2 active loans per borrower, Milestone Thresholds (e.g. large loans released in 4 x 25% tranches block rug-pulls), Guardian Signature Logic, and ZK-identity proof gates.

### 2.3 Web Dashboard (`frontend-web/`)
- **Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion.
- **Responsibilities**: Provides the borrower and lender interfaces (landing, auth, dashboard, analytics/trust-score, marketplace).
- **Aesthetic**: Employs a modern, accessible **Claymorphism** design system.

### 2.4 Mobile App (`frontend-mobile/`)
- **Technology**: React Native via Expo.
- **Responsibilities**: A portable cross-platform application that seamlessly embeds the Next.js AI camera tracking via a WebView. This allows flawless KYC operations on mobile without building burdensome custom C++ bridging libraries.

### 2.5 ML / KYC Gate (`frontend-kyc/`)
- Additional frontend module isolating the ML components, specifically the TensorFlow/face-api integrations meant to gate unauthorized entry.

---

## 3. System Workflows

### Onboarding & KYC Pipeline
1. **Document Upload**: Users supply Aadhaar & PAN; details are extracted via OCR.
2. **Phone Verification**: Verification via automated SMS OTP (handled via Firebase).
3. **Face Match**: Real-time biometric face match compares the user's live face against their ID documents.
4. **Wallet Creation**: Instead of retaining sensitive database records, a wallet is created using a fuzzy extractor (biometric hash), secured by an mPIN and tPIN. User state variables are migrated on-chain.

### Borrowing & Lending Flow
1. **Request**: Borrower posts a loan requirement. Must be renewed every 3 days.
2. **Review & AI Risk**: Lenders see the open marketplace. An AI-calculated risk profile supplements the borrower's on-chain Trust Score.
3. **Guardian Co-Signing**: To emulate collateral, loans require sign-offs from Guardians. Votes are dynamically weighted (e.g., highly trusted guardians possess a 2x voting multiplier).
4. **Funding & Repayment**: The loan can be group-funded. Repayments (Principal + Interest) are enforced and distributed pro-rata by the smart contract.

---

## 4. Gamification & Trust Score

- **Trust Score Engine**: Every user possesses an on-chain Trust Score ranging realistically.
- **Dynamic Interest Rates**: 
  - +1 point for timely full repayment (leads to an interest rate reduction, e.g., -0.2%).
  - -1 point for defaults/penalties (leads to an interest rate penalty, e.g., +0.5%).
- **Ecosystem Health**: Punishing bad actors and rewarding reliable borrowers inherently creates a stable, trustless ecosystem.

---

## 5. Privacy & Deep Security Features

- **Decentralized Storage**: Sensitive metrics are anchored to IPFS/Polygon/Ethereum; no centralized local persistence prevents devastating data leaks.
- **Panic Mode**: Intended for duress situations; routes an attacker to a simulated, empty decoy vault.
- **SMS Account Freezing**: Forwarding "LOCK WALLET" via SMS triggers a webhook to universally freeze the user's smart contract account.
- **Identity / Backup Recovery**: 2-of-3 Guardian approval enables securing wallet migration, forcefully bricking a compromised wallet.

---

## 6. Key Technology Requirements
- **Node.js (â‰¥18)**
- **Python (â‰¥3.10)**
- **Solidity / Hardhat**
- **Alchemy** (Sepolia RPC)
- **Pinata/IPFS**
- **Firebase** (For OTP/FCM)
