import { POST, GET } from '../route'
import { createClient } from '@/lib/supabase/server'
import { OrderService } from '@/lib/services/orders'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/services/orders')

// Helper to create mock request
function createMockRequest(body: any = {}, method: string = 'POST') {
  return {
    json: jest.fn().mockResolvedValue(body),
    method,
  } as any
}

describe('POST /api/orders', () => {
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

  const validOrderPayload = {
    items: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
        price: 12.99,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
      phone: '555-1234',
    },
    subtotal: 25.98,
    shippingCost: 5.99,
    tax: 2.08,
    totalAmount: 34.05,
  }

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const request = createMockRequest(validOrderPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(OrderService.createOrder).not.toHaveBeenCalled()
  })

  it('should return 400 with Zod errors for invalid payload', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    // Invalid payload: missing required fields
    const invalidPayload = {
      items: [], // Empty items array
      shippingAddress: {
        fullName: '', // Empty full name
      },
      subtotal: -10, // Negative subtotal
      totalAmount: 0, // Zero total
    }

    const request = createMockRequest(invalidPayload)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toBeDefined()
    expect(Array.isArray(data.details)).toBe(true)
    expect(OrderService.createOrder).not.toHaveBeenCalled()
  })

  it('should create order successfully for authenticated user', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      status: 'pending',
      subtotal: 25.98,
      shipping: 5.99,
      tax: 2.08,
      total: 34.05,
      order_number: 'ORD-001',
      created_at: '2024-01-01T00:00:00Z',
    }

    ;(OrderService.createOrder as jest.Mock).mockResolvedValue(mockOrder)

    const request = createMockRequest(validOrderPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.order).toEqual(mockOrder)
    expect(OrderService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        items: validOrderPayload.items,
        shippingAddress: validOrderPayload.shippingAddress,
      })
    )
  })

  it('should pass server-side price recalculation test', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    // Client sends manipulated prices
    const manipulatedPayload = {
      ...validOrderPayload,
      subtotal: 0.01, // Manipulated!
      totalAmount: 0.01, // Manipulated!
    }

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      status: 'pending',
      subtotal: 25.98, // Server-calculated correct price
      shipping: 5.99,
      tax: 2.08,
      total: 34.05, // Server-calculated correct total
      order_number: 'ORD-001',
    }

    ;(OrderService.createOrder as jest.Mock).mockResolvedValue(mockOrder)

    const request = createMockRequest(manipulatedPayload)
    const response = await POST(request)
    const data = await response.json()

    // Order should still be created with server-calculated prices
    expect(response.status).toBe(201)
    expect(data.order.subtotal).toBe(25.98) // Server price, not client price
    expect(OrderService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        // Server will recalculate these values
        subtotal: 0.01, // This is what client sent
        totalAmount: 0.01, // This is what client sent
      })
    )
  })

  it('should return 500 if stock validation fails', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    // Mock OrderService throwing insufficient stock error
    ;(OrderService.createOrder as jest.Mock).mockRejectedValue(
      new Error('Insufficient stock for Chamomile Tea. Available: 1, Requested: 2')
    )

    const request = createMockRequest(validOrderPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Insufficient stock')
  })

  it('should generate order number automatically', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      order_number: 'ORD-12345', // Auto-generated by database
      status: 'pending',
      subtotal: 25.98,
      shipping: 5.99,
      tax: 2.08,
      total: 34.05,
    }

    ;(OrderService.createOrder as jest.Mock).mockResolvedValue(mockOrder)

    const request = createMockRequest(validOrderPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.order.order_number).toBeDefined()
    expect(typeof data.order.order_number).toBe('string')
    expect(data.order.order_number).toMatch(/ORD-/)
  })

  it('should validate payload has at least one item', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const emptyItemsPayload = {
      ...validOrderPayload,
      items: [], // Empty items
    }

    const request = createMockRequest(emptyItemsPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details.some((d: any) => d.message.includes('at least one item'))).toBe(true)
  })

  it('should validate product IDs are UUIDs', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const invalidUuidPayload = {
      ...validOrderPayload,
      items: [
        {
          productId: 'not-a-uuid', // Invalid UUID
          quantity: 1,
          price: 10,
        },
      ],
    }

    const request = createMockRequest(invalidUuidPayload)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details.some((d: any) => d.message.includes('Invalid product ID'))).toBe(true)
  })
})

describe('GET /api/orders', () => {
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
    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const request = createMockRequest({}, 'GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(OrderService.getUserOrders).not.toHaveBeenCalled()
  })

  it('should return only current user orders (RLS test)', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-123', // Current user's order
        status: 'delivered',
        total: 50.0,
        created_at: '2024-01-02T00:00:00Z',
      },
      {
        id: 'order-2',
        user_id: 'user-123', // Current user's order
        status: 'pending',
        total: 30.0,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]

    ;(OrderService.getUserOrders as jest.Mock).mockResolvedValue(mockOrders)

    const request = createMockRequest({}, 'GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orders).toEqual(mockOrders)
    expect(OrderService.getUserOrders).toHaveBeenCalledWith('user-123')

    // Verify all returned orders belong to the current user
    expect(data.orders.every((order: any) => order.user_id === 'user-123')).toBe(true)
  })

  it('should return orders sorted by created_at descending', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    const mockOrders = [
      {
        id: 'order-2',
        user_id: 'user-123',
        status: 'pending',
        created_at: '2024-01-03T00:00:00Z', // Most recent
      },
      {
        id: 'order-1',
        user_id: 'user-123',
        status: 'delivered',
        created_at: '2024-01-01T00:00:00Z', // Oldest
      },
    ]

    ;(OrderService.getUserOrders as jest.Mock).mockResolvedValue(mockOrders)

    const request = createMockRequest({}, 'GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orders).toEqual(mockOrders)

    // Verify orders are sorted by created_at descending
    const dates = data.orders.map((o: any) => new Date(o.created_at).getTime())
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1])
    }
  })
})
