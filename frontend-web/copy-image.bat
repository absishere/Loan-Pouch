@echo off
echo.
echo ====================================
echo   LoanPouch - Image Setup
echo ====================================
echo.

set "SOURCE=c:\Users\anchi\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\copilot-cli-images\1775296484337-6jxkso4h.png"
set "DEST=C:\Users\anchi\Desktop\nakshatra\Loan-Pouch\public\character.png"

echo Copying character image...
echo.
echo From: %SOURCE%
echo To:   %DEST%
echo.

if exist "%SOURCE%" (
    copy "%SOURCE%" "%DEST%" >nul 2>&1
    if exist "%DEST%" (
        echo [SUCCESS] Image copied successfully!
        echo.
        echo Next step: Run 'npm run dev' and visit http://localhost:3000
    ) else (
        echo [ERROR] Failed to copy image
    )
) else (
    echo [ERROR] Source image not found
    echo.
    echo Please manually copy the image:
    echo 1. Navigate to: %SOURCE%
    echo 2. Copy to: %DEST%
)

echo.
echo ====================================
pause
