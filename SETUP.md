# TrustLend Setup Guide

## Quick Start

### 1. Create Directory Structure
Double-click `setup.bat` or run in Command Prompt:
```cmd
setup.bat
```

### 2. Install Dependencies
```cmd
npm install
```

### 3. Run Development Server
```cmd
npm run dev
```

Visit http://localhost:3000

## What's Included

### Pages
- `/` - Landing page
- `/register` - Multi-step KYC registration
- `/login` - mPIN login
- `/dashboard` - Main dashboard with stats
- `/borrow` - Create loan request
- `/lend` - Browse and fund loans
- `/analytics` - Trust Score breakdown
- `/history` - Transaction history
- `/profile` - User profile settings

### Design System
- **Colors**: Black (#0f0f0f) sidebar, white content, green success, red warnings
- **Fonts**: Syne (headings/numbers), DM Sans (body)
- **Layout**: 200px dark sidebar + white main area
- **Components**: shadcn/ui based, fully customizable

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion
- Zustand

## Troubleshooting

### Port Already in Use
```cmd
npm run dev -- -p 3001
```

### Module Not Found
```cmd
npm install
```

### Clear Cache
```cmd
rm -rf .next
npm run dev
```
