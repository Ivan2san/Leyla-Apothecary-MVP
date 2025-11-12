-- Fix orders table schema to match application code
-- This migration renames columns and adds auto-generation for order_number

-- Rename columns to match code expectations
ALTER TABLE orders RENAME COLUMN shipping TO shipping_cost;
ALTER TABLE orders RENAME COLUMN total TO total_amount;

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

-- Create trigger to auto-generate order_number before insert
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Add comment to document the change
COMMENT ON TABLE orders IS 'Orders table - column names updated to match application code (shipping_cost, total_amount)';
