# PowerShell script to repair legacy Supabase migrations
# Run this after supabase login and supabase link

$migrations = @(
    "20250112000000",
    "20250112010000",
    "20250112020000",
    "20250112030000",
    "20250112040000",
    "20250112050000",
    "20250112060000",
    "20250209090000",
    "20250209090500",
    "20250209100000",
    "20250209110000",
    "20250215090000",
    "20250215090500"
)

Write-Host "Starting migration repair process..." -ForegroundColor Cyan
Write-Host ""

foreach ($version in $migrations) {
    Write-Host "Repairing migration: $version" -ForegroundColor Yellow
    supabase migration repair $version --status applied

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully repaired $version" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to repair $version" -ForegroundColor Red
        Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Migration repair complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: supabase db push" -ForegroundColor White
Write-Host "2. Verify tables exist in Supabase dashboard" -ForegroundColor White
