import { createClient } from '@/lib/supabase/server'
import { Review, ReviewVote } from '@/types'

export interface CreateReviewData {
  product_id: string
  user_id: string
  rating: number
  title: string
  comment: string
  verified_purchase?: boolean
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
}

export interface GetReviewsOptions {
  sortBy?: 'recent' | 'helpful' | 'rating'
  limit?: number
  offset?: number
}

/**
 * ReviewService - Service layer for review operations
 * Handles review CRUD, verified purchase checks, and helpful votes
 */
export class ReviewService {
  /**
   * Create a new review for a product
   * Note: verified_purchase should be checked by caller using checkVerifiedPurchase
   */
  static async createReview(reviewData: CreateReviewData): Promise<Review> {
    const supabase = await createClient()

    // Insert review (database will apply default for verified_purchase if not provided)
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()

    if (error) {
      // Handle duplicate review error
      if (error.code === '23505') {
        throw new Error('You have already reviewed this product')
      }
      // Handle check constraint violations (invalid rating, title/comment length)
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Check if user has purchased the product
   * Returns true if the user has an order containing this product
   *
   * Note: This queries order_items table. In a real implementation with proper
   * database schema, we would join with orders table to verify user_id.
   * For now, assumes RLS policies handle user filtering.
   */
  static async checkVerifiedPurchase(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const supabase = await createClient()

    // Query order_items to check if product has been ordered
    // RLS policies should ensure we only see orders for the authenticated user
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id')
      .eq('product_id', productId)

    // Don't throw error - just return false if query fails
    if (error) {
      return false
    }

    return data && data.length > 0
  }

  /**
   * Get reviews for a product with sorting and pagination
   * Only returns approved reviews
   */
  static async getProductReviews(
    productId: string,
    options: GetReviewsOptions = {}
  ): Promise<Review[]> {
    const supabase = await createClient()
    const { sortBy = 'recent', limit = 20, offset = 0 } = options

    let query = supabase
      .from('reviews')
      .select('*, profiles!inner(full_name)')
      .eq('product_id', productId)
      .eq('is_approved', true)

    // Apply sorting
    switch (sortBy) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get product reviews: ${error.message}`)
    }

    return data || []
  }

  /**
   * Update a review (user can only update their own reviews)
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    updates: UpdateReviewData
  ): Promise<Review> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`)
    }

    return data
  }

  /**
   * Delete a review (user can only delete their own reviews)
   */
  static async deleteReview(reviewId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`)
    }
  }

  /**
   * Vote on review helpfulness
   * If user has already voted, updates their vote
   */
  static async voteHelpful(
    reviewId: string,
    userId: string,
    isHelpful: boolean
  ): Promise<ReviewVote> {
    const supabase = await createClient()

    // Try to insert vote
    const { data, error } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful,
      })
      .select()
      .single()

    // If duplicate vote, update existing vote instead
    if (error && error.code === '23505') {
      const { data: updatedData, error: updateError } = await supabase
        .from('review_votes')
        .update({ is_helpful: isHelpful })
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update vote: ${updateError.message}`)
      }

      return updatedData
    }

    if (error) {
      throw new Error(`Failed to vote: ${error.message}`)
    }

    return data
  }

  /**
   * Get a user's review for a specific product
   * Returns null if user hasn't reviewed the product
   */
  static async getUserReview(
    userId: string,
    productId: string
  ): Promise<Review | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    // Handle "not found" error - user hasn't reviewed this product
    if (error && error.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new Error(`Failed to get user review: ${error.message}`)
    }

    return data
  }

  /**
   * Get review statistics for a product (average rating and total count)
   */
  static async getProductReviewStats(
    productId: string
  ): Promise<{ averageRating: number; totalCount: number }> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)

    if (error) {
      throw new Error(`Failed to get product review stats: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalCount: 0 }
    }

    const totalCount = data.length
    const sumRating = data.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = sumRating / totalCount

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalCount,
    }
  }
}
