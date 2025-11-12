-- Add images array column to products table for multiple product images
-- Migration: 20250112020000_add_product_images.sql

-- Add images JSONB column
ALTER TABLE products
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to images array
UPDATE products
SET images = jsonb_build_array(
  jsonb_build_object(
    'id', uuid_generate_v4(),
    'url', image_url,
    'alt', name || ' product image',
    'type', 'primary',
    'position', 0,
    'created_at', NOW()
  )
)
WHERE image_url IS NOT NULL AND image_url != '';

-- Create index for faster JSON queries
CREATE INDEX idx_products_images ON products USING GIN (images);

-- Add comment explaining the images structure
COMMENT ON COLUMN products.images IS 'Array of product images in JSONB format. Each image object contains: {id: uuid, url: string, alt: string, type: primary|lifestyle|detail|scale, position: number, created_at: timestamp}. Maximum 5 images per product.';

-- Create Supabase Storage bucket for product images (if not exists)
-- This will be created via Supabase dashboard or client code
-- Bucket: 'product-images'
-- Public: false (access controlled via RLS)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
