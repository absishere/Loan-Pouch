🧬 LoanPouch Empowering the Unbanked through Biometric Identity and Decentralized Trust.

Built for Nakshatra: A Tech Hackathon | FinTech Track (Problem Statement 2)

📖 Overview Over a billion people globally lack access to formal banking and credit scores, shutting them out of the global economy. LoanPouch is a decentralized, gamified micro-lending platform that replaces traditional banking bureaucracy with Biometric Identity, Social Collateral, and Smart Contract Escrows.

By utilizing zero-knowledge KYC and on-chain trust scoring, LoanPouch allows individuals without traditional assets to secure loans safely, transparently, and without centralized control.

✨ Key Features & Innovations 🔒 Zero-Knowledge Biometric KYC: OCR extracts details from Aadhar/PAN, and OpenCV matches the user's live face to the document. Data is encrypted, uploaded to IPFS, and only the hash is stored on-chain. Zero sensitive data is stored on our servers.

🤝 Social Collateral (Guardians): Borrowers without physical assets leverage community trust. A loan request requires 2-of-3 trusted "Guardians" to digitally co-sign via Firebase notifications, putting their own reputation on the line.

🎮 Gamified Trust Score: Repaying a loan on time adds +1 to the user's on-chain Trust Score (decreasing future interest by 0.2%). Defaulting yields a -1 penalty (increasing interest by 0.5%).

🧠 AI Default Predictor: A heuristic AI model analyzes biometric consistency, trust scores, and guardian networks to give lenders a clear "Risk Probability" (e.g., 🟢 Low Risk - 12%) before they fund a loan.

🛡️ Advanced Duress Security: * Panic Mode: If forced to transact under threat, using an alternate finger triggers a fake success UI while silently routing funds to a decoy wallet.

SMS Emergency Lock: Texting "LOCK WALLET" flips a smart contract boolean, freezing all account outflows instantly.

💻 Tech Stack Frontend (Mobile App) Framework: React Native (Expo Go)

Biometrics: expo-local-authentication

Styling: NativeWind / StyleSheet

Web3: ethers.js

Backend & AI Framework: Python + FastAPI

Identity AI: OpenCV (Live Face Match), Tesseract/EasyOCR (Document Extraction)

Risk AI: Scikit-learn (Heuristic Default Predictor)

Services: Firebase Auth (SMS OTP) & Firebase Cloud Messaging (Push Notifications)

Blockchain & Storage Network: Ethereum Sepolia Testnet (Local testing via Hardhat)

Smart Contracts: Solidity

Off-Chain Storage: IPFS (via Pinata) for encrypted KYC data

🔄 User Flow

Onboarding & KYC User uploads Aadhar & PAN -> FastAPI extracts details via OCR.
User verifies phone number via Firebase SMS OTP.

User takes a live selfie -> FastAPI runs an OpenCV liveness/face match.

Data is encrypted and sent to IPFS. IPFS hash and isVerified boolean are stored on the Blockchain.

User registers local device biometrics (Fingerprint/Face) and sets a transaction PIN (tPIN).

Borrowing Flow Borrower requests a loan (Amount, Duration, Purpose). Note: Max 2 active loans allowed.
FastAPI calculates the AI Default Predictor score.

Request is pushed to the Marketplace. Note: Requests expire if unfunded within 3 days.

User's 3 Guardians receive a push notification to co-sign the request.

Lending & Escrow Flow Lender browses the Marketplace, viewing Borrower Trust Scores and AI Risk metrics.
Lender clicks "Fund", authenticating via Biometrics + tPIN.

Funds (B-INR token) move from the Lender to the LoanEscrow.sol Smart Contract.

Once 2-of-3 Guardians approve, the Smart Contract instantly releases funds to the Borrower.

Repayments are sent back to the Smart Contract, which routes principal + interest back to the Lender and updates the gamified Trust Score.

🏛️ System Architecture Zone 1: Mobile TEE (Trusted Execution Environment) handles raw biometric data. Biometric hashes never leave the device.

Zone 2: FastAPI Backend acts as a stateless relay, handling heavy compute (OCR/OpenCV/AI) and throwing away sensitive images immediately after IPFS encryption.

Zone 3: Smart Contracts act as the decentralized, trustless bank, holding funds in escrow and executing the gamified interest rate logic immutably.

🌍 Real-World Feasibility (The RBI CBDC Roadmap) While this hackathon prototype utilizes B-INR (a custom ERC-20 stablecoin) to demonstrate smart contract logic, the real-world production architecture is designed specifically for the Reserve Bank of India's Digital Rupee (e₹).

By integrating with the APIs of the 19 current CBDC pilot banks (SBI, HDFC, ICICI, etc.), LoanPouch will act as the decentralized trust and escrow layer sitting directly on top of India's compliant, government-backed digital fiat infrastructure.