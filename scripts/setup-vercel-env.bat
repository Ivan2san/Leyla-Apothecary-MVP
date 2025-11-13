@echo off
REM Vercel Environment Variables Setup Script (Windows)
REM This script reads from .env.local and adds them to Vercel

echo Setting up Vercel Environment Variables
echo ==========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
  echo Error: .env.local file not found!
  echo Please create .env.local with your environment variables first.
  exit /b 1
)

echo Found .env.local file
echo.
echo IMPORTANT: This will add environment variables to Vercel
echo Make sure you've connected the correct GitHub account first!
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo You can add environment variables manually using these commands:
echo.
echo For each variable in .env.local, run:
echo   npx vercel env add VARIABLE_NAME production
echo   npx vercel env add VARIABLE_NAME preview
echo   npx vercel env add VARIABLE_NAME development
echo.
echo Example:
echo   npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo.
echo Or use the Vercel Dashboard:
echo   https://vercel.com/culturecrunch/leylas-apothecary-mvp/settings/environment-variables
echo.
