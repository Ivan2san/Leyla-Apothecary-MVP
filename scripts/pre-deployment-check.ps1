# Pre-Deployment Verification Script
# Run this before deploying to production

param(
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$script:FailedChecks = @()
$script:PassedChecks = @()
$script:WarningChecks = @()

function Write-Step {
    param([string]$Message)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Write-Check {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Message = ""
    )

    $icon = switch ($Status) {
        "pass" { "✓"; $script:PassedChecks += $Name; "Green" }
        "fail" { "✗"; $script:FailedChecks += $Name; "Red" }
        "warn" { "⚠"; $script:WarningChecks += $Name; "Yellow" }
        default { "•"; "White" }
    }

    Write-Host "  $icon " -ForegroundColor $icon[1] -NoNewline
    Write-Host "$Name" -NoNewline
    if ($Message) {
        Write-Host " - $Message" -ForegroundColor Gray
    } else {
        Write-Host ""
    }
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ============================================
# 1. Environment Check
# ============================================
Write-Step "1. Checking Environment"

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Check "Node.js installed" "pass" $nodeVersion
} else {
    Write-Check "Node.js installed" "fail" "Not found"
}

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Check "npm installed" "pass" "v$npmVersion"
} else {
    Write-Check "npm installed" "fail" "Not found"
}

if (Test-Command "git") {
    Write-Check "Git installed" "pass"
} else {
    Write-Check "Git installed" "fail" "Not found"
}

if (Test-Command "supabase") {
    $supabaseVersion = supabase --version
    Write-Check "Supabase CLI installed" "pass" $supabaseVersion
} else {
    Write-Check "Supabase CLI installed" "warn" "Not found - install before migration"
}

# ============================================
# 2. Git Status Check
# ============================================
Write-Step "2. Checking Git Status"

$gitBranch = git branch --show-current
Write-Check "Current branch" "pass" $gitBranch

$gitStatus = git status --porcelain
if ($gitStatus) {
    $changedFiles = ($gitStatus -split "`n").Count
    Write-Check "Uncommitted changes" "warn" "$changedFiles file(s) modified"
    if ($Verbose) {
        git status --short
    }
} else {
    Write-Check "Working directory clean" "pass"
}

$unpushedCommits = git log origin/$gitBranch..$gitBranch --oneline 2>$null
if ($unpushedCommits) {
    $commitCount = ($unpushedCommits -split "`n").Count
    Write-Check "Unpushed commits" "warn" "$commitCount commit(s)"
} else {
    Write-Check "All commits pushed" "pass"
}

# ============================================
# 3. Dependencies Check
# ============================================
Write-Step "3. Checking Dependencies"

if (Test-Path "package.json") {
    Write-Check "package.json found" "pass"

    if (Test-Path "node_modules") {
        Write-Check "node_modules exists" "pass"
    } else {
        Write-Check "node_modules exists" "fail" "Run npm install"
    }

    # Check for package-lock.json
    if (Test-Path "package-lock.json") {
        Write-Check "package-lock.json found" "pass"
    } else {
        Write-Check "package-lock.json found" "warn" "Consider committing lock file"
    }
} else {
    Write-Check "package.json found" "fail"
}

# ============================================
# 4. TypeScript Type Check
# ============================================
Write-Step "4. Running Type Check"

Write-Host "  Running: npm run type-check..." -ForegroundColor Gray
$typeCheckOutput = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Check "TypeScript compilation" "pass" "No type errors"
} else {
    Write-Check "TypeScript compilation" "fail" "Type errors found"
    if ($Verbose) {
        Write-Host $typeCheckOutput -ForegroundColor Red
    }
}

# ============================================
# 5. Linting
# ============================================
Write-Step "5. Running Linter"

Write-Host "  Running: npm run lint..." -ForegroundColor Gray
$lintOutput = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Check "ESLint" "pass" "No linting errors"
} else {
    Write-Check "ESLint" "fail" "Linting errors found"
    if ($Verbose) {
        Write-Host $lintOutput -ForegroundColor Red
    }
}

# ============================================
# 6. Tests
# ============================================
if (-not $SkipTests) {
    Write-Step "6. Running Tests"

    Write-Host "  Running: npm test..." -ForegroundColor Gray
    $testOutput = npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Check "Jest tests" "pass" "All tests passing"
    } else {
        Write-Check "Jest tests" "fail" "Some tests failing"
        if ($Verbose) {
            Write-Host $testOutput -ForegroundColor Red
        }
    }
} else {
    Write-Step "6. Tests (SKIPPED)"
    Write-Check "Jest tests" "warn" "Skipped by user flag"
}

