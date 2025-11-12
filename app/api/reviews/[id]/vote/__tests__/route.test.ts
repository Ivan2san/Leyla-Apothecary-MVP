import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/services/reviews')

// Helper to create mock request
function createMockRequest(body: any = {}) {
  return {
    json: jest.fn().mockResolvedValue(body),
    method: 'POST',
  } as any
}

describe('POST /api/reviews/[id]/vote', () => {
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
      is_helpful: true,
    })

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if is_helpful is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const request = createMockRequest({})

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('should return 400 if is_helpful is not boolean', async () => {
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
      is_helpful: 'yes', // Should be boolean
    })

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('should successfully record helpful vote', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockVote = {
      id: 'vote-123',
      review_id: 'review-123',
      user_id: 'user-123',
      is_helpful: true,
      created_at: '2024-01-01T00:00:00Z',
    }

    ;(ReviewService.voteHelpful as jest.Mock).mockResolvedValue(mockVote)

    const request = createMockRequest({
      is_helpful: true,
    })

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.vote).toEqual(mockVote)
    expect(ReviewService.voteHelpful).toHaveBeenCalledWith('review-123', 'user-123', true)
  })

  it('should successfully record not helpful vote', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockVote = {
      id: 'vote-124',
      review_id: 'review-123',
      user_id: 'user-123',
      is_helpful: false,
      created_at: '2024-01-01T00:00:00Z',
    }

    ;(ReviewService.voteHelpful as jest.Mock).mockResolvedValue(mockVote)

    const request = createMockRequest({
      is_helpful: false,
    })

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.vote.is_helpful).toBe(false)
    expect(ReviewService.voteHelpful).toHaveBeenCalledWith('review-123', 'user-123', false)
  })

  it('should update existing vote if user already voted', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      },
      error: null,
    })

    const mockUpdatedVote = {
      id: 'vote-123',
      review_id: 'review-123',
      user_id: 'user-123',
      is_helpful: false, // Changed from true to false
      created_at: '2024-01-01T00:00:00Z',
    }

    ;(ReviewService.voteHelpful as jest.Mock).mockResolvedValue(mockUpdatedVote)

    const request = createMockRequest({
      is_helpful: false,
    })

    const response = await POST(request, { params: { id: 'review-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.vote).toEqual(mockUpdatedVote)
  })
})
