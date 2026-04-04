# 🏦 LoanPouch - Decentralized Lending Platform

A minimalist, blockchain-based peer-to-peer lending platform with **claymorphism design** and a gamified Trust Score system.

![LoanPouch](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)
![Claymorphism](https://img.shields.io/badge/Design-Claymorphism-purple)

## ✨ Features

- 🔒 **Blockchain-based** - Secure transactions on Polygon network
- 🎯 **Trust Score System** - Gamified creditworthiness (300-850 range)
- 💰 **P2P Lending** - Direct lending without banks
- 📊 **Analytics Dashboard** - Track your score and performance
- 🔐 **Biometric Auth** - Face recognition + mPIN/tPIN security
- 👥 **Group Lending** - Multiple lenders can fund one loan
- ⚡ **Real-time Updates** - Live loan requests and funding status

## 🎨 Design

**Minimalist Claymorphism Theme**
- Soft, translucent cards with backdrop blur
- Black sidebar (#0f0f0f) with gradient and blur effect
- Gradient backgrounds (gray-50 to white)
- Elevated buttons with hover animations
- Floating character with smooth animation
- Syne font for headings, DM Sans for body
- Multi-layered soft shadows
- No harsh borders, smooth transitions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
Loan-Pouch/
├── app/
│   ├── (auth)/
│   │   ├── login/          # mPIN login page
│   │   └── register/       # Multi-step KYC registration
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── borrow/         # Create loan request
│   │   ├── lend/           # Browse & fund loans
│   │   ├── analytics/      # Trust Score breakdown
│   │   ├── history/        # Transaction history
│   │   └── profile/        # User profile & settings
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Reusable components
├── lib/
│   ├── utils.ts            # Utility functions
│   └── mock-data.ts        # Sample data for demo
└── public/                 # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide Icons** - Beautiful icons

### Backend (Future)
- **Node.js + Express** - API server
- **Firebase** - Authentication & OTP
- **Polygon** - Blockchain network
- **Solidity** - Smart contracts

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features |
| `/login` | mPIN login |
| `/register` | Multi-step KYC registration |
| `/dashboard` | Main dashboard with stats |
| `/borrow` | Create loan request |
| `/lend` | Browse and fund loans |
| `/analytics` | Trust Score analytics |
| `/history` | Transaction history |
| `/profile` | User profile & settings |

## 🎯 Trust Score System

- **Range**: 0-850 (initialized at 300)
- **Tiers**:
  - 0-300: New Member → 8% base rate
  - 301-500: Trusted → 6% base rate
  - 501-650: Reliable → 5% base rate
  - 651-850: Elite → 4% base rate (floor)
- **Scoring Factors**:
  - Repayment Punctuality: 35%
  - Transaction Consistency: 25%
  - Network Trust: 20%
  - Loan-to-Repay Ratio: 20%

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎨 Color Palette

```css
Black Sidebar: #0f0f0f
White Background: #ffffff
Success Green: #4ade80
Danger Red: #e24b4a
Border Gray: #e5e7eb
Text Gray: #6b7280
```

## 📱 Responsive Design

The UI is fully responsive with:
- Desktop: Sidebar + main content layout
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation (future)

## 🔐 Security Features

- Biometric authentication
- mPIN for login
- tPIN for transactions
- Recovery guardians (2-of-3 multisig)
- Panic mode with decoy wallet
- SMS wallet lock

## 🚧 Current Status

✅ **Completed**
- Landing page
- Login/Register UI
- Main dashboard
- All authenticated pages
- Trust Score analytics
- Transaction history
- Profile management
- Minimalist black & white theme

⏳ **Todo**
- Backend API integration
- Blockchain smart contracts
- Biometric authentication
- Payment gateway integration
- Real-time notifications

## 📝 License

MIT License - feel free to use for your projects!

## 👨‍💻 Author

Built with ❤️ for decentralized finance
A project for Nakshatra Hackathon under FinTech domain following PS 2.
