# 📱 LoanPouch Mobile App Setup Guide

## 🚀 React Native + Expo Setup Instructions

### 1. Create Expo Project
```bash
cd C:\Users\anchi\Desktop\nakshatra
npx create-expo-app@latest loan-pouch-mobile --template blank-typescript
cd loan-pouch-mobile
```

## 📦 Required Dependencies

### Core Styling & UI
```bash
# NativeWind (Compatible Version)
npm install nativewind@^2.0.11
npm install --save-dev tailwindcss@^3.3.0

# Alternative: Use legacy peer deps for latest versions
# npm install nativewind tailwindcss --legacy-peer-deps

# React Native Elements
npm install react-native-vector-icons
npm install react-native-elements
```

### Navigation System
```bash
# Core Navigation
npm install @react-navigation/native 
npm install @react-navigation/bottom-tabs
npm install @react-navigation/stack

# Navigation Dependencies
npm install react-native-screens 
npm install react-native-safe-area-context
npm install react-native-gesture-handler
```

### Icons & Graphics
```bash
# Lucide Icons (same as web app)
npm install lucide-react-native

# Vector Icons
npm install react-native-vector-icons
```

### Forms & Validation
```bash
# Form Management
npm install react-hook-form
npm install @hookform/resolvers
npm install zod
```

### State Management & Storage
```bash
# State Management
npm install zustand

# Local Storage
npm install @react-native-async-storage/async-storage
```

### Camera & Biometrics (KYC Features)
```bash
# Camera & Image Handling
npm install expo-camera
npm install expo-image-picker
npm install expo-media-library

# Biometric Authentication
npm install expo-local-authentication
npm install expo-face-detector
```

### Animations & Gestures
```bash
# Animations
npm install react-native-reanimated
npm install lottie-react-native

# Gesture Handling
npm install react-native-gesture-handler
```

### Blockchain & Crypto
```bash
# Wallet & Crypto
npm install @ethersproject/wallet
npm install @ethersproject/providers
npm install react-native-crypto
npm install react-native-randombytes
```

### Notifications & Communication
```bash
# Push Notifications
npm install expo-notifications

# SMS & Communications
npm install expo-sms
npm install expo-contacts
```

## 🛠️ Configuration Files Needed

### 1. `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
      },
      colors: {
        'clay-bg': 'rgba(255, 255, 255, 0.25)',
        'clay-border': 'rgba(255, 255, 255, 0.18)',
      },
    },
  },
  plugins: [],
}
```

### 2. `babel.config.js` (add to existing)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["nativewind/babel"],
  };
};
```

### 3. `app.json` (Expo configuration)
```json
{
  "expo": {
    "name": "LoanPouch",
    "slug": "loan-pouch-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "LoanPouch needs camera access for KYC verification",
        "NSFaceIDUsageDescription": "LoanPouch uses Face ID for secure authentication"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "CAMERA",
        "USE_FINGERPRINT",
        "USE_BIOMETRIC"
      ]
    }
  }
}
```

## 📁 Project Structure
```
loan-pouch-mobile/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── forms/        # Form components
│   │   └── cards/        # Card components
│   ├── screens/
│   │   ├── auth/         # Login/Register screens
│   │   ├── dashboard/    # Dashboard screens
│   │   ├── borrow/       # Borrowing flow
│   │   └── lend/         # Lending flow
│   ├── navigation/       # Navigation setup
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── assets/               # Images, fonts, etc.
└── App.tsx              # Main app component
```

## 🎨 Design System Components to Create

### 1. ClayButton Component
- Claymorphism styling with NativeWind
- Hover/press animations
- Multiple variants (primary, secondary, etc.)

### 2. ClayCard Component
- Glassmorphism effect
- Backdrop blur simulation
- Consistent shadows and borders

### 3. ClayInput Component
- Form input styling
- Validation states
- Biometric integration

## 🚀 Quick Start Commands (Copy & Paste All)

```bash
# Navigate to parent directory
cd C:\Users\anchi\Desktop\nakshatra

# Create Expo project
npx create-expo-app@latest loan-pouch-mobile --template blank-typescript

# Navigate to project
cd loan-pouch-mobile

# FIXED VERSION - Install compatible NativeWind first
npm install nativewind@^2.0.11 --save-dev tailwindcss@^3.3.0

# Then install ALL other dependencies
npm install react-native-vector-icons react-native-elements @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler lucide-react-native react-hook-form @hookform/resolvers zod zustand @react-native-async-storage/async-storage expo-camera expo-image-picker expo-media-library expo-local-authentication expo-face-detector react-native-reanimated lottie-react-native @ethersproject/wallet @ethersproject/providers react-native-crypto react-native-randombytes expo-notifications expo-sms expo-contacts

# Alternative if issues persist:
# npm install --legacy-peer-deps [all packages above]

# Initialize Tailwind
npx tailwindcss init
```

## 🎯 Next Steps After Setup
1. Configure navigation structure
2. Create design system components
3. Build authentication screens
4. Implement dashboard screens
5. Add KYC flow with camera/biometrics
6. Test on iOS/Android simulators

---
**Created for LoanPouch Mobile App Development** 📱✨