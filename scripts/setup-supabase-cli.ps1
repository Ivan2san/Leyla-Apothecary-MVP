# Quick Supabase CLI Setup Script
# Detects package manager and installs Supabase CLI

$ErrorActionPreference = "Stop"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Supabase CLI Quick Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if already installed
try {
    $version = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Supabase CLI is already installed: $version" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. supabase login" -ForegroundColor White
        Write-Host "  2. supabase link --project-ref <your_ref>" -ForegroundColor White
        Write-Host "  3. .\scripts\verify-supabase-setup.ps1" -ForegroundColor White
        exit 0
    }
} catch {
    # Not installed, continue
}

Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Yellow
Write-Host ""

# Check for Scoop
Write-Host "Checking for Scoop..." -ForegroundColor Gray
try {
    $scoopVersion = scoop --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Scoop found: v$scoopVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Installing Supabase CLI via Scoop..." -ForegroundColor Yellow

        # Add Supabase bucket if not already added
        Write-Host "  Adding Supabase bucket..." -ForegroundColor Gray
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git 2>&1 | Out-Null

        # Install Supabase
        Write-Host "  Installing supabase..." -ForegroundColor Gray
        scoop install supabase

        if ($LASTEXITCODE -eq 0) {
            $newVersion = supabase --version
            Write-Host ""
            Write-Host "✓ Successfully installed Supabase CLI: $newVersion" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. supabase login" -ForegroundColor White
            Write-Host "  2. supabase link --project-ref <your_ref>" -ForegroundColor White
            Write-Host "  3. .\scripts\verify-supabase-setup.ps1" -ForegroundColor White
            exit 0
        } else {
            Write-Host "✗ Scoop installation failed" -ForegroundColor Red
            Write-Host "Trying npm instead..." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ Scoop not found" -ForegroundColor Yellow
}

# Check for npm
Write-Host ""
Write-Host "Checking for npm..." -ForegroundColor Gray
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ npm found: v$npmVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Installing Supabase CLI via npm..." -ForegroundColor Yellow

        npm install -g supabase

        if ($LASTEXITCODE -eq 0) {
            $newVersion = supabase --version
            Write-Host ""
            Write-Host "✓ Successfully installed Supabase CLI: $newVersion" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. supabase login" -ForegroundColor White
            Write-Host "  2. supabase link --project-ref <your_ref>" -ForegroundColor White
            Write-Host "  3. .\scripts\verify-supabase-setup.ps1" -ForegroundColor White
            exit 0
        } else {
            Write-Host "✗ npm installation failed" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
}

# If we get here, both methods failed
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "  Installation Failed" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""
Write-Host "Neither Scoop nor npm were found or installation failed." -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual installation options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Install Scoop (recommended for Windows)" -ForegroundColor White
Write-Host "  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
Write-Host "  irm get.scoop.sh | iex" -ForegroundColor Gray
Write-Host "  scoop install supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Install Node.js and npm" -ForegroundColor White
Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Gray
Write-Host "  Then run: npm install -g supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Direct download" -ForegroundColor White
Write-Host "  https://github.com/supabase/cli/releases" -ForegroundColor Gray
Write-Host ""
exit 1
