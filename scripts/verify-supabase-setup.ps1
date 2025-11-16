# Supabase Setup Verification Script
# Run this AFTER installing and linking Supabase CLI

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Write-Check {
    param(
        [string]$Name,
        [bool]$Success,
        [string]$Details = ""
    )

    if ($Success) {
        Write-Host "  ✓ " -ForegroundColor Green -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - " -ForegroundColor Gray -NoNewline
            Write-Host "$Details" -ForegroundColor Gray
        } else {
            Write-Host ""
        }
    } else {
        Write-Host "  ✗ " -ForegroundColor Red -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - " -ForegroundColor Gray -NoNewline
            Write-Host "$Details" -ForegroundColor Red
        } else {
            Write-Host ""
        }
    }
}

# ============================================
# 1. Check Supabase CLI Installation
# ============================================
Write-Step "1. Verifying Supabase CLI Installation"

try {
    $version = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Check "Supabase CLI installed" $true $version
    } else {
        Write-Check "Supabase CLI installed" $false "Command failed"
        Write-Host "`n  Install with: scoop install supabase" -ForegroundColor Yellow
        Write-Host "  Or: npm install -g supabase" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Check "Supabase CLI installed" $false "Not found"
    Write-Host "`n  Install with: scoop install supabase" -ForegroundColor Yellow
    Write-Host "  Or: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 2. Check Authentication Status
# ============================================
Write-Step "2. Checking Authentication Status"

$authCheck = supabase projects list 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Check "Authenticated with Supabase" $true
    Write-Host "`n  Available projects:" -ForegroundColor Gray
    Write-Host $authCheck
} else {
    Write-Check "Authenticated with Supabase" $false "Not logged in"
    Write-Host "`n  Run: supabase login" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 3. Check Project Link
# ============================================
Write-Step "3. Verifying Project Link"

$linkStatus = supabase status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Check "Project linked" $true
    Write-Host "`n$linkStatus" -ForegroundColor Gray
} else {
    Write-Check "Project linked" $false "Not linked"
    Write-Host "`n  Run: supabase link --project-ref <your_project_ref>" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 4. Check Migration Status
# ============================================
Write-Step "4. Checking Migration Status"

Write-Host "`n  Local migrations:" -ForegroundColor Gray
$localMigrations = Get-ChildItem "supabase\migrations" -Filter "*.sql" | Sort-Object Name
foreach ($migration in $localMigrations) {
    Write-Host "    • $($migration.Name)" -ForegroundColor White
}

Write-Host "`n  Checking remote migration status..." -ForegroundColor Gray
$remoteMigrations = supabase migration list 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Check "Can access migration list" $true
    Write-Host "`n$remoteMigrations" -ForegroundColor Gray
} else {
    Write-Check "Can access migration list" $false "Connection error"
    Write-Host "`n$remoteMigrations" -ForegroundColor Red
}

# ============================================
# 5. Identify Pending Migrations
# ============================================
Write-Step "5. Identifying Pending Migrations"

$migrationListOutput = supabase migration list --format json 2>&1

if ($LASTEXITCODE -eq 0) {
    try {
        $migrations = $migrationListOutput | ConvertFrom-Json

        $pending = $migrations | Where-Object { $_.Status -eq "pending" -or -not $_.Applied }
        $applied = $migrations | Where-Object { $_.Status -eq "applied" -or $_.Applied }

        Write-Host "  Applied:  " -ForegroundColor Green -NoNewline
        Write-Host "$($applied.Count)" -ForegroundColor White

        Write-Host "  Pending:  " -ForegroundColor Yellow -NoNewline
        Write-Host "$($pending.Count)" -ForegroundColor White

        if ($pending.Count -gt 0) {
            Write-Host "`n  Pending migrations:" -ForegroundColor Yellow
            foreach ($mig in $pending) {
                Write-Host "    • $($mig.Name)" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "  Could not parse migration JSON" -ForegroundColor Yellow
        Write-Host "  Run 'supabase migration list' manually to check" -ForegroundColor Gray
    }
} else {
    Write-Host "  Could not retrieve migration list" -ForegroundColor Red
}

# ============================================
# 6. Next Steps
# ============================================
Write-Step "Next Steps"

Write-Host ""
Write-Host "  If migrations need repair:" -ForegroundColor Yellow
Write-Host "    .\scripts\repair-migrations.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  To apply new migrations:" -ForegroundColor Yellow
Write-Host "    supabase db push" -ForegroundColor White
Write-Host ""
Write-Host "  To verify database tables:" -ForegroundColor Yellow
Write-Host "    supabase db diff" -ForegroundColor White
Write-Host ""
Write-Host "  To check migration history:" -ForegroundColor Yellow
Write-Host "    supabase migration list --remote" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Setup verification complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
