#!/bin/bash
# Verification script for compound migrations idempotency
# This script tests that the compound migrations can be safely run multiple times

set -e

echo "========================================"
echo "Compound Migrations Idempotency Test"
echo "========================================"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI not found. Please install it first."
    echo "Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "Supabase CLI version: $(supabase --version)"
echo ""

# Migration files to test
migrations=(
    "20250112050000_add_tiered_compound_structures.sql"
    "20250112060000_seed_compound_rules.sql"
)

echo "Testing migrations:"
for migration in "${migrations[@]}"; do
    echo "  - $migration"
done
echo ""

# Function to run a single migration
test_migration() {
    local migration_file=$1
    local run_number=$2

    echo "Run #$run_number - Executing $migration_file..."

    local migration_path="supabase/migrations/$migration_file"

    if [ ! -f "$migration_path" ]; then
        echo "  Error: Migration file not found at $migration_path"
        return 1
    fi

    # Execute the migration using supabase db execute
    if supabase db execute --file "$migration_path" 2>&1; then
        echo "  ✓ Success!"
        return 0
    else
        echo "  ✗ Failed"
        return 1
    fi
}

# Function to check database connection
test_database_connection() {
    echo "Checking database connection..."

    if ! supabase status &> /dev/null; then
        echo "Error: Supabase is not running."
        echo "Please start Supabase with: supabase start"
        return 1
    fi

    echo "✓ Database connection OK"
    return 0
}

# Main test execution
echo "Step 1: Checking database connection"
echo "======================================"
if ! test_database_connection; then
    exit 1
fi
echo ""

echo "Step 2: Running migrations (First Pass)"
echo "========================================"
first_pass_success=true
for migration in "${migrations[@]}"; do
    if ! test_migration "$migration" 1; then
        first_pass_success=false
        break
    fi
done
echo ""

if [ "$first_pass_success" = false ]; then
    echo "First pass failed. Cannot proceed with idempotency test."
    exit 1
fi

echo "Step 3: Running migrations (Second Pass - Idempotency Test)"
echo "============================================================"
second_pass_success=true
for migration in "${migrations[@]}"; do
    if ! test_migration "$migration" 2; then
        second_pass_success=false
        echo ""
        echo "IDEMPOTENCY FAILURE: $migration failed on second run!"
        echo "This means the migration is not fully idempotent."
        break
    fi
done
echo ""

if [ "$second_pass_success" = true ]; then
    echo "Step 4: Running migrations (Third Pass - Extra Verification)"
    echo "============================================================"
    third_pass_success=true
    for migration in "${migrations[@]}"; do
        if ! test_migration "$migration" 3; then
            third_pass_success=false
            echo ""
            echo "IDEMPOTENCY FAILURE: $migration failed on third run!"
            break
        fi
    done
    echo ""

    if [ "$third_pass_success" = true ]; then
        echo "========================================"
        echo "✓ SUCCESS! All migrations are idempotent"
        echo "========================================"
        echo ""
        echo "All migrations passed 3 consecutive runs without errors."
        echo "The migrations are safe to run on databases with:"
        echo "  - Fresh schema"
        echo "  - Partial schema already applied"
        echo "  - Full schema already present"
        exit 0
    fi
fi

echo "========================================"
echo "✗ TEST FAILED"
echo "========================================"
echo "Some migrations failed the idempotency test."
echo "Please review the error messages above."
exit 1
