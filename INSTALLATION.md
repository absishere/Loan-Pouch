# TrustLend - Complete Installation Guide

## Step 1: Run Setup Script
```cmd
setup.bat
```

This creates all necessary directories.

## Step 2: Install Dependencies
```cmd
npm install
npm install tailwindcss-animate
```

## Step 3: Install shadcn/ui
```cmd
npx shadcn-ui@latest init
```
When prompted, choose:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes

## Step 4: Add shadcn/ui Components
```cmd
npx shadcn-ui@latest add button card input label select tabs dialog badge progress avatar
```

## Step 5: Create Application Files

After running setup.bat, you'll have these directories:
```
app/
  (auth)/
    login/
    register/
  (dashboard)/
    dashboard/
    borrow/
    lend/
    analytics/
    history/
    profile/
components/
  ui/         (shadcn components go here)
  layout/     (Sidebar, Header, etc.)
  shared/     (Reusable components)
lib/
  utils.ts
  mock-data.ts
public/
```

## Step 6: Run Development Server
```cmd
npm run dev
```

Visit: http://localhost:3000

---

## Files Already Created ✅

1. ✅ package.json - Dependencies configured
2. ✅ tsconfig.json - TypeScript config
3. ✅ next.config.mjs - Next.js config
4. ✅ tailwind.config.ts - Tailwind with custom theme
5. ✅ postcss.config.mjs - PostCSS config
6. ✅ .eslintrc.json - ESLint config
7. ✅ .gitignore - Git ignore rules
8. ✅ setup.bat - Directory setup script

## Files To Create After Running setup.bat

I'll provide all the code files once you run setup.bat!

---

## Next Steps

1. **Run `setup.bat` now**
2. **Run `npm install`**
3. **Let me know when done** - I'll create all the app files!

---

## Design Preview

Your app will have:
- ⚫ **Black sidebar** (#0f0f0f) with navigation
- ⚪ **White content area** with stat cards
- 📊 **Trust Score widget** (300-850 range)
- 💰 **B-INR wallet balance**
- 📋 **Loan request feed** with filters
- 📈 **Analytics charts** (Recharts)
- 🎨 **Minimalist black & white** theme

Matches the reference images you provided!
