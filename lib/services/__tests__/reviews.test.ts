import { ReviewService } from '../reviews'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

describe('ReviewService', () => {
  let mockSupabase: any
  let queryChain: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create a chainable query mock that is also thenable
    let resolveData: any = { data: null, error: null }

    queryChain = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
      range: jest.fn(),
      limit: jest.fn(),
      then: jest.fn((resolve) => {
        return Promise.resolve(resolveData).then(resolve)
      }),
      _setResolveData: (data: any) => {
        resolveData = data
      },
    }

    // Each method returns the chain
    queryChain.select.mockReturnValue(queryChain)
    queryChain.insert.mockReturnValue(queryChain)
    queryChain.update.mockReturnValue(queryChain)
    queryChain.delete.mockReturnValue(queryChain)
    queryChain.eq.mockReturnValue(queryChain)
    queryChain.in.mockReturnValue(queryChain)
    queryChain.order.mockReturnValue(queryChain)
    queryChain.single.mockReturnValue(queryChain)
    queryChain.range.mockReturnValue(queryChain)
    queryChain.limit.mockReturnValue(queryChain)

    mockSupabase = {
      from: jest.fn().mockReturnValue(queryChain),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('createReview', () => {
    const mockReviewData = {
      product_id: 'product-123',
      user_id: 'user-123',
      rating: 5,
      title: 'Excellent product!',
      comment: 'This product exceeded my expectations. Highly recommended!',
    }

    it('should create review with valid data', async () => {
      const mockCreatedReview = {
        id: 'review-123',
        ...mockReviewData,
        verified_purchase: true,
        helpful_count: 0,
        is_approved: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      queryChain._setResolveData({ data: mockCreatedReview, error: null })

      const result = await ReviewService.createReview(mockReviewData)

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews')
      expect(queryChain.insert).toHaveBeenCalledWith(mockReviewData)
      expect(queryChain.select).toHaveBeenCalled()
      expect(queryChain.single).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedReview)
    })

    it('should throw error for duplicate review (user already reviewed product)', async () => {
      queryChain._setResolveData({
        data: null,
        error: {
          code: '23505', // PostgreSQL unique constraint violation
          message: 'duplicate key value violates unique constraint "unique_user_product_review"',
        },
      })

      await expect(ReviewService.createReview(mockReviewData)).rejects.toThrow(
        'You have already reviewed this product'
      )
    })

    it('should throw error for invalid rating (0)', async () => {
      const invalidData = { ...mockReviewData, rating: 0 }

      queryChain._setResolveData({
        data: null,
        error: {
          code: '23514', // CHECK constraint violation
          message: 'new row for relation "reviews" violates check constraint',
        },
      })

      await expect(ReviewService.createReview(invalidData)).rejects.toThrow()
    })

    it('should throw error for invalid rating (6)', async () => {
      const invalidData = { ...mockReviewData, rating: 6 }

      queryChain._setResolveData({
        data: null,
        error: {
          code: '23514',
          message: 'new row for relation "reviews" violates check constraint',
        },
      })

      await expect(ReviewService.createReview(invalidData)).rejects.toThrow()
    })

    it('should throw error for title too short', async () => {
      const invalidData = { ...mockReviewData, title: 'Good' } // Only 4 chars

      queryChain._setResolveData({
        data: null,
        error: {
          code: '23514',
          message: 'new row violates check constraint "reviews_title_check"',
        },
      })

      await expect(ReviewService.createReview(invalidData)).rejects.toThrow()
    })

    it('should throw error for comment too short', async () => {
      const invalidData = { ...mockReviewData, comment: 'Good!' } // Only 5 chars

      queryChain._setResolveData({
        data: null,
        error: {
          code: '23514',
          message: 'new row violates check constraint "reviews_comment_check"',
        },
      })

      await expect(ReviewService.createReview(invalidData)).rejects.toThrow()
    })
  })

  describe('checkVerifiedPurchase', () => {
    it('should return true if user has ordered the product', async () => {
      // Mock order_items query returning a match
      queryChain._setResolveData({
        data: [{ product_id: 'product-123' }],
        error: null,
      })

      const result = await ReviewService.checkVerifiedPurchase('user-123', 'product-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('order_items')
      expect(queryChain.select).toHaveBeenCalledWith('product_id')
      expect(queryChain.eq).toHaveBeenCalledWith('product_id', 'product-123')
      expect(result).toBe(true)
    })

    it('should return false if user has not ordered the product', async () => {
      queryChain._setResolveData({
        data: [],
        error: null,
      })

      const result = await ReviewService.checkVerifiedPurchase('user-123', 'product-999')

      expect(result).toBe(false)
    })
  })

  describe('getProductReviews', () => {
    const mockReviews = [
      {
        id: 'review-1',
        product_id: 'product-123',
        user_id: 'user-1',
        rating: 5,
        title: 'Excellent!',
        comment: 'Loved this product!',
        verified_purchase: true,
        helpful_count: 10,
        is_approved: true,
        created_at: '2024-01-03T00:00:00Z',
      },
      {
        id: 'review-2',
        product_id: 'product-123',
        user_id: 'user-2',
        rating: 4,
        title: 'Very good',
        comment: 'Great product, minor issues.',
        verified_purchase: false,
        helpful_count: 5,
        is_approved: true,
        created_at: '2024-01-02T00:00:00Z',
      },
    ]

    it('should get product reviews with default sorting (most recent)', async () => {
      queryChain._setResolveData({ data: mockReviews, error: null })

      const result = await ReviewService.getProductReviews('product-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews')
      expect(queryChain.select).toHaveBeenCalled()
      expect(queryChain.eq).toHaveBeenCalledWith('product_id', 'product-123')
      expect(queryChain.eq).toHaveBeenCalledWith('is_approved', true)
      expect(queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockReviews)
    })

    it('should get product reviews sorted by most helpful', async () => {
      queryChain._setResolveData({ data: mockReviews, error: null })

      await ReviewService.getProductReviews('product-123', { sortBy: 'helpful' })

      expect(queryChain.order).toHaveBeenCalledWith('helpful_count', { ascending: false })
    })

    it('should get product reviews sorted by highest rating', async () => {
      queryChain._setResolveData({ data: mockReviews, error: null })

      await ReviewService.getProductReviews('product-123', { sortBy: 'rating' })

      expect(queryChain.order).toHaveBeenCalledWith('rating', { ascending: false })
    })

    it('should get product reviews with pagination', async () => {
      queryChain._setResolveData({ data: mockReviews, error: null })

      await ReviewService.getProductReviews('product-123', {
        limit: 10,
        offset: 20,
      })

      expect(queryChain.range).toHaveBeenCalledWith(20, 29)
    })

    it('should get product reviews with default limit of 20', async () => {
      queryChain._setResolveData({ data: mockReviews, error: null })

      await ReviewService.getProductReviews('product-123')

      expect(queryChain.range).toHaveBeenCalledWith(0, 19)
    })
  })

  describe('updateReview', () => {
    const mockUpdates = {
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment with more details.',
    }

    it('should update review successfully', async () => {
      const mockUpdatedReview = {
        id: 'review-123',
        ...mockUpdates,
        updated_at: new Date().toISOString(),
      }

      queryChain._setResolveData({ data: mockUpdatedReview, error: null })

      const result = await ReviewService.updateReview('review-123', 'user-123', mockUpdates)

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews')
      expect(queryChain.update).toHaveBeenCalledWith(mockUpdates)
      expect(queryChain.eq).toHaveBeenCalledWith('id', 'review-123')
      expect(queryChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(result).toEqual(mockUpdatedReview)
    })

    it('should throw error if review not found or user is not owner', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'No rows updated' },
      })

      await expect(
        ReviewService.updateReview('review-999', 'user-123', mockUpdates)
      ).rejects.toThrow()
    })
  })

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      queryChain._setResolveData({ data: {}, error: null })

      await ReviewService.deleteReview('review-123', 'user-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews')
      expect(queryChain.delete).toHaveBeenCalled()
      expect(queryChain.eq).toHaveBeenCalledWith('id', 'review-123')
      expect(queryChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should throw error if review not found or user is not owner', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'No rows deleted' },
      })

      await expect(ReviewService.deleteReview('review-999', 'user-123')).rejects.toThrow()
    })
  })

  describe('voteHelpful', () => {
    it('should record helpful vote', async () => {
      const mockVote = {
        id: 'vote-123',
        review_id: 'review-123',
        user_id: 'user-456',
        is_helpful: true,
        created_at: '2024-01-01T00:00:00Z',
      }

      queryChain._setResolveData({ data: mockVote, error: null })

      const result = await ReviewService.voteHelpful('review-123', 'user-456', true)

      expect(mockSupabase.from).toHaveBeenCalledWith('review_votes')
      expect(queryChain.insert).toHaveBeenCalledWith({
        review_id: 'review-123',
        user_id: 'user-456',
        is_helpful: true,
      })
      expect(result).toEqual(mockVote)
    })

    it('should record not helpful vote', async () => {
      const mockVote = {
        id: 'vote-124',
        review_id: 'review-123',
        user_id: 'user-456',
        is_helpful: false,
        created_at: '2024-01-01T00:00:00Z',
      }

      queryChain._setResolveData({ data: mockVote, error: null })

      await ReviewService.voteHelpful('review-123', 'user-456', false)

      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ is_helpful: false })
      )
    })

    it('should update existing vote if user already voted', async () => {
      // First insert fails with unique constraint
      queryChain._setResolveData({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint',
        },
      })

      // Then update succeeds
      const mockUpdatedVote = {
        id: 'vote-123',
        review_id: 'review-123',
        user_id: 'user-456',
        is_helpful: false,
        created_at: '2024-01-01T00:00:00Z',
      }

      // After first call fails, set success for update
      queryChain.then.mockImplementationOnce((resolve) => {
        queryChain._setResolveData({ data: mockUpdatedVote, error: null })
        return Promise.resolve({ data: null, error: { code: '23505' } }).then(resolve)
      })

      await ReviewService.voteHelpful('review-123', 'user-456', false)

      expect(queryChain.update).toHaveBeenCalled()
    })
  })

  describe('getUserReview', () => {
    it('should get user review for product', async () => {
      const mockReview = {
        id: 'review-123',
        product_id: 'product-123',
        user_id: 'user-123',
        rating: 5,
        title: 'Great product',
        comment: 'I really enjoyed this product!',
      }

      queryChain._setResolveData({ data: mockReview, error: null })

      const result = await ReviewService.getUserReview('user-123', 'product-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews')
      expect(queryChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(queryChain.eq).toHaveBeenCalledWith('product_id', 'product-123')
      expect(queryChain.single).toHaveBeenCalled()
      expect(result).toEqual(mockReview)
    })

    it('should return null if user has not reviewed product', async () => {
      queryChain._setResolveData({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }, // PostgREST "not found" error
      })

      const result = await ReviewService.getUserReview('user-123', 'product-999')

      expect(result).toBeNull()
    })
  })
})
