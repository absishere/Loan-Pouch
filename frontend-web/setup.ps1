# TrustLend Setup Script
Write-Host "Setting up TrustLend..." -ForegroundColor Cyan
Write-Host ""

# Create directories
Write-Host "Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "app",
    "app\(auth)",
    "app\(auth)\login",
    "app\(auth)\register",
    "app\(dashboard)",
    "app\(dashboard)\dashboard",
    "app\(dashboard)\borrow",
    "app\(dashboard)\lend",
    "app\(dashboard)\analytics",
    "app\(dashboard)\history",
    "app\(dashboard)\profile",
    "components",
    "components\ui",
    "components\layout",
    "components\shared",
    "lib",
    "public"
)

foreach ($dir in $directories)
{
    if (!(Test-Path $dir))
    {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created $dir" -ForegroundColor Green
    }
    else
    {
        Write-Host "  $dir already exists" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Directory structure created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm install" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host ""
