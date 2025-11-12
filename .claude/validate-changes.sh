#!/bin/bash
# Governance validation script for Leyla's Apothecary
# Runs automatically on pre-commit

set -e

echo "🔍 Validating changes against governance rules..."
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Track if any checks fail
CHECKS_FAILED=0

# 0. Check branch name follows conventions (skip for main/master)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo "🔀 Validating branch name..."
  if [[ ! "$CURRENT_BRANCH" =~ ^(feature|fix|hotfix|test|docs|refactor)/[a-z0-9-]+$ ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Branch name doesn't follow convention${NC}"
    echo "   Expected: feature/*, fix/*, hotfix/*, test/*, docs/*, refactor/*"
    echo "   Current: $CURRENT_BRANCH"
    echo "   See .claude/PROJECT_RULES.md for naming conventions"
    echo ""
  else
    echo -e "${GREEN}✓ Branch name follows convention${NC}"
    echo ""
  fi
fi

# 1. Check for forbidden file modifications
echo "📋 Checking forbidden files..."
FORBIDDEN_FILES=(
  "app/api/checkout/route.ts"
  "app/api/webhooks/stripe/route.ts"
  "lib/stripe/client.ts"
  "lib/stripe/server.ts"
  "components/checkout/CheckoutForm.tsx"
  "lib/auth/provider.tsx"
  "lib/supabase/client.ts"
  "lib/supabase/server.ts"
  "lib/supabase/admin.ts"
  "middleware.ts"
  "supabase/migrations/*"
  ".env.production"
  "app/privacy-policy/page.tsx"
  "app/terms-of-service/page.tsx"
)

# Get list of modified files (staged for commit)
MODIFIED_FILES=$(git diff --name-only --cached 2>/dev/null || git diff --name-only HEAD 2>/dev/null || echo "")

if [ -n "$MODIFIED_FILES" ]; then
  for forbidden in "${FORBIDDEN_FILES[@]}"; do
    if echo "$MODIFIED_FILES" | grep -q "$forbidden"; then
      echo -e "${RED}❌ FORBIDDEN: Cannot modify $forbidden${NC}"
      echo "   See .claude/FORBIDDEN_CHANGES.md for details"
      CHECKS_FAILED=1
    fi
  done
fi

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ No forbidden files modified${NC}"
fi
echo ""

# 2. Check for brand color changes
echo "🎨 Checking brand colors..."
BRAND_COLORS=("#344E41" "#A3B18A" "#D98C4A" "#FDFBF8")
COLOR_CHANGED=0

for color in "${BRAND_COLORS[@]}"; do
  if git diff --cached | grep -E "^-.*$color" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  WARNING: Brand color $color may have been removed${NC}"
    echo "   Brand colors are immutable per PROJECT_RULES.md"
    COLOR_CHANGED=1
  fi
done

if [ $COLOR_CHANGED -eq 0 ]; then
  echo -e "${GREEN}✓ Brand colors unchanged${NC}"
fi
echo ""

# 3. Check if new code files have tests
echo "🧪 Checking for tests..."
NEW_CODE_FILES=$(echo "$MODIFIED_FILES" | grep -E '\.(ts|tsx)$' | grep -v '\.test\.' | grep -v '\.spec\.' | grep -v 'types\.ts$' || echo "")

if [ -n "$NEW_CODE_FILES" ]; then
  echo -e "${YELLOW}⚠️  Modified code files (ensure tests exist):${NC}"
  echo "$NEW_CODE_FILES" | sed 's/^/   - /'
else
  echo -e "${GREEN}✓ No new code files without consideration for tests${NC}"
fi
echo ""

# 4. Run TypeScript type check
echo "📝 Running TypeScript type check..."
if npm run type-check --silent; then
  echo -e "${GREEN}✓ Type check passed${NC}"
else
  echo -e "${RED}❌ Type check failed${NC}"
  CHECKS_FAILED=1
fi
echo ""

# 5. Run ESLint
echo "✨ Running ESLint..."
if npm run lint --silent; then
  echo -e "${GREEN}✓ Linting passed${NC}"
else
  echo -e "${RED}❌ Linting failed${NC}"
  CHECKS_FAILED=1
fi
echo ""

# 6. Run tests
echo "🧪 Running tests..."
if npm test -- --passWithNoTests --silent 2>/dev/null; then
  echo -e "${GREEN}✓ Tests passed${NC}"
else
  echo -e "${RED}❌ Tests failed${NC}"
  CHECKS_FAILED=1
fi
echo ""

# 7. Summary
echo "=================================="
if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All governance checks passed!${NC}"
  echo "Safe to commit."
  exit 0
else
  echo -e "${RED}❌ Governance validation failed${NC}"
  echo "Please fix the issues above before committing."
  echo "See .claude/ directory for governance rules."
  exit 1
fi
