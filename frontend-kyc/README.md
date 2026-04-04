# ðŸ§¬ Loan Pouch

**Empowering the Unbanked through Biometric Identity and Decentralized Trust.**

Built for **Nakshatra: A Tech Hackathon** | FinTech Track (Problem Statement 2)

---

## ðŸ“– Overview

Over a billion people globally lack access to formal banking and credit scores, shutting them out of the global economy. **Loan Pouch** is a decentralized, gamified micro-lending platform that replaces traditional banking bureaucracy with **Biometric Identity**, **Social Collateral**, and **Smart Contract Escrows**.

By utilizing zero-knowledge KYC and on-chain trust scoring, Loan Pouch allows individuals without traditional assets to secure loans safely, transparently, and without centralized control.

---

## âœ¨ Key Features & Innovations

- ðŸ”’ **Zero-Knowledge Biometric KYC**: OCR extracts details from Aadhar/PAN, and face recognition matches the user's live face to the document. Data is encrypted, uploaded to IPFS, and only the hash is stored on-chain. Zero sensitive data is stored on our servers.
- ðŸ¤ **Social Collateral (Guardians)**: Borrowers without physical assets leverage community trust. A loan request requires 2-of-3 trusted "Guardians" to digitally co-sign via Firebase notifications, putting their own reputation on the line.
- ðŸŽ® **Gamified Trust Score**: Repaying a loan on time adds +1 to the user's on-chain Trust Score (decreasing future interest by 0.2%). Defaulting yields a -1 penalty (increasing interest by 0.5%).
- ðŸ§  **AI Default Predictor**: A heuristic AI model analyzes biometric consistency, trust scores, and guardian networks to give lenders a clear "Risk Probability" before they fund a loan.
- ðŸ›¡ï¸ **Advanced Duress Security**:
  - **Panic Mode**: If forced to transact under threat, using an alternate finger triggers a fake success UI while silently routing funds to a decoy wallet.
  - **SMS Emergency Lock**: Texting "LOCK WALLET" flips a smart contract boolean, freezing all account outflows instantly.

---

## ðŸ’» Tech Stack

### Frontend (Web App)
| Technology | Purpose |
|---|---|
| React + Vite (TypeScript) | UI Framework |
| TailwindCSS v4 | Styling |
| face-api.js | Client-side Face Detection & Matching |
| Google Gemini API | OCR Text Extraction from ID Documents |
| Lucide React | Icons |

### Backend & AI
| Technology | Purpose |
|---|---|
| Python + FastAPI | Backend Framework |
| Scikit-learn | Heuristic Default Predictor |
| Firebase Auth | SMS OTP Verification |
| Firebase Cloud Messaging | Push Notifications |

### Blockchain & Storage
| Technology | Purpose |
|---|---|
| Ethereum Sepolia Testnet (Hardhat) | Smart Contract Network |
| Solidity | Smart Contracts |
| IPFS (Pinata) | Off-Chain Encrypted KYC Storage |

---

## ðŸš€ Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- A Google Gemini API Key ([Get one from Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/absishere/Loan-Pouch.git
cd Loan-Pouch
```

### 2. Download Face Recognition Models
```bash
python download_models.py
```
This downloads the `face-api.js` model weights into `frontend/public/models/`.

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Configure Environment Variables
Create a `.env` file inside the `frontend/` directory:
```env
VITE_GEMINI_API_KEY="your-gemini-api-key-here"
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ðŸ”„ E-KYC Verification Flow

1. **Document Upload** â€” User uploads Aadhar or PAN card image.
2. **OCR Extraction** â€” AI extracts Name, DOB, Document Number from the uploaded ID. User can edit if any errors exist.
3. **Face Verification** â€” Live webcam captures the user's face and compares it against the face on the ID document using `face-api.js` (runs entirely client-side).
4. **Result** â€” If the faces match, the user is verified and can proceed to the dashboard.

---

## ðŸ›ï¸ System Architecture

- **Zone 1: Browser (Client-Side)** â€” Handles raw biometric data (face detection & matching via face-api.js). Images never leave the browser for facial recognition.
- **Zone 2: FastAPI Backend** â€” Stateless relay handling heavy compute (AI Risk Prediction) and throwing away sensitive data immediately after IPFS encryption.
- **Zone 3: Smart Contracts** â€” Decentralized, trustless bank holding funds in escrow and executing gamified interest rate logic immutably.

---

## ðŸŒ Real-World Feasibility (The RBI CBDC Roadmap)

While this hackathon prototype utilizes **B-INR** (a custom ERC-20 stablecoin) to demonstrate smart contract logic, the real-world production architecture is designed specifically for the **Reserve Bank of India's Digital Rupee (eâ‚¹)**.

By integrating with the APIs of the 19 current CBDC pilot banks (SBI, HDFC, ICICI, etc.), Loan Pouch will act as the decentralized trust and escrow layer sitting directly on top of India's compliant, government-backed digital fiat infrastructure.

---

## ðŸ“ Project Structure

```
Loan-Pouch/
â”œâ”€â”€ download_models.py          # Script to download face-api.js model weights
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â””â”€â”€ models/             # face-api.js weights (gitignored)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â””â”€â”€ KYCVerification.tsx   # Main E-KYC wizard component
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ FaceService.ts        # face-api.js model loading & matching
â”‚   â”‚   â”‚   â””â”€â”€ GeminiService.ts      # Gemini API OCR integration
â”‚   â”‚   â”œâ”€â”€ App.tsx
â”‚   â”‚   â””â”€â”€ index.css
â”‚   â”œâ”€â”€ .env                    # API keys (gitignored)
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ vite.config.ts
â”œâ”€â”€ RawFlow.md                  # Original project brainstorm
â””â”€â”€ README.md
```
