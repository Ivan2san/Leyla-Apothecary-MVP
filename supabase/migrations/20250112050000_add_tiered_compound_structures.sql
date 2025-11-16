-- Add role column to profiles for practitioner/admin controls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN role TEXT;

    UPDATE profiles
    SET role = COALESCE(role, 'client');

    ALTER TABLE profiles
      ALTER COLUMN role SET NOT NULL,
      ALTER COLUMN role SET DEFAULT 'client';

    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('client', 'practitioner', 'admin'));
  END IF;
END $$;

-- Rework health assessments into reusable assessments table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'health_assessments'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own assessments" ON health_assessments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create own assessments" ON health_assessments';
    EXECUTE 'ALTER TABLE health_assessments RENAME TO assessments';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'assessment_data'
  ) THEN
    ALTER TABLE assessments RENAME COLUMN assessment_data TO responses;
  END IF;
END $$;

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS score NUMERIC(5,2);

UPDATE assessments
SET type = COALESCE(type, 'intake');

ALTER TABLE assessments
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN type SET DEFAULT 'intake';

ALTER TABLE assessments
  ALTER COLUMN recommendations TYPE JSONB
  USING COALESCE(to_jsonb(recommendations), '[]'::jsonb);

UPDATE assessments
SET recommendations = COALESCE(recommendations, '[]'::jsonb);

ALTER TABLE assessments
  ALTER COLUMN recommendations SET DEFAULT '[]'::jsonb,
  ALTER COLUMN recommendations SET NOT NULL;

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own assessments" ON assessments;
CREATE POLICY "Users can create own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update compounds table to support tiers, provenance, and safety metadata
DROP POLICY IF EXISTS "Users can view own compounds" ON compounds;
DROP POLICY IF EXISTS "Users can create own compounds" ON compounds;
DROP POLICY IF EXISTS "Users can update own compounds" ON compounds;
DROP POLICY IF EXISTS "Users can delete own compounds" ON compounds;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compounds'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE compounds RENAME COLUMN user_id TO owner_user_id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compounds'
      AND column_name = 'ingredients'
  ) THEN
    ALTER TABLE compounds RENAME COLUMN ingredients TO formula;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compounds'
      AND column_name = 'total_price'
  ) THEN
    ALTER TABLE compounds RENAME COLUMN total_price TO price;
  END IF;
END $$;

ALTER TABLE compounds
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS source_assessment_id UUID REFERENCES assessments(id),
  ADD COLUMN IF NOT EXISTS source_booking_id UUID REFERENCES bookings(id),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

UPDATE compounds
SET created_by = COALESCE(created_by, owner_user_id);

UPDATE compounds
SET type = CASE tier
  WHEN '1' THEN 'preset'
  WHEN '2' THEN 'guided'
  ELSE 'practitioner'
END
WHERE type IS NULL;

ALTER TABLE compounds
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'compounds_type_check'
  ) THEN
    ALTER TABLE compounds
      ADD CONSTRAINT compounds_type_check
      CHECK (type IN ('preset', 'guided', 'practitioner'));
  END IF;
END $$;

ALTER TABLE compounds
  ALTER COLUMN tier TYPE INTEGER
  USING (tier::text)::INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'compounds_tier_check'
  ) THEN
    ALTER TABLE compounds
      ADD CONSTRAINT compounds_tier_check
      CHECK (tier IN (1, 2, 3));
  END IF;
END $$;

DROP TYPE IF EXISTS compound_tier;

DROP INDEX IF EXISTS idx_compounds_user_id;
CREATE INDEX idx_compounds_owner_user_id ON compounds(owner_user_id);
CREATE INDEX idx_compounds_type ON compounds(type);
CREATE INDEX idx_compounds_source_assessment ON compounds(source_assessment_id);
CREATE INDEX idx_compounds_source_booking ON compounds(source_booking_id);

CREATE POLICY "Owners can view own compounds"
  ON compounds FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can create own compounds"
  ON compounds FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update own compounds"
  ON compounds FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete own compounds"
  ON compounds FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Compound batches table
CREATE TABLE IF NOT EXISTS compound_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL,
  prepared_by UUID NOT NULL REFERENCES profiles(id),
  prepared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_volume_ml INTEGER NOT NULL CHECK (total_volume_ml > 0),
  expiry_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'dispensed', 'discarded'))
);

ALTER TABLE compound_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Practitioners manage compound batches" ON compound_batches;
CREATE POLICY "Practitioners manage compound batches"
  ON compound_batches
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  );

-- Compound dispensations table
CREATE TABLE IF NOT EXISTS compound_dispensations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES compound_batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
  dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE compound_dispensations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Practitioners manage dispensations" ON compound_dispensations;
CREATE POLICY "Practitioners manage dispensations"
  ON compound_dispensations
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  );

-- Compound pricing guardrails
CREATE TABLE IF NOT EXISTS compound_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier INTEGER UNIQUE NOT NULL CHECK (tier IN (1, 2, 3)),
  min_price_per_100ml NUMERIC(10,2) NOT NULL,
  max_price_per_100ml NUMERIC(10,2) NOT NULL,
  default_margin NUMERIC(4,2) NOT NULL,
  allow_manual_override BOOLEAN DEFAULT false,
  override_role TEXT
);

ALTER TABLE compound_pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage pricing rules" ON compound_pricing_rules;
CREATE POLICY "Admins manage pricing rules"
  ON compound_pricing_rules
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  );

-- Herb safety metadata
CREATE TABLE IF NOT EXISTS herb_safety_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  contraindications JSONB NOT NULL DEFAULT '[]'::jsonb,
  interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  pregnancy_risk_level TEXT,
  lactation_risk_level TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'herb_safety_rules_product_unique'
  ) THEN
    ALTER TABLE herb_safety_rules
      ADD CONSTRAINT herb_safety_rules_product_unique UNIQUE (product_id);
  END IF;
END $$;

ALTER TABLE herb_safety_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage herb safety rules" ON herb_safety_rules;
CREATE POLICY "Admins manage herb safety rules"
  ON herb_safety_rules
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('practitioner', 'admin')
    )
  );

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id_type ON assessments(user_id, type);
CREATE INDEX IF NOT EXISTS idx_compound_batches_compound_id ON compound_batches(compound_id);
CREATE INDEX IF NOT EXISTS idx_compound_dispensations_batch_id ON compound_dispensations(batch_id);
CREATE INDEX IF NOT EXISTS idx_compound_dispensations_user_id ON compound_dispensations(user_id);
CREATE INDEX IF NOT EXISTS idx_compound_pricing_rules_tier ON compound_pricing_rules(tier);
CREATE INDEX IF NOT EXISTS idx_herb_safety_rules_product_id ON herb_safety_rules(product_id);
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS compound_snapshot JSONB;
