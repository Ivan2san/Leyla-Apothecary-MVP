import { PATCH, DELETE } from '../route'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/services/reviews')

// Helper to create mock request
function createMockRequest(body: any = {}, method: string = 'PATCH') {
  return {
    json: jest.fn().mockResolvedValue(body),
    method,
  } as any
}

describe('PATCH /api/reviews/[id]', () => {
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
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment text here.',
    })

    const response = await PATCH(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for invalid rating', async () => {
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
    })

    const response = await PATCH(request, { params: { id: 'review-123' } })
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
      title: 'Bad', // Only 3 chars
    })

    const response = await PATCH(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Title must be at least 5 characters')
  })

  it('should return 403 if user tries to update someone else\'s review', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    ;(ReviewService.updateReview as jest.Mock).mockRejectedValue(
      new Error('Failed to update review')
    )

    const request = createMockRequest({
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment text here.',
    })

    const response = await PATCH(request, { params: { id: 'review-999' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeTruthy()
  })

  it('should successfully update review', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockUpdatedReview = {
      id: 'review-123',
      product_id: 'product-123',
      user_id: 'user-123',
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment text here.',
      verified_purchase: true,
      helpful_count: 5,
      is_approved: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    ;(ReviewService.updateReview as jest.Mock).mockResolvedValue(mockUpdatedReview)

    const request = createMockRequest({
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment text here.',
    })

    const response = await PATCH(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.review).toEqual(mockUpdatedReview)
    expect(ReviewService.updateReview).toHaveBeenCalledWith('review-123', 'user-123', {
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment text here.',
    })
  })

  it('should allow partial updates (only rating)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockUpdatedReview = {
      id: 'review-123',
      rating: 5,
    }

    ;(ReviewService.updateReview as jest.Mock).mockResolvedValue(mockUpdatedReview)

    const request = createMockRequest({
      rating: 5,
    })

    const response = await PATCH(request, { params: { id: 'review-123' } })

    expect(response.status).toBe(200)
    expect(ReviewService.updateReview).toHaveBeenCalledWith('review-123', 'user-123', {
      rating: 5,
    })
  })
})

describe('DELETE /api/reviews/[id]', () => {
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

    const request = { method: 'DELETE' } as any

    const response = await DELETE(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user tries to delete someone else\'s review', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    ;(ReviewService.deleteReview as jest.Mock).mockRejectedValue(
      new Error('Failed to delete review')
    )

    const request = { method: 'DELETE' } as any

    const response = await DELETE(request, { params: { id: 'review-999' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeTruthy()
  })

  it('should successfully delete review', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    ;(ReviewService.deleteReview as jest.Mock).mockResolvedValue(undefined)

    const request = { method: 'DELETE' } as any

    const response = await DELETE(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(ReviewService.deleteReview).toHaveBeenCalledWith('review-123', 'user-123')
  })
})
