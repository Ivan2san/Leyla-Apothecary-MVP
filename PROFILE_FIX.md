# Fix Profile Foreign Key Issue

## Problem
Orders are failing with: `violates foreign key constraint "orders_user_id_fkey"`

This happens because:
1. Users sign up → created in `auth.users` ✅
2. But NO row created in `profiles` table ❌
3. Orders table requires `user_id` to exist in `profiles` ❌

## Solution

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Step 1: Create profiles for any existing users that don't have one
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  created_at,
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);

-- Step 2: Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger to run on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## What This Does

1. **Backfills profiles** for all existing users in `auth.users`
2. **Creates trigger** that auto-creates profile when new user signs up
3. **Ensures consistency** between auth.users and profiles tables

## After Running

Try placing an order again - it should work!
