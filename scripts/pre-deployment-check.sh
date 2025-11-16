#!/bin/bash
# Pre-Deployment Verification Script
# Run this before deploying to production

set +e  # Don't exit on error

SKIP_TESTS=false
SKIP_BUILD=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests) SKIP_TESTS=true; shift ;;
        --skip-build) SKIP_BUILD=true; shift ;;
        --verbose) VERBOSE=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

FAILED_CHECKS=()
PASSED_CHECKS=()
WARNING_CHECKS=()

function write_step() {
    echo -e "\n\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[36m  $1\033[0m"
    echo -e "\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
}

function write_check() {
    local name=$1
    local status=$2
    local message=$3

    case $status in
        pass)
            echo -e "  \033[32m✓\033[0m $name${message:+ - \033[90m$message\033[0m}"
            PASSED_CHECKS+=("$name")
            ;;
        fail)
            echo -e "  \033[31m✗\033[0m $name${message:+ - \033[31m$message\033[0m}"
            FAILED_CHECKS+=("$name")
            ;;
        warn)
            echo -e "  \033[33m⚠\033[0m $name${message:+ - \033[33m$message\033[0m}"
            WARNING_CHECKS+=("$name")
            ;;
    esac
}

function command_exists() {
    command -v "$1" &> /dev/null
}

# ============================================
# 1. Environment Check
# ============================================
write_step "1. Checking Environment"

if command_exists node; then
    NODE_VERSION=$(node --version)
    write_check "Node.js installed" "pass" "$NODE_VERSION"
else
    write_check "Node.js installed" "fail" "Not found"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    write_check "npm installed" "pass" "v$NPM_VERSION"
else
    write_check "npm installed" "fail" "Not found"
fi

if command_exists git; then
    write_check "Git installed" "pass"
else
    write_check "Git installed" "fail" "Not found"
fi

if command_exists supabase; then
    SUPABASE_VERSION=$(supabase --version)
    write_check "Supabase CLI installed" "pass" "$SUPABASE_VERSION"
else
    write_check "Supabase CLI installed" "warn" "Not found - install before migration"
fi

# ============================================
# 2. Git Status Check
# ============================================
write_step "2. Checking Git Status"

GIT_BRANCH=$(git branch --show-current)
write_check "Current branch" "pass" "$GIT_BRANCH"

GIT_STATUS=$(git status --porcelain)
if [ -n "$GIT_STATUS" ]; then
    CHANGED_FILES=$(echo "$GIT_STATUS" | wc -l)
    write_check "Uncommitted changes" "warn" "$CHANGED_FILES file(s) modified"
    if [ "$VERBOSE" = true ]; then
        git status --short
    fi
else
    write_check "Working directory clean" "pass"
fi

UNPUSHED_COMMITS=$(git log origin/$GIT_BRANCH..$GIT_BRANCH --oneline 2>/dev/null)
if [ -n "$UNPUSHED_COMMITS" ]; then
    COMMIT_COUNT=$(echo "$UNPUSHED_COMMITS" | wc -l)
    write_check "Unpushed commits" "warn" "$COMMIT_COUNT commit(s)"
else
    write_check "All commits pushed" "pass"
fi

# ============================================
# 3. Dependencies Check
# ============================================
write_step "3. Checking Dependencies"

if [ -f "package.json" ]; then
    write_check "package.json found" "pass"

    if [ -d "node_modules" ]; then
        write_check "node_modules exists" "pass"
    else
        write_check "node_modules exists" "fail" "Run npm install"
    fi

    if [ -f "package-lock.json" ]; then
        write_check "package-lock.json found" "pass"
    else
        write_check "package-lock.json found" "warn" "Consider committing lock file"
    fi
else
    write_check "package.json found" "fail"
fi

# ============================================
# 4. TypeScript Type Check
# ============================================
write_step "4. Running Type Check"

echo -e "  \033[90mRunning: npm run type-check...\033[0m"
TYPE_CHECK_OUTPUT=$(npm run type-check 2>&1)
TYPE_CHECK_EXIT=$?

if [ $TYPE_CHECK_EXIT -eq 0 ]; then
    write_check "TypeScript compilation" "pass" "No type errors"
else
    write_check "TypeScript compilation" "fail" "Type errors found"
    if [ "$VERBOSE" = true ]; then
        echo -e "\033[31m$TYPE_CHECK_OUTPUT\033[0m"
    fi
fi

# ============================================
# 5. Linting
# ============================================
write_step "5. Running Linter"

echo -e "  \033[90mRunning: npm run lint...\033[0m"
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -eq 0 ]; then
    write_check "ESLint" "pass" "No linting errors"
else
    write_check "ESLint" "fail" "Linting errors found"
    if [ "$VERBOSE" = true ]; then
        echo -e "\033[31m$LINT_OUTPUT\033[0m"
    fi
fi

# ============================================
# 6. Tests
# ============================================
if [ "$SKIP_TESTS" = false ]; then
    write_step "6. Running Tests"

    echo -e "  \033[90mRunning: npm test...\033[0m"
    TEST_OUTPUT=$(npm test 2>&1)
    TEST_EXIT=$?

    if [ $TEST_EXIT -eq 0 ]; then
        write_check "Jest tests" "pass" "All tests passing"
    else
        write_check "Jest tests" "fail" "Some tests failing"
        if [ "$VERBOSE" = true ]; then
            echo -e "\033[31m$TEST_OUTPUT\033[0m"
        fi
    fi
