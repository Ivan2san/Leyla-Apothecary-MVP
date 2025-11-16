# Oligoscan Deployment Checklist

## Overview
This checklist ensures all Oligoscan plumbing is properly deployed, tested, and operational before going live.

---

## Pre-Deployment: Database Migrations

### Required Migrations (in order)

Apply these migrations to your Supabase database in the following order:

1. **20250209090000_add_oligoscan_booking_type.sql**
   - Adds `oligoscan_assessment` enum value to `booking_type`
   - Status: ⬜ Not Applied / ✅ Applied

2. **20250209090500_add_booking_metadata_and_oligoscan_config.sql**
   - Adds `metadata` JSONB column to bookings table
   - Inserts booking_type_config for oligoscan_assessment (60 min, $225.00)
   - Status: ⬜ Not Applied / ✅ Applied

3. **20250209100000_add_assessment_booking_link.sql**
   - Adds `booking_id` column to assessments table
   - Creates index on assessments.booking_id
   - Status: ⬜ Not Applied / ✅ Applied

4. **20250209110000_add_practitioner_id_to_bookings.sql** 🆕
   - Adds `practitioner_id` column to bookings table
   - Creates index on bookings.practitioner_id
   - Adds RLS policies for practitioners to view/update assigned bookings
   - Status: ⬜ Not Applied / ✅ Applied

### Verify Migrations Applied

```sql
-- Run this query in Supabase SQL Editor to verify all migrations are applied
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20250209090000',
  '20250209090500',
  '20250209100000',
  '20250209110000'
)
ORDER BY version;
```

Expected output: 4 rows showing all migration versions

---

## Pre-Deployment: Seed Data

### Verify booking_type_config

```sql
-- Verify Oligoscan booking type is configured
SELECT * FROM booking_type_config
WHERE type = 'oligoscan_assessment';
```

Expected output:
- `type`: 'oligoscan_assessment'
- `name`: 'Oligoscan Assessment'
- `description`: 'Intracellular mineral and heavy metal spectroscopy assessment...'
- `duration_minutes`: 60
- `price`: 225.00
- `is_active`: true

Status: ⬜ Not Verified / ✅ Verified

### Create Test Practitioner Account

```sql
-- Verify you have at least one practitioner account for testing
SELECT id, email, role FROM profiles
WHERE role IN ('practitioner', 'admin');
```

If no practitioner exists, create one:
```sql
-- Update an existing profile to be a practitioner
UPDATE profiles
SET role = 'practitioner'
WHERE email = 'your-test-practitioner@example.com';
```

Status: ⬜ Not Created / ✅ Created

---

## Pre-Deployment: Environment Variables

Verify these environment variables are set in your production environment:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (backend only)
- [ ] `RESEND_API_KEY` - Your Resend API key for emails
- [ ] `RESEND_FROM_ADDRESS` - Sender email address (defaults to hello@leylas-apothecary.com)

---

## Deployment: Code Changes

### Files Modified/Created

#### Migrations (4 files)
- [x] `supabase/migrations/20250209090000_add_oligoscan_booking_type.sql`
- [x] `supabase/migrations/20250209090500_add_booking_metadata_and_oligoscan_config.sql`
- [x] `supabase/migrations/20250209100000_add_assessment_booking_link.sql`
- [x] `supabase/migrations/20250209110000_add_practitioner_id_to_bookings.sql` 🆕

#### Booking Flow (4 files)
- [x] `components/booking/BookingForm.tsx` - Biometrics capture UI
- [x] `app/api/bookings/route.ts` - Booking creation API with email triggers
- [x] `lib/services/booking.service.ts` - Booking service with validation
- [x] `lib/validations/bookings.ts` - Oligoscan biometrics schema

#### Practitioner Dashboard (4 files)
- [x] `app/practitioner/page.tsx` - Dashboard with Oligoscan consultations list
- [x] `app/practitioner/oligoscan/[bookingId]/page.tsx` - Assessment recording page
- [x] `components/practitioner/OligoscanAssessmentForm.tsx` - Assessment form UI
- [x] `app/api/assessments/oligoscan/route.ts` - Assessment creation API

#### Client Dashboard (2 files)
- [x] `app/account/page.tsx` - Displays Oligoscan assessments
- [x] `app/account/bookings/page.tsx` - Lists all bookings

