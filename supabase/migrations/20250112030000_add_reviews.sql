-- Add reviews and review_votes tables
-- Migration: 20250112030000_add_reviews.sql

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 100),
  comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 1000),
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  is_approved BOOLEAN DEFAULT true, -- Auto-approve for MVP, can add moderation later
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_product_review UNIQUE(product_id, user_id)
);

-- Create review_votes table (for "Was this helpful?" functionality)
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_review_vote UNIQUE(review_id, user_id)
);

-- Add average_rating and review_count columns to products table
ALTER TABLE products
ADD COLUMN average_rating NUMERIC(3, 2) DEFAULT NULL CHECK (average_rating >= 1 AND average_rating <= 5),
ADD COLUMN review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);

-- Enable Row Level Security on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Authenticated users can insert reviews (one per product)
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Row Level Security on review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Review votes policies
-- Authenticated users can view all votes (for checking if they voted)
CREATE POLICY "Authenticated users can view votes"
  ON review_votes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert votes (one per review)
CREATE POLICY "Authenticated users can vote"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update product average rating and count
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's average rating and review count
  UPDATE products
  SET
    average_rating = (
      SELECT ROUND(AVG(rating), 2)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update product rating when review is inserted/updated/deleted
CREATE TRIGGER update_product_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to update review helpful_count when votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's helpful count
  UPDATE reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
      AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update review helpful_count when vote is inserted/updated/deleted
CREATE TRIGGER update_review_helpful_count_on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Add comments
COMMENT ON TABLE reviews IS 'Customer reviews for products with star ratings';
COMMENT ON TABLE review_votes IS 'Helpful votes for reviews (was this review helpful?)';
COMMENT ON COLUMN reviews.verified_purchase IS 'True if user purchased this product (checked via orders)';
COMMENT ON COLUMN reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON COLUMN reviews.is_approved IS 'For moderation - auto-approved for MVP';
COMMENT ON COLUMN products.average_rating IS 'Average of all approved review ratings (1-5)';
COMMENT ON COLUMN products.review_count IS 'Total count of approved reviews';
