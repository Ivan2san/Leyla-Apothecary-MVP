#!/bin/bash
# Bash script to repair legacy Supabase migrations
# Run this after supabase login and supabase link

migrations=(
    "20250112000000"
    "20250112010000"
    "20250112020000"
    "20250112030000"
    "20250112040000"
    "20250112050000"
    "20250112060000"
    "20250209090000"
    "20250209090500"
    "20250209100000"
    "20250209110000"
    "20250215090000"
    "20250215090500"
)

echo -e "\033[36mStarting migration repair process...\033[0m"
echo ""

for version in "${migrations[@]}"; do
    echo -e "\033[33mRepairing migration: $version\033[0m"
    supabase migration repair "$version" --status applied

    if [ $? -eq 0 ]; then
        echo -e "\033[32m✓ Successfully repaired $version\033[0m"
    else
        echo -e "\033[31m✗ Failed to repair $version\033[0m"
        echo -e "\033[31mError code: $?\033[0m"
    fi
    echo ""
done

echo -e "\033[36mMigration repair complete!\033[0m"
echo ""
echo -e "\033[33mNext steps:\033[0m"
echo -e "\033[37m1. Run: supabase db push\033[0m"
echo -e "\033[37m2. Verify tables exist in Supabase dashboard\033[0m"
