#!/bin/bash
# Complete deployment workflow using npx
# This script handles the entire deployment process

set -e

PROJECT_REF="ivpsqihvuipnzjpghdaa"
SUPABASE="npx supabase@latest"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Supabase Migration & Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if logged in
echo "Step 1: Checking Supabase authentication..."
if ! $SUPABASE projects list &>/dev/null; then
    echo "⚠ Not logged in to Supabase"
    echo "Running: $SUPABASE login"
    $SUPABASE login
    echo "✓ Logged in successfully"
else
    echo "✓ Already authenticated"
fi
echo ""

# Step 2: Link project
echo "Step 2: Linking to Supabase project..."
echo "Project Reference: $PROJECT_REF"

if [ -f ".git/config.toml" ]; then
    echo "✓ Project already linked"
else
    echo "Running: $SUPABASE link --project-ref $PROJECT_REF"
    $SUPABASE link --project-ref $PROJECT_REF
    echo "✓ Project linked successfully"
fi
echo ""

# Step 3: Check migration status
echo "Step 3: Checking migration status..."
echo "Running: $SUPABASE migration list"
$SUPABASE migration list
echo ""

# Step 4: Repair legacy migrations
echo "Step 4: Repairing legacy migrations..."
echo "This marks migrations that already exist remotely as applied locally"
echo ""

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

for version in "${migrations[@]}"; do
    echo "  Repairing migration: $version"
    if $SUPABASE migration repair "$version" --status applied 2>/dev/null; then
        echo "  ✓ Repaired $version"
    else
        echo "  ⚠ Could not repair $version (may not exist remotely or already repaired)"
    fi
done
echo ""

# Step 5: Apply new migrations
echo "Step 5: Applying new migrations..."
echo "Running: $SUPABASE db push"
echo ""
read -p "Press Enter to apply migrations, or Ctrl+C to cancel..."
$SUPABASE db push
echo "✓ Migrations applied successfully"
echo ""

# Step 6: Verify migrations
echo "Step 6: Verifying migration status..."
$SUPABASE migration list
echo ""

# Step 7: Git tag (optional)
echo "Step 7: Create release tag (optional)"
echo "Current tags:"
git tag -l | tail -5
echo ""
read -p "Enter version tag (e.g., v1.0.0) or press Enter to skip: " VERSION_TAG

if [ -n "$VERSION_TAG" ]; then
    echo "Creating tag: $VERSION_TAG"
    git tag -a "$VERSION_TAG" -m "Release: Wellness package schema and seeds

Features:
- Wellness assessment capture system
- Wellness packages and enrolments
- Deep Reset package booking flow

Database migrations:
- wellness_assessments table
- wellness_packages schema
- RLS policies and indexes
"

    echo "✓ Tag created: $VERSION_TAG"
    echo ""
    read -p "Push tag to remote? (y/n): " PUSH_TAG
    if [ "$PUSH_TAG" = "y" ]; then
        git push origin "$VERSION_TAG"
        echo "✓ Tag pushed to remote"
    fi
else
    echo "⊘ Skipped tag creation"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Verify tables in Supabase Dashboard"
echo "  2. Test wellness assessment locally"
echo "  3. Deploy to production (vercel --prod)"
echo ""
