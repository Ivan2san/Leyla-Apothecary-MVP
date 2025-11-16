-- ============================================
-- CREATE TEST PRACTITIONER ACCOUNT
-- Run this in Supabase SQL Editor
-- ============================================

-- OPTION 1: Update an existing user to be a practitioner
-- Replace 'your-email@example.com' with an actual user email
UPDATE profiles
SET
  role = 'practitioner',
  full_name = COALESCE(full_name, 'Test Practitioner'),
  updated_at = NOW()
WHERE email = 'your-email@example.com'
RETURNING id, email, full_name, role;

-- ============================================

-- OPTION 2: Find your own user and make yourself a practitioner
-- (Useful if you want to test as practitioner)
-- First, find your user ID by checking auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Then update your profile (replace YOUR_USER_ID)
UPDATE profiles
SET
  role = 'practitioner',
  updated_at = NOW()
WHERE id = 'YOUR_USER_ID'
RETURNING id, email, full_name, role;

-- ============================================

-- OPTION 3: Create a completely new practitioner account
-- This requires creating both auth.users and profiles entries
-- WARNING: This is more complex. Better to use Supabase Auth UI to sign up,
-- then update the role afterwards using OPTION 1

-- ============================================

-- VERIFY: Check your practitioner account was created
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role IN ('practitioner', 'admin')
ORDER BY created_at DESC;

-- ============================================
-- NEXT STEPS:
-- 1. Note the practitioner's ID and email
-- 2. Use these credentials to log in and test practitioner features
-- ============================================
