DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'oligoscan_assessment'
      AND enumtypid = 'public.booking_type'::regtype
  ) THEN
    ALTER TYPE public.booking_type ADD VALUE 'oligoscan_assessment';
  END IF;
END $$;
