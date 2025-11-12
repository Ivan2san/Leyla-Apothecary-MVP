# Debug Profile Foreign Key Issue

## Step 1: Verify Profile Exists

Run this in Supabase SQL Editor to check if your profile was created:

```sql
-- Check all users and their profiles
SELECT
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.email as profile_email,
  CASE
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

**Expected:** Your user should show `✅ HAS PROFILE`

If you see `❌ NO PROFILE`:

---

## Step 2: Manually Create Your Profile

If profile doesn't exist, get your user ID first:

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
```

Copy the `id` value, then create the profile:

```sql
-- Replace YOUR_USER_ID with the actual UUID from above
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID
  'YOUR_EMAIL',     -- Replace with your email
  'Your Name',      -- Replace with your name
  NOW(),
  NOW()
);
```

---

## Step 3: Verify the User ID Being Sent

Check what user ID the order API is receiving. Add this temporarily to your orders route:

**File:** `app/api/orders/route.ts`

Add console.log right after getting the user:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()

// ADD THESE DEBUG LINES:
console.log('🔍 User ID from auth:', user?.id)
console.log('🔍 User email:', user?.email)

if (authError || !user) {
  // ... rest of code
```

Then try to place order again and check Vercel logs or browser console.

---

## Step 4: Quick Fix - Check Profile Creation

Run this to ensure profile exists for YOUR specific user:

```sql
-- This will create your profile if it doesn't exist
-- Replace 'your.email@example.com' with your actual email
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Get user from auth.users
  SELECT id, email INTO v_user_id, v_email
  FROM auth.users
  WHERE email = 'your.email@example.com'  -- CHANGE THIS!
  LIMIT 1;

  -- Create profile if doesn't exist
  INSERT INTO profiles (id, email, full_name, created_at, updated_at)
  VALUES (v_user_id, v_email, v_email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Profile created/verified for: %', v_email;
END $$;
```

---

## Step 5: Alternative - Disable Foreign Key Temporarily

If you need to test urgently, you can temporarily make the constraint deferrable:

```sql
-- Make constraint deferrable (allows temporary violations)
ALTER TABLE orders
DROP CONSTRAINT orders_user_id_fkey,
ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  DEFERRABLE INITIALLY DEFERRED;
```

But this is NOT recommended for production - better to fix the root cause.

---

## Most Likely Issue

The trigger probably didn't fire because it was created AFTER you signed up.

**Solution:** Just manually create the profile for your existing user using Step 2 above.
