-- Seed compound pricing guardrails
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'compound_pricing_rules'
  ) THEN
    INSERT INTO compound_pricing_rules (tier, min_price_per_100ml, max_price_per_100ml, default_margin, allow_manual_override, override_role)
    VALUES
      (1, 65, 120, 0.2, true, 'admin'),
      (2, 70, 125, 0.3, false, NULL),
      (3, 80, 135, 0.35, true, 'practitioner')
    ON CONFLICT (tier) DO UPDATE
    SET
      min_price_per_100ml = EXCLUDED.min_price_per_100ml,
      max_price_per_100ml = EXCLUDED.max_price_per_100ml,
      default_margin = EXCLUDED.default_margin,
      allow_manual_override = EXCLUDED.allow_manual_override,
      override_role = EXCLUDED.override_role;
  END IF;
END $$;

-- Seed a minimal set of herb safety rules for top stocked herbs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'herb_safety_rules'
  ) THEN
    -- Ensure the unique constraint exists before upserting
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'herb_safety_rules_product_unique'
    ) THEN
      ALTER TABLE herb_safety_rules
        ADD CONSTRAINT herb_safety_rules_product_unique UNIQUE (product_id);
    END IF;

    WITH herb_catalog AS (
      SELECT id, slug
      FROM products
      WHERE slug IN (
        'turmeric-root',
        'vitex-berry',
        'garlic',
        'ashwagandha-root',
        'valerian-root',
        'hawthorn-berry'
      )
    )
    INSERT INTO herb_safety_rules (
      product_id,
      contraindications,
      interactions,
      pregnancy_risk_level,
      metadata
    )
    SELECT
      id,
      CASE slug
        WHEN 'vitex-berry' THEN '[{"code":"PREGNANCY","message":"Avoid unless directed by practitioner"}]'::jsonb
        WHEN 'ashwagandha-root' THEN '[{"code":"THYROID","message":"Monitor thyroid medication dosing"}]'::jsonb
        ELSE '[]'::jsonb
      END,
      CASE slug
        WHEN 'garlic' THEN '[{"code":"MED","message":"May potentiate anticoagulants"}]'::jsonb
        WHEN 'turmeric-root' THEN '[{"code":"MED","message":"Use caution with blood thinners"}]'::jsonb
        WHEN 'hawthorn-berry' THEN '[{"code":"MED","message":"Monitor cardiac medications"}]'::jsonb
        ELSE '[]'::jsonb
      END,
      CASE slug
        WHEN 'vitex-berry' THEN 'avoid'
        WHEN 'ashwagandha-root' THEN 'caution'
        ELSE NULL
      END,
      jsonb_build_object('seeded', true, 'slug', slug)
    FROM herb_catalog
    ON CONFLICT (product_id) DO UPDATE
    SET
      contraindications = EXCLUDED.contraindications,
      interactions = EXCLUDED.interactions,
      pregnancy_risk_level = EXCLUDED.pregnancy_risk_level,
      metadata = herb_safety_rules.metadata || jsonb_build_object('seeded', true);
  END IF;
END $$;
