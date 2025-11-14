# Vercel Environment Variables Setup Script (PowerShell)
# This script reads from .env.local and adds them to Vercel

Write-Host "🔧 Setting up Vercel Environment Variables" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your environment variables first."
    exit 1
}

# Check Vercel authentication
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$vercelUser = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with Vercel" -ForegroundColor Red
    Write-Host "Please run: npx vercel login"
    exit 1
}

Write-Host "✅ Authenticated as: $vercelUser" -ForegroundColor Green
Write-Host ""

# Read environment variables from .env.local
Write-Host "📋 Reading environment variables from .env.local..." -ForegroundColor Yellow
Write-Host ""

$envVars = Get-Content .env.local | Where-Object {
    $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' -and $_ -match '='
}

if ($envVars.Count -eq 0) {
    Write-Host "❌ No environment variables found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Function to add environment variable
function Add-VercelEnvVar {
    param(
        [string]$Key,
        [string]$Value,
        [string]$Environment
    )

    # Skip if value is placeholder
    if ($Value -match '^your_' -or [string]::IsNullOrWhiteSpace($Value)) {
        Write-Host "  ⚠️  Skipping $Key (placeholder value)" -ForegroundColor Yellow
        return
    }

    Write-Host "  Adding $Key to $Environment..." -ForegroundColor Cyan

    # Use echo to pipe the value to vercel env add
    $result = echo $Value | npx vercel env add $Key $Environment --force 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Success" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Failed: $result" -ForegroundColor Red
    }
}

# Add to each environment
$environments = @("production", "preview", "development")

foreach ($env in $environments) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Adding to $env environment" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

    foreach ($line in $envVars) {
        $parts = $line -split '=', 2
        $key = $parts[0].Trim()
        $value = $parts[1].Trim() -replace '^["'']|["'']$'

        Add-VercelEnvVar -Key $key -Value $value -Environment $env
    }

    Write-Host ""
}

Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 To verify, run: npx vercel env ls" -ForegroundColor Yellow
Write-Host ""
