# LoanPouch

LoanPouch is a decentralized lending platform prototype built for the Nakshatra Hackathon FinTech track (Problem Statement 2). The project focuses on lending for users without access to formal banking by combining biometric identity checks, trust-based underwriting, transparent loan flows, and a claymorphism-inspired web experience.

This repository currently contains a Next.js frontend prototype for the LoanPouch product experience, along with the product flow and architecture notes that shape the broader system.

## Overview

Traditional lending excludes many borrowers because they lack formal credit history, collateral, or banking access. LoanPouch explores an alternative model built around:

- biometric identity verification
- social collateral through trusted guardians
- transparent smart-contract escrow
- gamified trust scoring
- secure repayment flows without centralized control

The long-term concept also includes B-INR-based settlement, document verification, SMS-based safety actions, and risk signals for lenders.

## Core Product Ideas

- Biometric KYC: Users upload identity documents, verify phone ownership, and complete live face matching before accessing the platform.
- Guardians as social collateral: Loan requests can require 2-of-3 trusted guardians to co-sign, replacing traditional physical collateral with accountable community trust.
- Trust Score system: Repayment behavior improves future borrowing terms, while defaults and penalties increase borrowing cost.
- Group lending: Multiple lenders can collectively fund a single borrower request.
- Smart-contract escrow: Funds are held and released through contract logic rather than centralized custody.
- Duress and recovery features: Planned support includes panic mode, SMS wallet lock, and guardian-based recovery.
- Privacy-first storage: Sensitive data is intended to be encrypted and minimized, with hashes and verification states anchored to blockchain-compatible systems rather than stored in plain centralized databases.

## Current Repository Scope

The code in this repo is a web prototype built with Next.js 14 and TypeScript. It currently focuses on the user experience for:

- landing page
- login and registration flow
- borrower and lender dashboards
- loan browsing and request flows
- analytics and trust-score views
- transaction history
- profile and settings pages

## User Flow

### 1. Onboarding and Verification

- User uploads identity documents such as Aadhaar and PAN.
- OCR extracts key details for review.
- Phone number ownership is verified through OTP.
- Live face verification confirms that the applicant matches the uploaded identity document.
- The user sets up biometric access, mPIN, and transaction PIN.

### 2. Borrowing

- Borrower creates a loan request with amount, purpose, and duration.
- A trust/risk evaluation is generated for lenders.
- The request is published to the marketplace.
- Guardians are notified to co-sign when required.
- Requests are expected to expire or renew after a limited window.

### 3. Lending and Repayment

- Lender reviews borrower profile, trust score, and risk indicators.
- Lender funds the request after secure authentication.
- Funds are routed through escrow logic.
- Once requirements are satisfied, funds are released to the borrower.
- Repayments return principal and interest, while borrower trust metrics are updated.

## Trust Model

LoanPouch combines a score-based and behavior-based approach:

- UI/analytics currently model a trust score range from 300 to 850.
- Timely repayment improves future loan terms.
- Missed or defaulted repayment increases borrowing cost.
- Planned scoring factors include repayment punctuality, transaction consistency, guardian/network trust, and loan-to-repay ratio.

## Tech Stack

### Implemented in this repo

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- shadcn/ui-style component structure

### Planned platform components

- FastAPI for OCR, face-match, and risk services
- Firebase for OTP and notifications
- Solidity smart contracts for escrow and trust logic
- IPFS or similar encrypted document storage
- Polygon or Ethereum-compatible networks for settlement logic

## Project Structure

```text
Loan-Pouch/
|-- app/
|   |-- (auth)/
|   |   |-- login/
|   |   `-- register/
|   |-- (dashboard)/
|   |   |-- analytics/
|   |   |-- borrow/
|   |   |-- dashboard/
|   |   |-- history/
|   |   |-- lend/
|   |   `-- profile/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|-- lib/
|-- public/
|-- RawFlow.md
`-- README.md
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Login flow |
| `/register` | Registration and KYC flow |
| `/dashboard` | Main dashboard |
| `/borrow` | Borrower request flow |
| `/lend` | Loan marketplace for lenders |
| `/analytics` | Trust score and performance views |
| `/history` | Loan and transaction history |
| `/profile` | User settings and profile |

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in the browser.

## Development Commands

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

## Current Status

Completed:

- landing page and visual direction
- login and registration UI
- dashboard screens
- trust score analytics views
- loan history and profile screens
- claymorphism-inspired styling system

Planned:

- backend integration
- biometric verification pipeline
- OTP and notification flows
- smart contracts and escrow
- B-INR transaction simulation
- production-grade security and recovery flows

## Notes

- `RawFlow.md` captures the broader problem statement, constraints, and product thinking that informed this prototype.
- The current application branding in code and UI is `LoanPouch`, even though some imported product notes describe the concept in alternate wording.

## License

MIT
