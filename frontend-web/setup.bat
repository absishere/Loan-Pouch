@echo off
echo Creating TrustLend directory structure...

cd /d "%~dp0"

mkdir app 2>nul
mkdir app\(auth) 2>nul
mkdir app\(auth)\login 2>nul
mkdir app\(auth)\register 2>nul
mkdir app\(dashboard) 2>nul
mkdir app\(dashboard)\dashboard 2>nul
mkdir app\(dashboard)\borrow 2>nul
mkdir app\(dashboard)\lend 2>nul
mkdir app\(dashboard)\analytics 2>nul
mkdir app\(dashboard)\history 2>nul
mkdir app\(dashboard)\profile 2>nul
mkdir components 2>nul
mkdir components\ui 2>nul
mkdir components\layout 2>nul
mkdir components\shared 2>nul
mkdir lib 2>nul
mkdir public 2>nul

echo.
echo Directories created successfully!
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Run: npm run dev
echo.
pause
