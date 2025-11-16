# Supabase Migration Guide

## Prerequisites Checklist

- [ ] Supabase CLI installed
- [ ] Supabase project reference ID available
- [ ] Database connection string (if direct linking needed)

## Step 1: Install Supabase CLI

Choose one of the following methods:

### Option A: Using Scoop (Windows)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option B: Using npm/npx
```bash
npm install -g supabase
# Or use npx for one-off commands:
npx supabase@latest --version
```

### Option C: Direct download
Visit: https://github.com/supabase/cli/releases

Verify installation:
```bash
supabase --version
```

## Step 2: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your_project_ref>

# If linking fails, use connection string with percent-encoded credentials:
# supabase link --project-ref <ref> --password <encoded_password>
```

## Step 3: Repair Legacy Migrations

Run the automated repair script:

### PowerShell (Windows):
```powershell
.\scripts\repair-migrations.ps1
```

### Bash (Git Bash/WSL):
```bash
chmod +x scripts/repair-migrations.sh
./scripts/repair-migrations.sh
```

### Manual approach (if scripts fail):
```bash
supabase migration repair 20250112000000 --status applied
supabase migration repair 20250112010000 --status applied
supabase migration repair 20250112020000 --status applied
supabase migration repair 20250112030000 --status applied
supabase migration repair 20250112040000 --status applied
supabase migration repair 20250112050000 --status applied
supabase migration repair 20250112060000 --status applied
supabase migration repair 20250209090000 --status applied
supabase migration repair 20250209090500 --status applied
supabase migration repair 20250209100000 --status applied
```

## Step 4: Apply New Migrations

After repairs complete:

```bash
# Apply pending migrations
supabase db push

# Alternative method:
supabase migration up
```

Expected new migrations:
- `20250215100000_create_wellness_assessments.sql`
- Any wellness package related migrations

## Step 5: Verify Database State

```bash
# Check migration status
supabase migration list

# Verify tables in database
supabase db diff
```

In Supabase Dashboard, verify these tables exist:
- `wellness_assessments`
- `wellness_packages`
- `wellness_package_enrolments`

## Step 6: Create Release Tag

```bash
# Create annotated tag (update version as needed)
git tag -a v1.0.0 -m "Wellness package schema and seeds"

# Push tag to remote
git push origin v1.0.0

# Optional: View all tags
git tag -l
```

## Step 7: Run Tests and Linting

```bash
# Lint check
npm run lint

# Run tests
npm test

# Check Supabase push logs
supabase db push --debug
```

## Step 8: Deploy

### Vercel Deployment

Ensure environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

```bash
# Deploy to production
vercel --prod
```

### Post-Deployment Verification

1. Navigate to Deep Reset page
2. Test wellness assessment submission
3. Verify data appears in Supabase dashboard
4. Check booking flows work correctly

## Troubleshooting

### Migration repair fails with "already applied"
This is usually safe to ignore if the migration exists in both local and remote.

### Connection issues during link
Use direct connection string with percent-encoded password:
```bash
supabase link --project-ref <ref> --password $(echo 'your_password' | jq -sRr @uri)
```

### Migrations out of sync
```bash
# Reset local migration state (CAREFUL - this is destructive)
supabase db reset

# Or repair individual migrations
supabase migration repair <version> --status reverted
```

## Quick Reference

```bash
# Check what migrations are pending
supabase migration list

# View migration history
supabase migration list --remote

# Check database diff
supabase db diff

# View logs
supabase functions deploy --debug
```
