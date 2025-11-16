# Oligoscan Testing Guide

This guide will walk you through testing the complete Oligoscan flow step-by-step.

---

## Step 1: Database Verification ✅

### Run Verification Queries

1. Open **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy and paste queries from [verify-oligoscan-setup.sql](verify-oligoscan-setup.sql)
3. Run each query and verify the expected results

**Critical Checks:**
- ✅ All 4 migrations appear (20250209090000, 090500, 100000, 110000)
- ✅ `bookings` table has `metadata` and `practitioner_id` columns
- ✅ `booking_type` enum includes `oligoscan_assessment`
- ✅ `booking_type_config` has Oligoscan entry (60 min, $225.00, active)
- ✅ Indexes created: `idx_bookings_practitioner_id`, `idx_assessments_booking_id`
- ✅ RLS policies exist for practitioners

---

## Step 2: Create Test Practitioner Account 👨‍⚕️

### Option A: Make Yourself a Practitioner (Recommended for Testing)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Find your user email:
   ```sql
   SELECT id, email FROM auth.users
   WHERE email = 'YOUR_EMAIL_HERE';
   ```
3. Update your profile to practitioner role:
   ```sql
   UPDATE profiles
   SET role = 'practitioner', updated_at = NOW()
   WHERE email = 'YOUR_EMAIL_HERE'
   RETURNING id, email, full_name, role;
   ```
4. **Note your user ID** - you'll use this to assign bookings

### Option B: Create Separate Test Practitioner

1. Sign up a new user via your app's auth flow (e.g., `/auth/signup`)
2. Use email like `practitioner@test.com` and a test password
3. After signup, run this SQL:
   ```sql
   UPDATE profiles
   SET role = 'practitioner', full_name = 'Dr. Test Practitioner'
   WHERE email = 'practitioner@test.com'
   RETURNING id, email, role;
   ```

**Verification:**
```sql
SELECT id, email, full_name, role
FROM profiles
WHERE role IN ('practitioner', 'admin');
```

Should show at least 1 practitioner account.

---

## Step 3: Set Up Resend API Key 📧

### Get Resend API Key

