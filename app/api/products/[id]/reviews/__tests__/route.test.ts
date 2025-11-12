import { POST, GET } from '../route'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'
import { Review } from '@/types'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/services/reviews')

// Helper to create mock request
function createMockRequest(body: any = {}, method: string = 'POST') {
  return {
    json: jest.fn().mockResolvedValue(body),
    method,
    url: 'http://localhost:3000/api/products/product-123/reviews',
    nextUrl: {
      searchParams: new URLSearchParams(),
    },
  } as any
}

describe('POST /api/products/[id]/reviews', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const request = createMockRequest({
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for invalid rating (too low)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const request = createMockRequest({
      rating: 0, // Invalid
      title: 'Bad rating',
      comment: 'This should fail validation',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Rating must be at least 1')
  })

  it('should return 400 for invalid rating (too high)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const request = createMockRequest({
      rating: 6, // Invalid
      title: 'Bad rating',
      comment: 'This should fail validation',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Rating must be at most 5')
  })

  it('should return 400 for title too short', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const request = createMockRequest({
      rating: 5,
      title: 'Bad', // Only 3 chars, needs 5+
      comment: 'This should fail validation',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Title must be at least 5 characters')
  })

  it('should return 400 for comment too short', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const request = createMockRequest({
      rating: 5,
      title: 'Great product',
      comment: 'Short', // Only 5 chars, needs 10+
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Comment must be at least 10 characters')
  })

  it('should return 409 if user already reviewed this product', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    ;(ReviewService.checkVerifiedPurchase as jest.Mock).mockResolvedValue(true)
    ;(ReviewService.createReview as jest.Mock).mockRejectedValue(
      new Error('You have already reviewed this product')
    )

    const request = createMockRequest({
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('already reviewed')
  })

  it('should successfully create review without verified purchase', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockReview = {
      id: 'review-123',
      product_id: 'product-123',
      user_id: 'user-123',
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
      verified_purchase: false,
      helpful_count: 0,
      is_approved: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    ;(ReviewService.checkVerifiedPurchase as jest.Mock).mockResolvedValue(false)
    ;(ReviewService.createReview as jest.Mock).mockResolvedValue(mockReview)

    const request = createMockRequest({
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.review).toEqual(mockReview)
    expect(ReviewService.checkVerifiedPurchase).toHaveBeenCalledWith('user-123', 'product-123')
    expect(ReviewService.createReview).toHaveBeenCalledWith({
      product_id: 'product-123',
      user_id: 'user-123',
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
      verified_purchase: false,
    })
  })

  it('should successfully create review with verified purchase', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockReview = {
      id: 'review-123',
      product_id: 'product-123',
      user_id: 'user-123',
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
      verified_purchase: true, // User has purchased
      helpful_count: 0,
      is_approved: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    ;(ReviewService.checkVerifiedPurchase as jest.Mock).mockResolvedValue(true)
    ;(ReviewService.createReview as jest.Mock).mockResolvedValue(mockReview)

    const request = createMockRequest({
      rating: 5,
      title: 'Great product',
      comment: 'This product is excellent!',
    })

    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.review.verified_purchase).toBe(true)
  })
})

describe('GET /api/products/[id]/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get product reviews with default parameters', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        product_id: 'product-123',
        rating: 5,
        title: 'Excellent',
        comment: 'Great product!',
        created_at: '2024-01-03T00:00:00Z',
      },
      {
        id: 'review-2',
        product_id: 'product-123',
        rating: 4,
        title: 'Good',
        comment: 'Nice product.',
        created_at: '2024-01-02T00:00:00Z',
      },
    ]

    ;(ReviewService.getProductReviews as jest.Mock).mockResolvedValue(mockReviews)

    const request = createMockRequest({}, 'GET')
    const response = await GET(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.reviews).toEqual(mockReviews)
    expect(ReviewService.getProductReviews).toHaveBeenCalledWith('product-123', {
      sortBy: 'recent',
      limit: 20,
      offset: 0,
    })
  })

  it('should get product reviews with custom sorting', async () => {
    const mockReviews: Review[] = []

    ;(ReviewService.getProductReviews as jest.Mock).mockResolvedValue(mockReviews)

    const request = createMockRequest({}, 'GET')
    request.nextUrl.searchParams.set('sortBy', 'helpful')

    const response = await GET(request, { params: { id: 'product-123' } })

    expect(ReviewService.getProductReviews).toHaveBeenCalledWith('product-123', {
      sortBy: 'helpful',
      limit: 20,
      offset: 0,
    })
  })

  it('should get product reviews with pagination', async () => {
    const mockReviews: Review[] = []

    ;(ReviewService.getProductReviews as jest.Mock).mockResolvedValue(mockReviews)

    const request = createMockRequest({}, 'GET')
    request.nextUrl.searchParams.set('limit', '10')
    request.nextUrl.searchParams.set('offset', '20')

    const response = await GET(request, { params: { id: 'product-123' } })

    expect(ReviewService.getProductReviews).toHaveBeenCalledWith('product-123', {
      sortBy: 'recent',
      limit: 10,
      offset: 20,
    })
  })
})
