# Database Migration Instructions

## Critical: Order Number Auto-Generation

The orders table requires an `order_number` field, but there's currently no trigger to auto-generate it. This will cause order creation to fail.

### Steps to Apply Migration:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click "New Query"
4. Copy and paste the following SQL:

```sql
-- Create trigger function to auto-generate order_number on INSERT
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (idempotent - safe to run multiple times)
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;

-- Create trigger to auto-generate order_number before insert
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();
```

5. Click "Run" to execute
6. Verify success - you should see "Success. No rows returned"

### What This Does:

- Creates a trigger function that calls the existing `generate_order_number()` function
- Automatically generates order numbers in format: `LA-YYYYMMDD-XXXX`
- Ensures every order gets a unique order number without manual intervention

### After Migration:

Once successfully applied, you can delete:
- `supabase/migrations/20250112010000_fix_orders_schema.sql` (merged into main schema)
- `scripts/apply-migration.ts` (no longer needed)
- `app/api/admin/migrate/route.ts` (no longer needed)
- This file (`MIGRATION_INSTRUCTIONS.md`)

### Testing:

After applying the migration, test by placing an order through the checkout flow. The order should be created successfully with an auto-generated order number.

---

## Newsletter Subscription Policy

The `newsletter_subscribers` table ships with Row Level Security enabled, which blocks anonymous inserts by default. To allow public signups (required for `/api/newsletter`), run the following SQL in Supabase:

```sql
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

1. Open Supabase Dashboard → **SQL Editor**
2. Run the snippet above
3. Verify that POST `/api/newsletter` no longer returns a 500/RLS error
