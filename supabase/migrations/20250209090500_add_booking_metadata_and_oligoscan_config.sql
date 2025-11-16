ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

INSERT INTO booking_type_config (type, name, description, duration_minutes, price)
VALUES (
  'oligoscan_assessment',
  'Oligoscan Assessment',
  'Intracellular mineral and heavy metal spectroscopy assessment with real-time consultation (60 minutes)',
  60,
  225.00
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  is_active = true,
  updated_at = NOW();
