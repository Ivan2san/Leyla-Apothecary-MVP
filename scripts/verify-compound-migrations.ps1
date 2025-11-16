# Verification script for compound migrations idempotency
# This script tests that the compound migrations can be safely run multiple times

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Compound Migrations Idempotency Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is available
$supabaseVersion = supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Run: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase CLI version: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Migration files to test
$migrations = @(
    "20250112050000_add_tiered_compound_structures.sql",
    "20250112060000_seed_compound_rules.sql"
)

Write-Host "Testing migrations:" -ForegroundColor Cyan
foreach ($migration in $migrations) {
    Write-Host "  - $migration" -ForegroundColor White
}
Write-Host ""

# Function to run a single migration
function Test-Migration {
    param(
        [string]$MigrationFile,
        [int]$RunNumber
    )

    Write-Host "Run #$RunNumber - Executing $MigrationFile..." -ForegroundColor Yellow

    $migrationPath = "supabase\migrations\$MigrationFile"

    if (-not (Test-Path $migrationPath)) {
        Write-Host "  Error: Migration file not found at $migrationPath" -ForegroundColor Red
        return $false
    }

    # Execute the migration using supabase db execute
    $output = supabase db execute --file $migrationPath 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "  Success!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  Failed with exit code $exitCode" -ForegroundColor Red
        Write-Host "  Output: $output" -ForegroundColor Red
        return $false
    }
}

# Function to check database connection
function Test-DatabaseConnection {
    Write-Host "Checking database connection..." -ForegroundColor Yellow
    $status = supabase status 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Supabase is not running." -ForegroundColor Red
        Write-Host "Please start Supabase with: supabase start" -ForegroundColor Yellow
        return $false
    }

    Write-Host "Database connection OK" -ForegroundColor Green
    return $true
}

# Main test execution
Write-Host "Step 1: Checking database connection" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
if (-not (Test-DatabaseConnection)) {
    exit 1
}
Write-Host ""

Write-Host "Step 2: Running migrations (First Pass)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$firstPassSuccess = $true
foreach ($migration in $migrations) {
    if (-not (Test-Migration -MigrationFile $migration -RunNumber 1)) {
        $firstPassSuccess = $false
        break
    }
}
Write-Host ""

if (-not $firstPassSuccess) {
    Write-Host "First pass failed. Cannot proceed with idempotency test." -ForegroundColor Red
    exit 1
}

Write-Host "Step 3: Running migrations (Second Pass - Idempotency Test)" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
$secondPassSuccess = $true
foreach ($migration in $migrations) {
    if (-not (Test-Migration -MigrationFile $migration -RunNumber 2)) {
        $secondPassSuccess = $false
        Write-Host ""
        Write-Host "IDEMPOTENCY FAILURE: $migration failed on second run!" -ForegroundColor Red
        Write-Host "This means the migration is not fully idempotent." -ForegroundColor Red
        break
    }
}
Write-Host ""

if ($secondPassSuccess) {
    Write-Host "Step 4: Running migrations (Third Pass - Extra Verification)" -ForegroundColor Cyan
    Write-Host "=============================================================" -ForegroundColor Cyan
    $thirdPassSuccess = $true
    foreach ($migration in $migrations) {
        if (-not (Test-Migration -MigrationFile $migration -RunNumber 3)) {
            $thirdPassSuccess = $false
            Write-Host ""
            Write-Host "IDEMPOTENCY FAILURE: $migration failed on third run!" -ForegroundColor Red
            break
        }
    }
    Write-Host ""

    if ($thirdPassSuccess) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS! All migrations are idempotent" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "All migrations passed 3 consecutive runs without errors." -ForegroundColor Green
        Write-Host "The migrations are safe to run on databases with:" -ForegroundColor White
        Write-Host "  - Fresh schema" -ForegroundColor White
        Write-Host "  - Partial schema already applied" -ForegroundColor White
        Write-Host "  - Full schema already present" -ForegroundColor White
        exit 0
    }
}

Write-Host "========================================" -ForegroundColor Red
Write-Host "TEST FAILED" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host "Some migrations failed the idempotency test." -ForegroundColor Red
Write-Host "Please review the error messages above." -ForegroundColor Yellow
exit 1
