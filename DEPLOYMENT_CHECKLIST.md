# Deployment Checklist

Complete guide for deploying wellness assessment features to production.

## Quick Start

```powershell
# 1. Run pre-deployment checks
.\scripts\pre-deployment-check.ps1

# 2. Install Supabase CLI (if not installed)
scoop install supabase
# OR
npm install -g supabase

# 3. Verify Supabase setup
.\scripts\verify-supabase-setup.ps1

# 4. Repair legacy migrations
.\scripts\repair-migrations.ps1

# 5. Apply new migrations
supabase db push

# 6. Create release tag
git tag -a v1.0.0 -m "Wellness package schema and seeds"
git push origin v1.0.0

# 7. Deploy
vercel --prod
```

## Detailed Steps

### Phase 1: Pre-Deployment Verification

**Automated Check:**
```powershell
.\scripts\pre-deployment-check.ps1
```

**Manual Verification:**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Production build succeeds
- [ ] Git working directory clean
- [ ] All commits pushed

**Skip optional checks (if needed):**
```powershell
.\scripts\pre-deployment-check.ps1 -SkipTests -SkipBuild
```

### Phase 2: Supabase CLI Setup

**Install Supabase CLI:**

Choose one method:

```powershell
# Option A: Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Option B: npm (Cross-platform)
npm install -g supabase

# Option C: Use npx (no install)
npx supabase@latest --version
```

**Login and Link:**
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your_project_ref>

# Verify setup
.\scripts\verify-supabase-setup.ps1
```

**If linking fails:**
```bash
# Use direct connection string with encoded password
supabase link --project-ref <ref> --password <encoded_password>
```

### Phase 3: Migration Management

**Check Migration Status:**
```bash
# List all migrations
supabase migration list

# Check remote status
supabase migration list --remote

# View pending migrations
.\scripts\verify-supabase-setup.ps1
```

**Repair Legacy Migrations:**

These migrations should already exist in your remote database:
- 20250112000000 - Initial schema
- 20250112010000 - Fix orders schema
- 20250112020000 - Add product images
- 20250112030000 - Add reviews
- 20250112040000 - Add availability management
- 20250112050000 - Add tiered compound structures
- 20250112060000 - Seed compound rules
- 20250209090000 - Add oligoscan booking type
- 20250209090500 - Add booking metadata
- 20250209100000 - Add assessment booking link
- 20250209110000 - Add practitioner ID to bookings
- 20250215090000 - Add wellness packages
- 20250215090500 - Seed wellness package booking types

```powershell
# Run automated repair
.\scripts\repair-migrations.ps1
```

**Manual repair (if script fails):**
```bash
supabase migration repair 20250112000000 --status applied
supabase migration repair 20250112010000 --status applied
# ... repeat for all legacy migrations
```

**Apply New Migrations:**

New migrations to be applied:
- 20250215100000 - Create wellness assessments table

```bash
# Push new migrations
supabase db push

# Alternative method
supabase migration up

# Verify migrations were applied
supabase migration list
```

### Phase 4: Database Verification

**Check Tables:**
```bash
# View database diff
supabase db diff

# List all tables
supabase db diff --schema public
```

**Expected Tables:**
- [x] `wellness_assessments`
- [x] `wellness_packages`
- [x] `wellness_package_enrolments`
- [x] `booking_types` (with wellness package types)

**Verify via Supabase Dashboard:**
1. Open Supabase Dashboard → Table Editor
2. Check `wellness_assessments` table exists
3. Verify RLS policies:
   - `allow_anon_insert_wellness_assessments` for INSERT
4. Check indexes:
   - `wellness_assessments_created_at_idx`

**Test Data Insertion:**
```sql
-- Test via Supabase SQL Editor
INSERT INTO wellness_assessments (
  name, email, phone,
  q1_digestive_issues, q2_sleep_quality,
  wellness_score, score_category
) VALUES (
  'Test User',
  'test@example.com',
  '555-0100',
  'Sometimes',
  'Fair',
  75,
  'moderate'
) RETURNING id;
```

### Phase 5: Release Management

**Create Git Tag:**
```bash
# Determine version number (semantic versioning)
# Format: vMAJOR.MINOR.PATCH
# Example: v1.0.0, v1.1.0, v2.0.0

