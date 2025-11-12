# Fix Row Level Security Policies for Order Items

## Problem
Error: `new row violates row-level security policy for table "order_items"`

The `order_items` table has RLS enabled but no policies allowing users to insert their order items.

---

## Solution

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Create RLS policies for order_items table

-- 1. Allow users to view order items for their own orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 2. Allow users to create order items for their own orders
CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 3. Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;
```

---

## What This Does

### Policy 1: SELECT (View)
- Users can view order items **only if** they belong to an order the user owns
- Checked by: `orders.user_id = auth.uid()`

### Policy 2: INSERT (Create)
- Users can create order items **only if** they belong to an order the user owns
- Prevents users from creating order items for other people's orders

---

## After Running

You should see output showing both policies created:

```
Users can view own order items
Users can create own order items
```

Then try placing an order again - should work now! ✅
