import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * One-time migration endpoint to fix orders schema
 * This endpoint should only be called once to set up the order_number trigger
 * DELETE THIS FILE after running successfully
 */

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if user is admin (optional - remove in production or add proper admin check)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create the trigger function and trigger for auto-generating order_number
    const migrationSQL = `
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

      -- Drop trigger if exists (idempotent)
      DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;

      -- Create trigger to auto-generate order_number before insert
      CREATE TRIGGER generate_order_number_trigger
        BEFORE INSERT ON orders
        FOR EACH ROW
        EXECUTE FUNCTION set_order_number();
    `

    // Execute the migration
    // Note: We can't use Supabase client to execute raw DDL directly
    // This needs to be run manually in Supabase Dashboard SQL Editor

    return NextResponse.json({
      success: false,
      message: 'Migration SQL generated. Please run this in Supabase Dashboard SQL Editor:',
      sql: migrationSQL,
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Copy the SQL from the "sql" field in this response',
        '3. Paste and execute it',
        '4. Delete this API route file after successful migration'
      ]
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Migration failed'
    }, { status: 500 })
  }
}
