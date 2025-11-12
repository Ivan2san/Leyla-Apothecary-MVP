#!/bin/bash
# Governance Status Dashboard
# Shows current governance compliance status

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Leyla's Apothecary - Governance Status Dashboard${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Branch Information
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo -e "${BLUE}📍 Current Branch:${NC} $CURRENT_BRANCH"
if [[ "$CURRENT_BRANCH" =~ ^(feature|fix|hotfix|test|docs|refactor)/[a-z0-9-]+$ ]]; then
  echo -e "   ${GREEN}✓ Follows naming convention${NC}"
elif [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo -e "   ${YELLOW}⚠️  Working directly on main branch${NC}"
else
  echo -e "   ${RED}✗ Does not follow naming convention${NC}"
fi
echo ""

# 2. Uncommitted Changes
MODIFIED_FILES=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$MODIFIED_FILES" -eq 0 ]; then
  echo -e "${BLUE}📝 Working Directory:${NC} ${GREEN}Clean${NC}"
else
  echo -e "${BLUE}📝 Working Directory:${NC} ${YELLOW}$MODIFIED_FILES file(s) modified${NC}"
fi
echo ""

# 3. Test Status
echo -e "${BLUE}🧪 Test Status:${NC}"
if npm test -- --passWithNoTests --silent 2>/dev/null; then
  TOTAL_TESTS=$(npm test -- --passWithNoTests --silent 2>/dev/null | grep -oP '\d+(?= passed)' | tail -1)
  echo -e "   ${GREEN}✓ All tests passing ($TOTAL_TESTS tests)${NC}"
else
  echo -e "   ${RED}✗ Tests failing${NC}"
fi
echo ""

# 4. Code Quality
echo -e "${BLUE}✨ Code Quality:${NC}"

# TypeScript
if npm run type-check --silent 2>/dev/null; then
  echo -e "   ${GREEN}✓ TypeScript: No errors${NC}"
else
  echo -e "   ${RED}✗ TypeScript: Errors found${NC}"
fi

# ESLint
if npm run lint --silent 2>/dev/null; then
  echo -e "   ${GREEN}✓ ESLint: No issues${NC}"
else
  echo -e "   ${YELLOW}⚠️  ESLint: Issues found${NC}"
fi
echo ""

# 5. Coverage Status (if coverage data exists)
if [ -f "coverage/coverage-summary.json" ]; then
  echo -e "${BLUE}📊 Test Coverage:${NC}"
  # Parse coverage data (would need jq or similar)
  echo -e "   ${YELLOW}Run 'npm run test:coverage' for detailed report${NC}"
  echo ""
fi

# 6. Governance Files Status
echo -e "${BLUE}📋 Governance Files:${NC}"
GOVERNANCE_FILES=(
  ".claude/PROJECT_RULES.md"
  ".claude/FORBIDDEN_CHANGES.md"
  ".claude/TEST_REQUIREMENTS.md"
  ".claude/COMMON_FIXES.md"
)

ALL_EXIST=true
for file in "${GOVERNANCE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "   ${GREEN}✓${NC} $file"
  else
    echo -e "   ${RED}✗${NC} $file ${RED}(missing)${NC}"
    ALL_EXIST=false
  fi
done
echo ""

# 7. Forbidden Files Check
FORBIDDEN_MODIFIED=0
FORBIDDEN_FILES=(
  "app/api/checkout/route.ts"
  "app/api/webhooks/stripe/route.ts"
  "lib/stripe/client.ts"
  "lib/stripe/server.ts"
  "lib/auth/provider.tsx"
)

MODIFIED=$(git status --porcelain 2>/dev/null | awk '{print $2}')
for forbidden in "${FORBIDDEN_FILES[@]}"; do
  if echo "$MODIFIED" | grep -q "$forbidden"; then
    if [ $FORBIDDEN_MODIFIED -eq 0 ]; then
      echo -e "${BLUE}⚠️  Forbidden Files:${NC}"
    fi
    echo -e "   ${RED}✗ $forbidden (modified!)${NC}"
    FORBIDDEN_MODIFIED=1
  fi
done

if [ $FORBIDDEN_MODIFIED -eq 0 ]; then
  echo -e "${BLUE}🔒 Forbidden Files:${NC} ${GREEN}Protected${NC}"
fi
echo ""

# 8. Summary
echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}Summary:${NC}"

if [ "$FORBIDDEN_MODIFIED" -eq 0 ] && [ "$ALL_EXIST" = true ] && \
   npm test -- --passWithNoTests --silent 2>/dev/null && \
   npm run type-check --silent 2>/dev/null; then
  echo -e "${GREEN}✅ All governance checks passing!${NC}"
  echo -e "   Ready to commit changes."
else
  echo -e "${YELLOW}⚠️  Some issues detected${NC}"
  echo -e "   Run: ${BOLD}npm run gov:check${NC} for detailed validation"
fi

echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Quick Commands:"
echo -e "  ${BOLD}npm run gov:check${NC}      - Full governance validation"
echo -e "  ${BOLD}npm run gov:validate${NC}   - Quick validation (before commit)"
echo -e "  ${BOLD}npm test${NC}               - Run all tests"
echo -e "  ${BOLD}npm run test:critical${NC}  - Run critical path tests only"
echo ""
