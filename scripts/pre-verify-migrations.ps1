# Pre-verification script - checks migration syntax and structure
# This doesn't require Supabase to be running

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Pre-Verification Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrations = @(
    "supabase\migrations\20250112050000_add_tiered_compound_structures.sql",
    "supabase\migrations\20250112060000_seed_compound_rules.sql"
)

$allChecksPass = $true

foreach ($migrationPath in $migrations) {
    $migrationName = Split-Path $migrationPath -Leaf
    Write-Host "Checking: $migrationName" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray

    if (-not (Test-Path $migrationPath)) {
        Write-Host "  X File not found" -ForegroundColor Red
        $allChecksPass = $false
        continue
    }

    $content = Get-Content $migrationPath -Raw

    # Check for idempotent patterns
    $checks = @{
        "IF NOT EXISTS checks" = ($content -match "IF NOT EXISTS")
        "IF EXISTS checks" = ($content -match "IF EXISTS")
        "CREATE TABLE IF NOT EXISTS" = ($content -match "CREATE TABLE IF NOT EXISTS")
        "CREATE INDEX IF NOT EXISTS" = ($content -match "CREATE INDEX IF NOT EXISTS")
        "DROP POLICY IF EXISTS" = ($content -match "DROP POLICY IF EXISTS")
        "DO \$\$ blocks" = ($content -match "DO \$\$")
    }

    # Anti-patterns to warn about
    $warnings = @()

    # Check for unguarded ALTER COLUMN SET NOT NULL (should be in DO $$ block with checks)
    if ($content -match "ALTER COLUMN.*SET NOT NULL" -and -not ($content -match "is_nullable = 'YES'")) {
        $warnings += "Found ALTER COLUMN SET NOT NULL without nullability check"
    }

    # Check for unguarded ALTER COLUMN TYPE (should check data_type first)
    if ($content -match "ALTER COLUMN.*TYPE" -and -not ($content -match "data_type !=")) {
        $warnings += "Found ALTER COLUMN TYPE without data type check"
    }

    Write-Host "  Idempotent Patterns Found:" -ForegroundColor White
    $sortedChecks = $checks.GetEnumerator() | Sort-Object Name
    foreach ($check in $sortedChecks) {
        if ($check.Value) {
            Write-Host "    + $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "    - $($check.Key) (not found)" -ForegroundColor Gray
        }
    }

    if ($warnings.Count -gt 0) {
        Write-Host "  ! Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "    - $warning" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  + No warnings" -ForegroundColor Green
    }

    # Check file size
    $fileSize = (Get-Item $migrationPath).Length
    Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray

    # Check for syntax issues (basic)
    $syntaxIssues = @()

    # Check for balanced DO $$ END $$ blocks
    $doCount = ([regex]::Matches($content, "DO \$\$")).Count
    $endCount = ([regex]::Matches($content, "END \$\$")).Count
    if ($doCount -ne $endCount) {
        $syntaxIssues += "Unbalanced DO/END blocks (DO: $doCount, END: $endCount)"
    }

    # Check for balanced parentheses in CREATE TABLE statements
    $createTableMatches = [regex]::Matches($content, "CREATE TABLE[^;]+;", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($match in $createTableMatches) {
        $openParen = ([regex]::Matches($match.Value, "\(")).Count
        $closeParen = ([regex]::Matches($match.Value, "\)")).Count
        if ($openParen -ne $closeParen) {
            $syntaxIssues += "Unbalanced parentheses in CREATE TABLE statement"
            break
        }
    }

    if ($syntaxIssues.Count -gt 0) {
        Write-Host "  X Syntax Issues:" -ForegroundColor Red
        foreach ($issue in $syntaxIssues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
        $allChecksPass = $false
    } else {
        Write-Host "  + Basic syntax checks passed" -ForegroundColor Green
    }

    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
if ($allChecksPass) {
    Write-Host "+ Pre-verification Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Start Docker Desktop" -ForegroundColor White
    Write-Host "2. Run: npx supabase start" -ForegroundColor White
    Write-Host "3. Run: .\scripts\verify-compound-migrations.ps1" -ForegroundColor White
} else {
    Write-Host "X Some checks failed" -ForegroundColor Red
    Write-Host "Please review the errors above" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
