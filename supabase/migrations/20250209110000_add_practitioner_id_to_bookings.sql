-- Add practitioner_id column to bookings table
-- This links bookings to the practitioner who will conduct them
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS practitioner_id UUID REFERENCES profiles(id);

-- Create index for efficient practitioner queries
CREATE INDEX IF NOT EXISTS idx_bookings_practitioner_id
  ON bookings(practitioner_id);

-- Add RLS policy for practitioners to view their assigned bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND policyname = 'Practitioners can view assigned bookings'
  ) THEN
    CREATE POLICY "Practitioners can view assigned bookings"
      ON bookings FOR SELECT
      USING (auth.uid() = practitioner_id);
  END IF;
END $$;

-- Add RLS policy for practitioners to update their assigned bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND policyname = 'Practitioners can update assigned bookings'
  ) THEN
    CREATE POLICY "Practitioners can update assigned bookings"
      ON bookings FOR UPDATE
      USING (auth.uid() = practitioner_id);
  END IF;
END $$;