# ============================================
# 7. Build Check
# ============================================
if (-not $SkipBuild) {
    Write-Step "7. Running Production Build"

    Write-Host "  Running: npm run build..." -ForegroundColor Gray
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Check "Production build" "pass" "Build succeeded"
    } else {
        Write-Check "Production build" "fail" "Build failed"
        if ($Verbose) {
            Write-Host $buildOutput -ForegroundColor Red
        }
    }
} else {
    Write-Step "7. Build Check (SKIPPED)"
    Write-Check "Production build" "warn" "Skipped by user flag"
}

# ============================================
# 8. Migration Files Check
# ============================================
Write-Step "8. Checking Migration Files"

$migrationPath = "supabase/migrations"
if (Test-Path $migrationPath) {
    $migrations = Get-ChildItem $migrationPath -Filter "*.sql" | Sort-Object Name
    Write-Check "Migration directory exists" "pass" "$($migrations.Count) migration files found"

    # Check for the wellness assessment migration
    $wellnessAssessment = $migrations | Where-Object { $_.Name -match "wellness_assessments" }
    if ($wellnessAssessment) {
        Write-Check "Wellness assessment migration" "pass" $wellnessAssessment.Name
    } else {
        Write-Check "Wellness assessment migration" "warn" "Not found"
    }

    # Check for wellness packages migration
    $wellnessPackages = $migrations | Where-Object { $_.Name -match "wellness_packages" }
    if ($wellnessPackages) {
        Write-Check "Wellness packages migration" "pass" $wellnessPackages.Name
    } else {
        Write-Check "Wellness packages migration" "warn" "Not found"
    }
} else {
    Write-Check "Migration directory exists" "fail" "supabase/migrations not found"
}

# ============================================
# 9. Environment Variables Check
# ============================================
Write-Step "9. Checking Environment Configuration"

$envLocal = ".env.local"
$envExample = ".env.example"

if (Test-Path $envLocal) {
    Write-Check ".env.local exists" "pass"

    $envContent = Get-Content $envLocal -Raw

    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
    )

    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Check "$var configured" "pass"
        } else {
            Write-Check "$var configured" "fail" "Missing in .env.local"
        }
    }
} else {
    Write-Check ".env.local exists" "warn" "Create from .env.example"
}

# ============================================
# 10. Supabase Connection Check
# ============================================
if (Test-Command "supabase") {
    Write-Step "10. Checking Supabase Configuration"

    # Check if linked to a project
    $supabaseConfig = Get-Content ".\.git\supabase\config.toml" -ErrorAction SilentlyContinue
    if ($supabaseConfig) {
        Write-Check "Supabase project linked" "pass"
    } else {
        Write-Check "Supabase project linked" "warn" "Run: supabase link --project-ref <ref>"
    }

    # Check migration status (only if linked)
    if ($supabaseConfig) {
        Write-Host "  Running: supabase migration list..." -ForegroundColor Gray
        $migrationList = supabase migration list 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Migration status accessible" "pass"
        } else {
            Write-Check "Migration status accessible" "warn" "Cannot connect to Supabase"
        }
    }
}

# ============================================
# Summary
# ============================================
Write-Host "`n"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT READINESS SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "  ✓ Passed:  " -ForegroundColor Green -NoNewline
Write-Host "$($script:PassedChecks.Count)" -ForegroundColor White

Write-Host "  ⚠ Warnings: " -ForegroundColor Yellow -NoNewline
Write-Host "$($script:WarningChecks.Count)" -ForegroundColor White

Write-Host "  ✗ Failed:  " -ForegroundColor Red -NoNewline
Write-Host "$($script:FailedChecks.Count)" -ForegroundColor White

Write-Host ""

if ($script:FailedChecks.Count -eq 0) {
    Write-Host "  🚀 Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "    1. Review warnings (if any)" -ForegroundColor White
    Write-Host "    2. Run migration repair script" -ForegroundColor White
    Write-Host "    3. Apply new migrations with 'supabase db push'" -ForegroundColor White
    Write-Host "    4. Create release tag" -ForegroundColor White
    Write-Host "    5. Deploy to production" -ForegroundColor White
    exit 0
} else {
    Write-Host "  ⛔ NOT ready for deployment" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Failed checks:" -ForegroundColor Red
    foreach ($check in $script:FailedChecks) {
        Write-Host "    • $check" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "  Fix these issues before deploying." -ForegroundColor Yellow
    exit 1
}
