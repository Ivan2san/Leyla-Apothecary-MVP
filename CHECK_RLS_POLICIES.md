# Check and Fix RLS Policies

## Step 1: Check Existing Policies

Run this to see what policies exist:

```sql
-- View all policies on order_items table
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;
```

---

## Step 2: The Issue

The policies exist but might have the wrong condition. The problem is that when we INSERT order_items, the order hasn't been committed yet, so the EXISTS check might fail.

---

## Step 3: Fix - Drop and Recreate Policies

Run this to fix the policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;

-- Recreate with better logic for INSERT
-- For INSERT: We just created the order in the same transaction,
-- so we trust the server code to only insert items for the correct order
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- For INSERT: Allow if the user created the parent order
-- This uses WITH CHECK which validates after the insert
CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

---

## Alternative: Disable RLS Temporarily

If the above doesn't work, we can use service role for inserts:

**Option 1: Update the code to use service role for order creation**

We'd need to modify `lib/services/orders.ts` to use the service role key for the order items insert.

**Option 2: Simplify the policy**

```sql
-- Drop existing
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;

-- Super simple policies - just check if user is authenticated
CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

⚠️ **Warning:** Option 2 is less secure but will definitely work for testing.

---

## Recommended: Try Step 3 First

The first approach (recreating policies) should work since the order is created in the same transaction.
