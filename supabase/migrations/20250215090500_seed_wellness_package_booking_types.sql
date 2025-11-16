-- Seed booking type configuration for wellness package-only session types

INSERT INTO booking_type_config (
  type,
  name,
  description,
  duration_minutes,
  price,
  is_active,
  is_package_only
) VALUES
  (
    'wellness_package_initial',
    'Wellness Package Initial Consult',
    'Kick-off consult for Deep Reset Wellness Package (60 minutes)',
    60,
    0,
    true,
    true
  ),
  (
    'meditation_session',
    'Guided Meditation Session',
    'Guided nervous system reset session (30-45 minutes)',
    40,
    0,
    true,
    true
  ),
  (
    'sauna_session',
    'Infrared Sauna Session',
    'Partner sauna session redeemed via package credit',
    45,
    0,
    true,
    true
  ),
  (
    'dietary_session',
    'Dietary Strategy Session',
    'Nutrition + lifestyle deep dive (45 minutes)',
    45,
    0,
    true,
    true
  )
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  is_active = true,
  is_package_only = EXCLUDED.is_package_only,
  updated_at = NOW();