#### Marketing (3 files)
- [x] `app/oligoscan-testing/page.tsx` - Oligoscan information/landing page
- [x] `components/consultations/oligoscan/OligoscanInfoPanel.tsx` - Info component
- [x] `components/consultations/oligoscan/OligoscanQuickFacts.tsx` - Facts component

#### Email (2 files)
- [x] `lib/services/email.ts` - Email service with sendOligoscanPreConsult()
- [x] `emails/oligoscan-pre-consult.tsx` - Pre-consult email template

#### Types & Validation (3 files)
- [x] `lib/types/booking.types.ts` - OligoscanBiometrics type definitions
- [x] `lib/validations/assessments.ts` - Oligoscan assessment schema
- [x] `lib/validations/bookings.ts` - Biometrics validation

---

## Post-Deployment: Staging Tests

### Test 1: Booking Flow ✅ Client Perspective

1. [ ] Navigate to staging URL `/booking`
2. [ ] Select "Oligoscan Assessment" from booking type dropdown
3. [ ] Verify OligoscanInfoPanel and OligoscanQuickFacts appear
4. [ ] Verify biometrics section appears:
   - [ ] Date of Birth (date picker)
   - [ ] Gender (select: female/male/other/prefer not to say)
   - [ ] Blood Type (select: A+, A-, B+, B-, AB+, AB-, O+, O-, unknown)
   - [ ] Height (number input in cm)
   - [ ] Weight (number input in kg)
5. [ ] Fill out all fields with test data
6. [ ] Complete booking (may require test payment flow)
7. [ ] Verify booking confirmation email received
8. [ ] **CRITICAL:** Verify Oligoscan pre-consult email received from Resend
   - [ ] Check email subject: "Prepare for Your Oligoscan Assessment"
   - [ ] Verify preparation instructions are present
   - [ ] Verify email is properly formatted

**Expected Result:** Two emails received - confirmation + pre-consult preparation

---

### Test 2: Practitioner Dashboard 👨‍⚕️ Practitioner Perspective

1. [ ] Log in as practitioner account (role='practitioner' or 'admin')
2. [ ] Navigate to `/practitioner`
3. [ ] Verify "Oligoscan Consultations" section appears
4. [ ] Verify the test booking from Test 1 appears in the list
5. [ ] Click "Record Assessment" on the booking
6. [ ] Verify redirect to `/practitioner/oligoscan/[bookingId]`
7. [ ] Verify biometrics from booking are displayed (read-only)
8. [ ] Fill out assessment form:
   - [ ] Overall Concern Score: 0-10 slider
   - [ ] Practitioner Summary: 20-1200 characters
   - [ ] Key Findings: 3-6 bullet points
   - [ ] Categories: Minerals, Heavy Metals, Vitamins
9. [ ] Submit assessment
10. [ ] Verify redirect back to practitioner dashboard
11. [ ] Verify booking now shows "Assessment Completed"

**Expected Result:** Assessment successfully recorded and visible in dashboard

---

### Test 3: Client Dashboard 👤 Client Perspective

1. [ ] Log in as the client who made the booking in Test 1
2. [ ] Navigate to `/account`
3. [ ] Verify "Oligoscan Assessments" section appears
4. [ ] Verify the assessment from Test 2 appears:
   - [ ] Assessment date is shown
   - [ ] Overall score is displayed
   - [ ] First 3 key findings are shown
   - [ ] Category statuses displayed (Minerals, Heavy Metals, Vitamins)
5. [ ] Expand "View Details" (if expandable UI exists)
6. [ ] Verify practitioner summary is visible
7. [ ] Navigate to `/account/bookings`
8. [ ] Verify booking status shows "Completed"

**Expected Result:** Client can view their Oligoscan assessment results

---

### Test 4: Marketing Page 📄 Public Perspective

1. [ ] Navigate to `/oligoscan-testing` (logged out)
2. [ ] Verify page loads correctly
3. [ ] Verify content includes:
   - [ ] "What is Oligoscan?" section
   - [ ] Quick facts (21 minerals, 16 heavy metals, 7 vitamins)
   - [ ] Comparison to other tests (blood work, hair/urine)
   - [ ] FAQs section
4. [ ] Click "Book Oligoscan Assessment" CTA
5. [ ] Verify redirect to `/booking` with oligoscan pre-selected

**Expected Result:** Marketing page loads and CTAs work correctly

---

### Test 5: Email Delivery 📧 Resend Verification

