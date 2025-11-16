-- Wellness package infrastructure
-- Adds package/product tables, additional booking types, and booking/package linkage

-- Expand booking type config for package-only session types
ALTER TABLE booking_type_config
  ADD COLUMN IF NOT EXISTS is_package_only BOOLEAN NOT NULL DEFAULT false;

-- Extend booking types for wellness program flows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'wellness_package_initial' AND enumtypid = 'public.booking_type'::regtype
  ) THEN
    ALTER TYPE public.booking_type ADD VALUE 'wellness_package_initial';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'meditation_session' AND enumtypid = 'public.booking_type'::regtype
  ) THEN
    ALTER TYPE public.booking_type ADD VALUE 'meditation_session';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'sauna_session' AND enumtypid = 'public.booking_type'::regtype
  ) THEN
    ALTER TYPE public.booking_type ADD VALUE 'sauna_session';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'dietary_session' AND enumtypid = 'public.booking_type'::regtype
  ) THEN
    ALTER TYPE public.booking_type ADD VALUE 'dietary_session';
  END IF;
END $$;

-- Package enrolment status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'package_enrolment_status'
  ) THEN
    CREATE TYPE package_enrolment_status AS ENUM ('active', 'completed', 'expired');
  END IF;
END
$$;

-- Package definition table
CREATE TABLE IF NOT EXISTS wellness_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'AUD',
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks > 0),
  includes JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package enrolments table
CREATE TABLE IF NOT EXISTS wellness_package_enrolments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES wellness_packages(id) ON DELETE CASCADE,
  stripe_checkout_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status package_enrolment_status NOT NULL DEFAULT 'active',
  session_credits JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking linkage to packages
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS package_enrolment_id UUID REFERENCES wellness_package_enrolments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_package_booking BOOLEAN NOT NULL DEFAULT false;

-- Indexes for enrolments
CREATE INDEX IF NOT EXISTS idx_wellness_package_enrolments_user
  ON wellness_package_enrolments(user_id);

CREATE INDEX IF NOT EXISTS idx_wellness_package_enrolments_status
  ON wellness_package_enrolments(status);

CREATE INDEX IF NOT EXISTS idx_bookings_package_enrolment
  ON bookings(package_enrolment_id)
  WHERE package_enrolment_id IS NOT NULL;

-- Enable RLS and policies
ALTER TABLE wellness_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_package_enrolments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wellness_packages'
      AND policyname = 'Anyone can view active wellness packages'
  ) THEN
    CREATE POLICY "Anyone can view active wellness packages"
      ON wellness_packages FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wellness_package_enrolments'
      AND policyname = 'Users can view own wellness enrolments'
  ) THEN
    CREATE POLICY "Users can view own wellness enrolments"
      ON wellness_package_enrolments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_wellness_packages_updated_at ON wellness_packages;
CREATE TRIGGER update_wellness_packages_updated_at
  BEFORE UPDATE ON wellness_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wellness_package_enrolments_updated_at ON wellness_package_enrolments;
CREATE TRIGGER update_wellness_package_enrolments_updated_at
  BEFORE UPDATE ON wellness_package_enrolments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed Deep Reset package
INSERT INTO wellness_packages (
  slug,
  name,
  description,
  price_cents,
  currency,
  duration_weeks,
  includes
) VALUES (
  'deep_reset',
  'Deep Reset Wellness Package',
  'A 4–6 week program combining naturopathic consults, guided meditation, sauna, and personalised dietary support.',
  45000,
  'AUD',
  6,
  '{
    "wellness_package_initial": 1,
    "dietary_session": 1,
    "followup": 1,
    "meditation_session": 2,
    "sauna_session": 2
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  duration_weeks = EXCLUDED.duration_weeks,
  includes = EXCLUDED.includes,
  is_active = true,
  updated_at = NOW();
