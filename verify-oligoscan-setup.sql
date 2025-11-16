-- ============================================
-- OLIGOSCAN SETUP VERIFICATION SCRIPT
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. Verify all 4 migrations are applied
-- Expected: 4 rows showing all migration versions
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20250209090000',
  '20250209090500',
  '20250209100000',
  '20250209110000'
)
ORDER BY version;

-- ============================================

-- 2. Verify bookings table has all required columns
-- Expected: Should see metadata, practitioner_id columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name IN ('metadata', 'practitioner_id', 'type')
ORDER BY column_name;

-- ============================================

-- 3. Verify booking_type enum includes oligoscan_assessment
-- Expected: Should see oligoscan_assessment in the list
SELECT enumlabel as booking_type
FROM pg_enum
WHERE enumtypid = 'public.booking_type'::regtype
ORDER BY enumsortorder;

-- ============================================

-- 4. Verify booking_type_config has Oligoscan entry
-- Expected: 1 row with oligoscan_assessment config (60 min, $225.00)
SELECT
  type,
  name,
  description,
  duration_minutes,
  price,
  is_active
FROM booking_type_config
WHERE type = 'oligoscan_assessment';

-- ============================================

-- 5. Verify assessments table has booking_id column
-- Expected: Should see booking_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessments'
  AND column_name = 'booking_id';

-- ============================================

-- 6. Verify indexes are created
-- Expected: idx_bookings_practitioner_id, idx_assessments_booking_id
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('idx_bookings_practitioner_id', 'idx_assessments_booking_id')
ORDER BY indexname;

-- ============================================

-- 7. Verify RLS policies for practitioners
-- Expected: 2 policies for practitioners on bookings table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'bookings'
  AND policyname LIKE '%ractitioner%'
ORDER BY policyname;

-- ============================================

-- 8. Check if any practitioner accounts exist
-- Expected: List of practitioner/admin accounts (might be empty)
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

-- 9. Check if any Oligoscan bookings exist
-- Expected: List of oligoscan bookings (might be empty if no tests yet)
SELECT
  id,
  user_id,
  practitioner_id,
  type,
  date,
  time,
  status,
  metadata->'biometrics' as biometrics,
  created_at
FROM bookings
WHERE type = 'oligoscan_assessment'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================

-- 10. Check if any Oligoscan assessments exist
-- Expected: List of oligoscan assessments (might be empty if no tests yet)
SELECT
  a.id,
  a.user_id,
  a.booking_id,
  a.type,
  a.score,
  b.type as booking_type,
  a.created_at
FROM assessments a
LEFT JOIN bookings b ON a.booking_id = b.id
WHERE a.type = 'oligoscan_v1'
ORDER BY a.created_at DESC
LIMIT 5;

-- ============================================
-- SETUP COMPLETE!
-- If all queries return expected results, proceed to create test accounts
-- ============================================