1. [ ] Log into Resend dashboard (resend.com)
2. [ ] Navigate to "Emails" or "Logs" section
3. [ ] Find the pre-consult email sent in Test 1
4. [ ] Verify email details:
   - [ ] Status: Delivered (not bounced/failed)
   - [ ] To: Correct test user email
   - [ ] From: Configured sender address
   - [ ] Subject: "Prepare for Your Oligoscan Assessment"
5. [ ] Open email in Resend's preview
6. [ ] Verify formatting and content

**Expected Result:** Email delivered successfully and looks professional

---

## Post-Deployment: Database Verification

### Verify Data Integrity

```sql
-- Check that bookings have metadata with biometrics
SELECT
  id,
  type,
  practitioner_id,
  metadata->'biometrics' as biometrics,
  status
FROM bookings
WHERE type = 'oligoscan_assessment'
ORDER BY created_at DESC
LIMIT 5;
```

Expected: Should see test booking with biometrics populated

```sql
-- Check that assessments are linked to bookings
SELECT
  a.id,
  a.type,
  a.booking_id,
  b.type as booking_type,
  a.score,
  a.created_at
FROM assessments a
JOIN bookings b ON a.booking_id = b.id
WHERE a.type = 'oligoscan_v1'
ORDER BY a.created_at DESC
LIMIT 5;
```

Expected: Should see test assessment linked to test booking

Status: ⬜ Not Verified / ✅ Verified

---

## Rollback Plan

If issues are discovered during testing:

### Code Rollback
```bash
git revert HEAD~1  # Revert the Oligoscan feature commit
git push origin main
```

### Database Rollback
```sql
-- Remove practitioner_id column (migration 20250209110000)
ALTER TABLE bookings DROP COLUMN IF EXISTS practitioner_id;
DROP INDEX IF EXISTS idx_bookings_practitioner_id;
DROP POLICY IF EXISTS "Practitioners can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Practitioners can update assigned bookings" ON bookings;

-- Remove booking_id from assessments (migration 20250209100000)
ALTER TABLE assessments DROP COLUMN IF EXISTS booking_id;
DROP INDEX IF EXISTS idx_assessments_booking_id;

-- Remove metadata column (migration 20250209090500)
ALTER TABLE bookings DROP COLUMN IF EXISTS metadata;
DELETE FROM booking_type_config WHERE type = 'oligoscan_assessment';

-- Remove oligoscan_assessment enum value (cannot be removed easily)
-- Instead, set booking_type_config.is_active = false
UPDATE booking_type_config SET is_active = false WHERE type = 'oligoscan_assessment';
```

---

## Success Criteria

All items must be checked before considering Oligoscan deployment complete:

- [ ] All 4 migrations applied successfully
- [ ] Booking type config verified in database
- [ ] Test practitioner account exists
- [ ] All environment variables set
- [ ] Test 1: Booking flow works end-to-end
- [ ] Test 2: Practitioner can record assessments
- [ ] Test 3: Client can view assessment results
- [ ] Test 4: Marketing page loads correctly
- [ ] Test 5: Resend emails are delivered
- [ ] Database integrity verified
- [ ] No console errors in browser (F12 dev tools)
- [ ] No 500 errors in server logs
- [ ] Linting passes (`npm run lint`)

---

## Production Deployment Timeline

1. **Day -1:** Apply migrations to staging database
2. **Day -1:** Run all staging tests
3. **Day 0:** Apply migrations to production database
4. **Day 0:** Deploy code to production
5. **Day 0:** Run smoke tests on production
6. **Day 0:** Monitor Resend for email delivery
7. **Day +1:** Review error logs and user feedback
8. **Day +7:** Review analytics for Oligoscan bookings

---

## Support Contacts

- **Database Issues:** Supabase dashboard → Project Settings → Support
- **Email Issues:** Resend dashboard → Support
- **Code Issues:** Check application logs and error monitoring

---

## Notes

- The `practitioner_id` column is nullable, allowing bookings to be created without a practitioner assigned
- Practitioners can be assigned to bookings later via an admin interface (if implemented)
- The pre-consult email is sent immediately upon booking creation, not at a scheduled time
- Assessment data is stored in JSONB format for flexibility
- All Oligoscan data is protected by Row Level Security (RLS) policies

---

**Last Updated:** 2025-02-15
**Version:** 1.0
**Prepared By:** Claude Code