else
    write_step "6. Tests (SKIPPED)"
    write_check "Jest tests" "warn" "Skipped by user flag"
fi

# ============================================
# 7. Build Check
# ============================================
if [ "$SKIP_BUILD" = false ]; then
    write_step "7. Running Production Build"

    echo -e "  \033[90mRunning: npm run build...\033[0m"
    BUILD_OUTPUT=$(npm run build 2>&1)
    BUILD_EXIT=$?

    if [ $BUILD_EXIT -eq 0 ]; then
        write_check "Production build" "pass" "Build succeeded"
    else
        write_check "Production build" "fail" "Build failed"
        if [ "$VERBOSE" = true ]; then
            echo -e "\033[31m$BUILD_OUTPUT\033[0m"
        fi
    fi
else
    write_step "7. Build Check (SKIPPED)"
    write_check "Production build" "warn" "Skipped by user flag"
fi

# ============================================
# 8. Migration Files Check
# ============================================
write_step "8. Checking Migration Files"

MIGRATION_PATH="supabase/migrations"
if [ -d "$MIGRATION_PATH" ]; then
    MIGRATION_COUNT=$(find "$MIGRATION_PATH" -name "*.sql" | wc -l)
    write_check "Migration directory exists" "pass" "$MIGRATION_COUNT migration files found"

    if find "$MIGRATION_PATH" -name "*wellness_assessments*" | grep -q .; then
        WELLNESS_FILE=$(find "$MIGRATION_PATH" -name "*wellness_assessments*" -exec basename {} \;)
        write_check "Wellness assessment migration" "pass" "$WELLNESS_FILE"
    else
        write_check "Wellness assessment migration" "warn" "Not found"
    fi

    if find "$MIGRATION_PATH" -name "*wellness_packages*" | grep -q .; then
        PACKAGES_FILE=$(find "$MIGRATION_PATH" -name "*wellness_packages*" -exec basename {} \;)
        write_check "Wellness packages migration" "pass" "$PACKAGES_FILE"
    else
        write_check "Wellness packages migration" "warn" "Not found"
    fi
else
    write_check "Migration directory exists" "fail" "supabase/migrations not found"
fi

# ============================================
# 9. Environment Variables Check
# ============================================
write_step "9. Checking Environment Configuration"

if [ -f ".env.local" ]; then
    write_check ".env.local exists" "pass"

    ENV_CONTENT=$(cat .env.local)

    REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")

    for var in "${REQUIRED_VARS[@]}"; do
        if echo "$ENV_CONTENT" | grep -q "$var"; then
            write_check "$var configured" "pass"
        else
            write_check "$var configured" "fail" "Missing in .env.local"
        fi
    done
else
    write_check ".env.local exists" "warn" "Create from .env.example"
fi

# ============================================
# 10. Supabase Connection Check
# ============================================
if command_exists supabase; then
    write_step "10. Checking Supabase Configuration"

    if [ -f ".git/supabase/config.toml" ]; then
        write_check "Supabase project linked" "pass"

        echo -e "  \033[90mRunning: supabase migration list...\033[0m"
        MIGRATION_LIST=$(supabase migration list 2>&1)
        MIGRATION_EXIT=$?

        if [ $MIGRATION_EXIT -eq 0 ]; then
            write_check "Migration status accessible" "pass"
        else
            write_check "Migration status accessible" "warn" "Cannot connect to Supabase"
        fi
    else
        write_check "Supabase project linked" "warn" "Run: supabase link --project-ref <ref>"
    fi
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[36m  DEPLOYMENT READINESS SUMMARY\033[0m"
echo -e "\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""

echo -e "  \033[32m✓ Passed:  ${#PASSED_CHECKS[@]}\033[0m"
echo -e "  \033[33m⚠ Warnings: ${#WARNING_CHECKS[@]}\033[0m"
echo -e "  \033[31m✗ Failed:  ${#FAILED_CHECKS[@]}\033[0m"
echo ""

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
    echo -e "  \033[32m🚀 Ready for deployment!\033[0m"
    echo ""
    echo -e "  \033[33mNext steps:\033[0m"
    echo -e "    \033[37m1. Review warnings (if any)\033[0m"
    echo -e "    \033[37m2. Run migration repair script\033[0m"
    echo -e "    \033[37m3. Apply new migrations with 'supabase db push'\033[0m"
    echo -e "    \033[37m4. Create release tag\033[0m"
    echo -e "    \033[37m5. Deploy to production\033[0m"
    exit 0
else
    echo -e "  \033[31m⛔ NOT ready for deployment\033[0m"
    echo ""
    echo -e "  \033[31mFailed checks:\033[0m"
    for check in "${FAILED_CHECKS[@]}"; do
        echo -e "    \033[37m• $check\033[0m"
    done
    echo ""
    echo -e "  \033[33mFix these issues before deploying.\033[0m"
    exit 1
fi