1. Go to [Resend.com](https://resend.com/)
2. Sign up or log in
3. Navigate to **API Keys** → **Create API Key**
4. Copy the API key (starts with `re_...`)

### Update .env.local

1. Open `.env.local` in your project root
2. Replace the placeholder:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
3. Optionally update the sender address:
   ```env
   EMAIL_FROM=hello@leylas-apothecary.com
   ```
   (You'll need to verify this domain in Resend)

### Verify Domain (Production Only)

For production, you'll need to:
1. Go to Resend → **Domains** → **Add Domain**
2. Add `leylas-apothecary.com` (or your domain)
3. Add the DNS records Resend provides
4. Wait for verification

**For local testing**, you can use Resend's test mode which sends to any email.

---

## Step 4: Start Dev Server 🚀

```bash
npm run dev
```

Server should start at: `http://localhost:3000`

**Verify no errors in console** - check terminal output.

---

## Step 5: Test Booking Flow (Client View) 📝

### 5.1 Navigate to Booking Page

1. Open browser: `http://localhost:3000/booking`
2. **If auth required**: Sign up/log in as a regular user (NOT the practitioner)
   - Use email like `client@test.com`

### 5.2 Select Oligoscan Assessment

1. In the booking form, find the **Booking Type** dropdown
2. Select **"Oligoscan Assessment"**
3. **Verify** the following UI elements appear:
   - OligoscanInfoPanel (explains what Oligoscan is)
   - OligoscanQuickFacts (21 minerals, 16 heavy metals, 7 vitamins)
   - Biometrics section (should expand/show)

### 5.3 Fill Out Biometrics

Complete all biometrics fields:
- **Date of Birth**: Pick any date (e.g., 1990-01-15)
- **Gender**: Select one (Female/Male/Other/Prefer not to say)
- **Blood Type**: Select one (A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown)
- **Height (cm)**: Enter a number (e.g., 170)
- **Weight (kg)**: Enter a number (e.g., 70)

### 5.4 Fill Out Booking Details

- **Date**: Select a future date
- **Time**: Select a time slot
- **Notes** (optional): Add any notes

### 5.5 Submit Booking

1. Click **"Book Appointment"** or similar submit button
2. **Handle Payment** (if payment flow exists):
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)

### 5.6 Verify Success

**Expected Results:**
- ✅ Booking confirmation message/page appears
- ✅ Redirect to confirmation page or account page
- ✅ **Check email inbox** (client@test.com or your test email)
  - Should receive **2 emails**:
    1. **Booking Confirmation** email
    2. **Oligoscan Pre-Consult Preparation** email (with prep instructions)

**If emails don't arrive:**
- Check spam/junk folder
- Check terminal for errors
- Check Resend dashboard (next step)

### 5.7 Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Look for the 2 emails in the **Emails** list
3. Click each email to verify:
   - Status: **Delivered** (not failed/bounced)
   - To: Correct recipient email
   - Subject lines are correct
   - Preview looks good

**Note the booking ID** - you'll need it for practitioner tests.

---

## Step 6: Assign Booking to Practitioner 🔗

Bookings are created without a practitioner by default. Assign it manually:

### Via SQL

```sql
-- Find your test booking
SELECT id, user_id, type, date, time, status, practitioner_id
FROM bookings
WHERE type = 'oligoscan_assessment'
ORDER BY created_at DESC
LIMIT 1;

-- Assign to your practitioner (replace IDs)
UPDATE bookings
SET practitioner_id = 'PRACTITIONER_USER_ID_HERE'
WHERE id = 'BOOKING_ID_HERE'
RETURNING id, practitioner_id, status;
```

**Get your practitioner ID:**
```sql
SELECT id, email, role
FROM profiles
WHERE role = 'practitioner';
```

---

## Step 7: Test Practitioner Dashboard 👨‍⚕️

### 7.1 Log In as Practitioner

1. **Log out** of the client account
2. **Log in** with practitioner credentials
   - Email: The email you set to role='practitioner'
   - Password: Your password

### 7.2 Navigate to Practitioner Dashboard

1. Go to: `http://localhost:3000/practitioner`
2. **Verify** the dashboard loads without errors

### 7.3 Find Oligoscan Consultation

**Verify** the dashboard shows:
- ✅ "Oligoscan Consultations" section
- ✅ Your test booking appears in the list
- ✅ Shows client name, date, time
- ✅ Shows "Assessment Pending" or similar status
- ✅ "Record Assessment" button is visible

**If booking doesn't appear:**
- Verify you assigned `practitioner_id` in Step 6
- Check browser console for errors (F12)
- Verify the practitioner is logged in (check session)

### 7.4 Click "Record Assessment"

1. Click the **"Record Assessment"** button
2. **Verify** redirect to: `/practitioner/oligoscan/[bookingId]`
3. Page should load successfully

---

## Step 8: Record Oligoscan Assessment 📊

### 8.1 Verify Biometrics Display

**Verify** the page shows the biometrics you entered:
- ✅ Date of Birth
- ✅ Gender
- ✅ Blood Type
- ✅ Height (cm)
- ✅ Weight (kg)

These should be **read-only** (not editable).

### 8.2 Fill Out Assessment Form

Complete all assessment fields:

**Overall Concern Score:**
- Drag slider to a value (e.g., 6/10)

**Practitioner Summary:**
- Enter 20-1200 characters
- Example:
  ```
  Client presents with moderate mineral depletion, particularly in magnesium
  and zinc. Heavy metal screening shows mild mercury burden. Recommend targeted
  supplementation protocol and follow-up in 8 weeks.
  ```

**Key Findings:**
- Add 3-6 bullet points
- Click "Add Finding" button for each
- Examples:
  - "Magnesium levels depleted - likely contributing to fatigue"
  - "Mild mercury burden detected - review fish consumption"
  - "Zinc borderline - consider supplementation"

**Category Assessments:**

1. **Minerals** - Select status:
   - Optimal / Borderline / Depleted / Excess
   - Example: Select "Depleted"

2. **Heavy Metals** - Select status:
   - None Detected / Mild Burden / Moderate Burden / High Burden
   - Example: Select "Mild Burden"

3. **Vitamins** - Select status:
   - Optimal / Borderline / Depleted
   - Example: Select "Borderline"

### 8.3 Submit Assessment

1. Click **"Submit Assessment"** or **"Save Assessment"**
2. **Verify** success:
   - ✅ Success message appears
   - ✅ Redirect back to practitioner dashboard
   - ✅ Booking now shows "Assessment Completed" status
   - ✅ No errors in browser console

**If submission fails:**
- Check browser console (F12) for error messages
- Verify all required fields are filled
- Check terminal/server logs for API errors

---

## Step 9: Test Client Dashboard (View Results) 👤

### 9.1 Log In as Client

1. **Log out** of practitioner account
2. **Log in** as the client who made the booking
   - Email: `client@test.com` (or your test client email)

### 9.2 Navigate to Account Dashboard

1. Go to: `http://localhost:3000/account`
2. Page should load successfully

### 9.3 Verify Oligoscan Assessments Section

**Verify** the account page shows:
- ✅ "Oligoscan Assessments" section exists
- ✅ Your assessment appears in the list
- ✅ Shows assessment date
- ✅ Shows overall concern score (e.g., 6/10)
- ✅ Shows first 3 key findings
- ✅ Shows category statuses:
  - Minerals: (your selected status)
  - Heavy Metals: (your selected status)
  - Vitamins: (your selected status)

### 9.4 View Full Details

1. Click **"View Details"** or expand section (if implemented)
2. **Verify** practitioner summary is visible
3. **Verify** all key findings are shown

### 9.5 Check Bookings Page

1. Navigate to: `http://localhost:3000/account/bookings`
2. **Verify** your Oligoscan booking appears
3. **Verify** status shows "Completed"

---

## Step 10: Test Marketing Page 📄

### 10.1 Navigate to Oligoscan Info Page

1. Go to: `http://localhost:3000/oligoscan-testing`
2. Page should load (works when logged out too)

### 10.2 Verify Content

**Check that page includes:**
- ✅ "What is Oligoscan?" explanation
- ✅ Quick facts (21 minerals, 16 heavy metals, 7 vitamins)
- ✅ Comparison to other tests (blood work, hair/urine)
- ✅ FAQs section
- ✅ Pricing information ($225)
- ✅ Duration (60 minutes)

### 10.3 Test CTA Button

1. Find **"Book Oligoscan Assessment"** button/link
2. Click it
3. **Verify** redirect to `/booking`
4. **Verify** Oligoscan is pre-selected (if implemented)

---

## Step 11: Database Verification (Post-Test) ✅

### Verify Data Was Saved Correctly

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check booking has biometrics
SELECT
  id,
  user_id,
  practitioner_id,
  type,
  status,
  metadata->'biometrics' as biometrics
FROM bookings
WHERE type = 'oligoscan_assessment'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** Should see your test booking with biometrics JSON

```sql
-- 2. Check assessment is linked to booking
SELECT
  a.id as assessment_id,
  a.type as assessment_type,
  a.score,
  a.booking_id,
  b.id as booking_id_verify,
  b.type as booking_type
FROM assessments a
JOIN bookings b ON a.booking_id = b.id
WHERE a.type = 'oligoscan_v1'
ORDER BY a.created_at DESC
LIMIT 1;
```

**Expected:** Should see assessment linked to booking via `booking_id`

```sql
-- 3. View full assessment data
SELECT
  id,
  user_id,
  booking_id,
  type,
  score,
  responses,
  created_at
FROM assessments
WHERE type = 'oligoscan_v1'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** `responses` JSONB should contain your assessment data (summary, findings, categories)

---

## Step 12: Final Checks ✅

### Browser Console

- [ ] Open browser DevTools (F12)
- [ ] Check **Console** tab for errors (should be clean)
- [ ] Check **Network** tab during booking (all requests should return 200/201)

### Server Logs

- [ ] Check terminal where `npm run dev` is running
- [ ] Verify no error messages or warnings
- [ ] API routes should return success

### Email Delivery

- [ ] Log into Resend dashboard
- [ ] Verify both emails show "Delivered" status
- [ ] Click each email and review preview
- [ ] Verify formatting looks professional

---

## Troubleshooting 🔧

### Emails Not Sending

**Check:**
1. `RESEND_API_KEY` is set correctly in `.env.local`
2. Restart dev server after changing env vars
3. Check Resend dashboard for failed emails
4. Check terminal logs for email service errors
5. Verify sender email matches Resend config

### Practitioner Dashboard Empty

**Check:**
1. User has `role='practitioner'` in profiles table
2. Booking has `practitioner_id` set to practitioner's user ID
3. RLS policies are applied (run verification queries)
4. Browser console for auth/permission errors

### Booking Submission Fails

**Check:**
1. All required fields are filled
2. Biometrics validation passes
3. Browser console for validation errors
4. API route logs in terminal
5. Database connection is active

### Assessment Submission Fails

**Check:**
1. Practitioner is logged in
2. Summary is 20-1200 characters
3. Key findings are 3-6 items
4. All category statuses selected
5. Browser console for errors

---

## Success Criteria ✅

Mark each item when verified:

- [ ] All 4 migrations applied successfully
- [ ] Practitioner account exists and can log in
- [ ] Client can book Oligoscan assessment with biometrics
- [ ] Both emails received (confirmation + pre-consult)
- [ ] Resend shows emails delivered
- [ ] Practitioner can view assigned Oligoscan bookings
- [ ] Practitioner can record assessment (all fields)
- [ ] Assessment saves successfully
- [ ] Client can view assessment results in dashboard
- [ ] Marketing page loads and CTA works
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Database data looks correct
- [ ] Linting passes (`npm run lint`)

---

## Next Steps 🚀

Once all tests pass locally:

1. **Deploy to Staging:**
   - Apply migrations to staging database
   - Deploy code to staging environment
   - Re-run all tests on staging
   - Test with real Resend emails (not test mode)

2. **Deploy to Production:**
   - Apply migrations to production database
   - Deploy code to production
   - Smoke test critical path (booking → assessment → view)
   - Monitor error logs
   - Monitor Resend for delivery issues

3. **Monitor & Iterate:**
   - Track Oligoscan booking conversion rates
   - Gather practitioner feedback on assessment form
   - Optimize email delivery timing
   - Add analytics to track user journey

---

**Testing Complete!** 🎉

If all checks pass, your Oligoscan implementation is ready for staging/production deployment.
