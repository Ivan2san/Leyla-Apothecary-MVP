-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE product_category AS ENUM (
  'digestive',
  'cardiovascular',
  'immune',
  'nervous',
  'respiratory',
  'musculoskeletal',
  'endocrine',
  'skin',
  'reproductive'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE booking_type AS ENUM (
  'initial',
  'followup',
  'quick'
);

CREATE TYPE booking_status AS ENUM (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE compound_tier AS ENUM ('1', '2', '3');

CREATE TYPE compound_status AS ENUM ('draft', 'active', 'archived');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  health_conditions TEXT[],
  allergies TEXT[],
  medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category product_category NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  dosage_instructions TEXT NOT NULL,
  contraindications TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Compounds table
CREATE TABLE compounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier compound_tier NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  status compound_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on compounds
ALTER TABLE compounds ENABLE ROW LEVEL SECURITY;

-- Compounds policies
CREATE POLICY "Users can view own compounds"
  ON compounds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own compounds"
  ON compounds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compounds"
  ON compounds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compounds"
  ON compounds FOR DELETE
  USING (auth.uid() = user_id);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  shipping NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  compound_id UUID REFERENCES compounds(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  product_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type booking_type NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  status booking_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  meeting_link TEXT,
  payment_intent_id TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Health assessments table
CREATE TABLE health_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_data JSONB NOT NULL,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on health_assessments
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;

-- Health assessments policies
CREATE POLICY "Users can view own assessments"
  ON health_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON health_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Newsletter policies (allow anyone to subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_compounds_user_id ON compounds(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Create functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compounds_updated_at
  BEFORE UPDATE ON compounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  done BOOLEAN := false;
BEGIN
  WHILE NOT done LOOP
    new_order_number := 'LA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample products (initial 20 herbal tinctures)
INSERT INTO products (name, slug, description, category, price, volume_ml, stock_quantity, ingredients, benefits, dosage_instructions, contraindications) VALUES
-- Digestive
('Ginger Root Tincture', 'ginger-root', 'Premium organic ginger root extract for digestive support and nausea relief.', 'digestive', 24.99, 30, 100, ARRAY['Ginger root (Zingiber officinale)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports healthy digestion', 'Relieves nausea', 'Anti-inflammatory properties'], 'Take 1-2 ml in water, 2-3 times daily before meals.', ARRAY['Consult healthcare provider if pregnant or on blood thinners']),
('Peppermint Tincture', 'peppermint', 'Soothing peppermint leaf extract for digestive comfort and IBS support.', 'digestive', 22.99, 30, 100, ARRAY['Peppermint leaf (Mentha piperita)', 'Organic alcohol', 'Filtered water'], ARRAY['Eases digestive discomfort', 'Supports IBS symptoms', 'Relieves gas and bloating'], 'Take 1-2 ml in water, up to 3 times daily after meals.', ARRAY['May worsen acid reflux in some individuals']),
('Fennel Seed Tincture', 'fennel-seed', 'Traditional fennel seed extract for bloating and gas relief.', 'digestive', 21.99, 30, 100, ARRAY['Fennel seed (Foeniculum vulgare)', 'Organic alcohol', 'Filtered water'], ARRAY['Reduces bloating', 'Relieves gas', 'Supports healthy digestion'], 'Take 1-2 ml in water, 2-3 times daily.', ARRAY['Not recommended during pregnancy']),

-- Cardiovascular
('Hawthorn Berry Tincture', 'hawthorn-berry', 'Heart-supportive hawthorn extract for cardiovascular wellness.', 'cardiovascular', 26.99, 30, 100, ARRAY['Hawthorn berry (Crataegus spp.)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports heart health', 'Promotes healthy blood pressure', 'Strengthens cardiovascular system'], 'Take 2-3 ml in water, 2 times daily.', ARRAY['Consult healthcare provider if on heart medications']),
('Garlic Tincture', 'garlic', 'Potent garlic extract for heart and immune support.', 'cardiovascular', 23.99, 30, 100, ARRAY['Garlic bulb (Allium sativum)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports healthy cholesterol', 'Promotes cardiovascular health', 'Immune system support'], 'Take 1-2 ml in water, 2 times daily with food.', ARRAY['May interact with blood thinners']),

-- Immune
('Echinacea Tincture', 'echinacea', 'Premium echinacea extract for immune system activation.', 'immune', 25.99, 30, 100, ARRAY['Echinacea purpurea root and herb', 'Organic alcohol', 'Filtered water'], ARRAY['Activates immune response', 'Reduces cold duration', 'Supports respiratory health'], 'Take 2-3 ml in water, 3-4 times daily at first sign of illness.', ARRAY['Not for use with autoimmune conditions', 'Do not use for more than 2 weeks continuously']),
('Elderberry Tincture', 'elderberry', 'Traditional elderberry extract for immune defense and antioxidant support.', 'immune', 27.99, 30, 100, ARRAY['Elderberry (Sambucus nigra)', 'Organic alcohol', 'Filtered water'], ARRAY['Powerful immune support', 'Rich in antioxidants', 'Supports respiratory health'], 'Take 2 ml in water, 2-3 times daily during illness.', ARRAY['Consult healthcare provider if pregnant or breastfeeding']),
('Astragalus Root Tincture', 'astragalus-root', 'Adaptogenic astragalus for long-term immune support.', 'immune', 24.99, 30, 100, ARRAY['Astragalus root (Astragalus membranaceus)', 'Organic alcohol', 'Filtered water'], ARRAY['Builds immune resilience', 'Adaptogenic properties', 'Supports energy levels'], 'Take 2-3 ml in water, 1-2 times daily.', ARRAY['May interact with immunosuppressant medications']),

-- Nervous System
('Valerian Root Tincture', 'valerian-root', 'Calming valerian root extract for sleep and anxiety support.', 'nervous', 25.99, 30, 100, ARRAY['Valerian root (Valeriana officinalis)', 'Organic alcohol', 'Filtered water'], ARRAY['Promotes restful sleep', 'Calms nervous tension', 'Supports relaxation'], 'Take 2-4 ml in water, 30 minutes before bedtime.', ARRAY['May cause drowsiness', 'Do not combine with sedatives']),
('Passionflower Tincture', 'passionflower', 'Gentle nervine for anxiety and restlessness.', 'nervous', 24.99, 30, 100, ARRAY['Passionflower herb (Passiflora incarnata)', 'Organic alcohol', 'Filtered water'], ARRAY['Eases anxiety', 'Supports restful sleep', 'Calms racing thoughts'], 'Take 2-3 ml in water, 2-3 times daily as needed.', ARRAY['May cause drowsiness', 'Consult healthcare provider if pregnant']),
('Lemon Balm Tincture', 'lemon-balm', 'Uplifting lemon balm for mood and cognitive support.', 'nervous', 22.99, 30, 100, ARRAY['Lemon balm leaf (Melissa officinalis)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports positive mood', 'Eases nervous tension', 'Promotes mental clarity'], 'Take 1-2 ml in water, 2-3 times daily.', ARRAY['May interact with thyroid medications']),

-- Respiratory
('Mullein Leaf Tincture', 'mullein-leaf', 'Soothing mullein for respiratory comfort and lung support.', 'respiratory', 23.99, 30, 100, ARRAY['Mullein leaf (Verbascum thapsus)', 'Organic alcohol', 'Filtered water'], ARRAY['Soothes respiratory tract', 'Supports lung health', 'Eases cough'], 'Take 2-3 ml in water, 3 times daily.', NULL),
('Thyme Tincture', 'thyme', 'Antimicrobial thyme extract for respiratory infections.', 'respiratory', 24.99, 30, 100, ARRAY['Thyme herb (Thymus vulgaris)', 'Organic alcohol', 'Filtered water'], ARRAY['Antimicrobial properties', 'Supports respiratory health', 'Eases congestion'], 'Take 1-2 ml in water, 3 times daily.', ARRAY['May interact with blood thinners']),

-- Musculoskeletal
('Turmeric Root Tincture', 'turmeric-root', 'Anti-inflammatory turmeric extract for joint and muscle support.', 'musculoskeletal', 28.99, 30, 100, ARRAY['Turmeric root (Curcuma longa)', 'Black pepper (Piper nigrum)', 'Organic alcohol', 'Filtered water'], ARRAY['Powerful anti-inflammatory', 'Supports joint health', 'Reduces muscle soreness'], 'Take 2-3 ml in water, 2 times daily with food.', ARRAY['May interact with blood thinners', 'Consult healthcare provider if on diabetes medications']),
('Arnica Tincture', 'arnica', 'Traditional arnica for bruising and muscle recovery.', 'musculoskeletal', 26.99, 30, 100, ARRAY['Arnica flower (Arnica montana)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports bruise recovery', 'Eases muscle soreness', 'Anti-inflammatory'], 'For EXTERNAL use only. Apply 2-3 drops to affected area.', ARRAY['DO NOT INGEST', 'Not for use on broken skin']),

-- Endocrine
('Ashwagandha Root Tincture', 'ashwagandha-root', 'Adaptogenic ashwagandha for stress and hormone balance.', 'endocrine', 29.99, 30, 100, ARRAY['Ashwagandha root (Withania somnifera)', 'Organic alcohol', 'Filtered water'], ARRAY['Balances stress hormones', 'Supports thyroid function', 'Increases energy and vitality'], 'Take 2-3 ml in water, 1-2 times daily.', ARRAY['May interact with thyroid medications', 'Consult healthcare provider if pregnant']),
('Vitex Berry Tincture', 'vitex-berry', 'Hormone-balancing vitex for women''s reproductive health.', 'endocrine', 27.99, 30, 100, ARRAY['Vitex berry (Vitex agnus-castus)', 'Organic alcohol', 'Filtered water'], ARRAY['Balances female hormones', 'Supports menstrual regularity', 'Eases PMS symptoms'], 'Take 2 ml in water, once daily in the morning.', ARRAY['Not for use during pregnancy', 'May interact with hormonal medications']),

-- Skin
('Calendula Tincture', 'calendula', 'Healing calendula extract for skin health and wound care.', 'skin', 23.99, 30, 100, ARRAY['Calendula flower (Calendula officinalis)', 'Organic alcohol', 'Filtered water'], ARRAY['Promotes skin healing', 'Anti-inflammatory', 'Soothes irritated skin'], 'Can be used internally (1-2 ml in water) or topically (diluted).', NULL),
('Burdock Root Tincture', 'burdock-root', 'Detoxifying burdock for clear skin and lymphatic support.', 'skin', 24.99, 30, 100, ARRAY['Burdock root (Arctium lappa)', 'Organic alcohol', 'Filtered water'], ARRAY['Supports clear skin', 'Detoxifying properties', 'Lymphatic support'], 'Take 2-3 ml in water, 2 times daily.', NULL),

-- Reproductive
('Red Raspberry Leaf Tincture', 'red-raspberry-leaf', 'Toning red raspberry for women''s reproductive wellness.', 'reproductive', 23.99, 30, 100, ARRAY['Red raspberry leaf (Rubus idaeus)', 'Organic alcohol', 'Filtered water'], ARRAY['Tones uterine tissue', 'Supports menstrual health', 'Rich in nutrients'], 'Take 2-3 ml in water, 2-3 times daily.', ARRAY['Consult healthcare provider during pregnancy']);

-- Insert sample pre-made compound protocols (Tier 1)
INSERT INTO products (name, slug, description, category, price, volume_ml, stock_quantity, ingredients, benefits, dosage_instructions, contraindications) VALUES
('Peaceful Nights Protocol', 'peaceful-nights', 'Pre-formulated blend for restful sleep and relaxation.', 'nervous', 44.99, 60, 50, ARRAY['Valerian root', 'Passionflower', 'Lemon balm', 'Organic alcohol', 'Filtered water'], ARRAY['Promotes deep sleep', 'Calms nervous system', 'Non-habit forming'], 'Take 3-4 ml in water, 30 minutes before bedtime.', ARRAY['May cause drowsiness', 'Do not drive after taking']),
('Immune Guardian Protocol', 'immune-guardian', 'Comprehensive immune support formula.', 'immune', 49.99, 60, 50, ARRAY['Echinacea', 'Elderberry', 'Astragalus', 'Garlic', 'Organic alcohol', 'Filtered water'], ARRAY['Activates immune defenses', 'Reduces illness duration', 'Builds resilience'], 'Take 3 ml in water, 3 times daily during illness; 2 ml daily for prevention.', ARRAY['Not for autoimmune conditions']),
('Digest Ease Protocol', 'digest-ease', 'Soothing formula for optimal digestive function.', 'digestive', 42.99, 60, 50, ARRAY['Ginger root', 'Peppermint', 'Fennel seed', 'Organic alcohol', 'Filtered water'], ARRAY['Eases digestive discomfort', 'Reduces bloating', 'Supports gut health'], 'Take 2-3 ml in water, before or after meals.', NULL);