# Create annotated tag
git tag -a v1.0.0 -m "Release: Wellness package schema and seeds

Features:
- Wellness assessment capture system
- Wellness packages and enrolments
- Deep Reset package booking flow
- Oligoscan integration

Database changes:
- New wellness_assessments table
- New wellness_packages table
- Booking type seeds for wellness packages
"

# Push tag to remote
git push origin v1.0.0

# Verify tag
git tag -l
git show v1.0.0
```

**Optional: Create GitHub Release:**
1. Go to GitHub repository → Releases
2. Click "Draft a new release"
3. Select tag: v1.0.0
4. Add release notes (use tag message)
5. Publish release

### Phase 6: Final Quality Checks

**Run Full Test Suite:**
```bash
# Type check
npm run type-check

# Linting
npm run lint

# Unit tests
npm test

# Integration tests (if available)
npm run test:e2e

# Build verification
npm run build
```

**Check Environment Variables:**

Verify these are set in your deployment environment (Vercel):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] Other required env vars

### Phase 7: Deploy to Production

**Using Vercel:**

```bash
# Deploy to production
vercel --prod

# Or trigger deployment via git push
git push origin main
```

**Verify Deployment:**
- [ ] Deployment succeeded in Vercel dashboard
- [ ] No build errors
- [ ] Environment variables loaded correctly

### Phase 8: Post-Deployment Verification

**Functional Testing:**

1. **Test Wellness Assessment Flow:**
   - [ ] Navigate to assessment page
   - [ ] Fill out wellness assessment form
   - [ ] Submit assessment
   - [ ] Verify data in Supabase dashboard
   - [ ] Check result page displays correctly

2. **Test Deep Reset Package:**
   - [ ] Navigate to Deep Reset page
   - [ ] Review package details
   - [ ] Click booking CTA
   - [ ] Verify booking flow works

3. **Test Oligoscan Flow:**
   - [ ] Navigate to Oligoscan page
   - [ ] Review service details
   - [ ] Test booking process

4. **Check Analytics:**
   - [ ] Verify wellness assessments are tracked
   - [ ] Check conversion funnel metrics
   - [ ] Test CTA click tracking

**Database Monitoring:**
```bash
# Check recent assessments
supabase db diff

# Monitor logs
supabase functions logs
```

**Rollback Plan (if needed):**
```bash
# Revert to previous version
vercel rollback

# Or redeploy previous tag
git checkout v0.9.0
vercel --prod
```

## Troubleshooting

### Migration Issues

**Error: "migration already applied"**
```bash
# This is usually safe - the migration exists in both places
# Verify with:
supabase migration list --remote
```

**Error: "cannot connect to database"**
```bash
# Check your link configuration
cat .git/supabase/config.toml

# Re-link if needed
supabase link --project-ref <ref>
```

**Error: "migration version conflict"**
```bash
# Check local vs remote
supabase migration list
supabase migration list --remote

# Repair specific migration
supabase migration repair <version> --status applied
```

### Build Issues

**TypeScript errors:**
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment variable issues:**
```bash
# Check .env.local exists
cat .env.local

# Verify required vars
grep NEXT_PUBLIC_SUPABASE_URL .env.local
```

### Deployment Issues

**Vercel build fails:**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure all dependencies are in package.json

**Database connection fails:**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure anon key has correct permissions

## Scripts Reference

All scripts located in `./scripts/`:

| Script | Purpose |
|--------|---------|
| `pre-deployment-check.ps1` | Full pre-deployment verification |
| `pre-deployment-check.sh` | Bash version of pre-deployment check |
| `verify-supabase-setup.ps1` | Verify Supabase CLI setup |
| `repair-migrations.ps1` | Repair legacy migrations |
| `repair-migrations.sh` | Bash version of repair script |

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Migration Guide:** See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
