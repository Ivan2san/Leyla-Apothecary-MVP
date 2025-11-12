import { OrderService, CreateOrderData } from '../orders'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('OrderService', () => {
  let mockSupabase: any
  let queryChain: any

  beforeEach(() => {
    // Create a chainable query mock that is also thenable
    let resolveData: any = { data: [], error: null }

    queryChain = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
      then: jest.fn((resolve) => {
        return Promise.resolve(resolveData).then(resolve)
      }),
      _setResolveData: (data: any) => {
        resolveData = data
      },
    }

    // Each method returns the chain for chaining
    queryChain.select.mockReturnValue(queryChain)
    queryChain.insert.mockReturnValue(queryChain)
    queryChain.update.mockReturnValue(queryChain)
    queryChain.delete.mockReturnValue(queryChain)
    queryChain.eq.mockReturnValue(queryChain)
    queryChain.in.mockReturnValue(queryChain)
    queryChain.order.mockReturnValue(queryChain)
    queryChain.single.mockReturnValue(queryChain)

    const mockFrom = jest.fn(() => queryChain)

    mockSupabase = {
      from: mockFrom,
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('createOrder', () => {
    const mockOrderData: CreateOrderData = {
      userId: 'user-123',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          price: 12.99,
        },
        {
          productId: 'product-2',
          quantity: 1,
          price: 19.99,
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
      subtotal: 45.97,
      shippingCost: 0,
      tax: 3.68,
      totalAmount: 49.65,
    }

    const mockProducts = [
      {
        id: 'product-1',
        name: 'Chamomile Tea',
        price: 12.99,
        stock_quantity: 50,
        is_active: true,
      },
      {
        id: 'product-2',
        name: 'Lavender Oil',
        price: 19.99,
        stock_quantity: 30,
        is_active: true,
      },
    ]

    it('should create order successfully with all 7 steps', async () => {
      // STEP 1: Mock product fetch
      queryChain._setResolveData({ data: mockProducts, error: null })

      // STEP 5: Mock order creation
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        status: 'pending',
        subtotal: 45.97,
        shipping: 0,
        tax: 3.68,
        total: 49.65,
        order_number: 'ORD-001',
      }

      // Setup different responses for different queries
      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          // First call: fetch products
          return Promise.resolve({ data: mockProducts, error: null }).then(resolve)
        } else if (callCount === 2) {
          // Second call: create order
          return Promise.resolve({ data: mockOrder, error: null }).then(resolve)
        } else if (callCount === 3) {
          // Third call: create order items
          return Promise.resolve({ data: null, error: null }).then(resolve)
        } else {
          // Subsequent calls: update stock
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      const result = await OrderService.createOrder(mockOrderData)

      // Verify STEP 1: Products were fetched
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(queryChain.in).toHaveBeenCalledWith('id', ['product-1', 'product-2'])

      // Verify STEP 5: Order was created with server-calculated values
      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          status: 'pending',
          subtotal: 45.97, // Server-calculated
          shipping: 5.99, // Shipping applied (subtotal < 50)
          tax: expect.any(Number), // 8% tax
        })
      )

      // Verify STEP 6: Order items were created
      expect(mockSupabase.from).toHaveBeenCalledWith('order_items')

      // Verify STEP 7: Stock was decremented
      expect(queryChain.update).toHaveBeenCalled()

      expect(result).toEqual(mockOrder)
    })

    it('should recalculate prices server-side (STEP 3)', async () => {
      // Client sends manipulated prices
      const manipulatedData: CreateOrderData = {
        ...mockOrderData,
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            price: 0.01, // Manipulated price!
          },
        ],
        subtotal: 0.02,
        totalAmount: 0.02,
      }

      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            data: [mockProducts[0]],
            error: null,
          }).then(resolve)
        } else if (callCount === 2) {
          return Promise.resolve({
            data: {
              id: 'order-123',
              subtotal: 25.98, // Server-calculated: 2 × $12.99
              shipping: 5.99,
              tax: 2.08,
              total: 34.05,
            },
            error: null,
          }).then(resolve)
        } else {
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      await OrderService.createOrder(manipulatedData)

      // Verify server used correct prices, not client prices
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 25.98, // Server price: 2 × $12.99
          shipping: 5.99, // Subtotal < $50, so shipping applies
          tax: expect.any(Number), // 8% of subtotal
        })
      )
    })

    it('should apply free shipping when subtotal >= $50 (STEP 3)', async () => {
      const largeOrderData: CreateOrderData = {
        ...mockOrderData,
        items: [
          {
            productId: 'product-1',
            quantity: 5, // 5 × $12.99 = $64.95
            price: 12.99,
          },
        ],
      }

      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            data: [mockProducts[0]],
            error: null,
          }).then(resolve)
        } else if (callCount === 2) {
          return Promise.resolve({
            data: { id: 'order-123' },
            error: null,
          }).then(resolve)
        } else {
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      await OrderService.createOrder(largeOrderData)

      // Verify free shipping was applied
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          shipping: 0, // Free shipping
        })
      )
    })

    it('should throw error if products not found (STEP 1)', async () => {
      queryChain._setResolveData({
        data: [mockProducts[0]], // Only 1 product, but 2 requested
        error: null,
      })

      await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow(
        'Some products not found or inactive'
      )
    })

    it('should throw error if product fetch fails (STEP 1)', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow(
        'Failed to fetch products: Database error'
      )
    })

    it('should throw error if product is inactive (STEP 2)', async () => {
      const inactiveProducts = [
        {
          ...mockProducts[0],
          is_active: false, // Inactive product
        },
        mockProducts[1],
      ]

      queryChain._setResolveData({
        data: inactiveProducts,
        error: null,
      })

      await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow(
        'Chamomile Tea is no longer available'
      )
    })

    it('should throw error if insufficient stock (STEP 2)', async () => {
      const lowStockProducts = [
        {
          ...mockProducts[0],
          stock_quantity: 1, // Only 1 in stock, but 2 requested
        },
        mockProducts[1],
      ]

      queryChain._setResolveData({
        data: lowStockProducts,
        error: null,
      })

      await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow(
        'Insufficient stock for Chamomile Tea. Available: 1, Requested: 2'
      )
    })

    it('should rollback order if order items creation fails (STEP 6)', async () => {
      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          // Products fetch success
          return Promise.resolve({ data: mockProducts, error: null }).then(resolve)
        } else if (callCount === 2) {
          // Order creation success
          return Promise.resolve({
            data: { id: 'order-123' },
            error: null,
          }).then(resolve)
        } else if (callCount === 3) {
          // Order items creation FAILS
          return Promise.resolve({
            data: null,
            error: { message: 'Foreign key constraint violation' },
          }).then(resolve)
        } else {
          // Rollback delete
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow(
        'Failed to create order items'
      )

      // Verify rollback was attempted
      expect(queryChain.delete).toHaveBeenCalled()
    })

    it('should decrement stock for all products (STEP 7)', async () => {
      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: mockProducts, error: null }).then(resolve)
        } else if (callCount === 2) {
          return Promise.resolve({
            data: { id: 'order-123' },
            error: null,
          }).then(resolve)
        } else if (callCount === 3) {
          return Promise.resolve({ data: null, error: null }).then(resolve)
        } else {
          // Stock updates
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      await OrderService.createOrder(mockOrderData)

      // Verify stock was updated for product-1 (50 - 2 = 48)
      expect(queryChain.update).toHaveBeenCalledWith({ stock_quantity: 48 })

      // Verify stock was updated for product-2 (30 - 1 = 29)
      expect(queryChain.update).toHaveBeenCalledWith({ stock_quantity: 29 })
    })

    it('should calculate 8% tax correctly (STEP 3)', async () => {
      let callCount = 0
      queryChain.then.mockImplementation((resolve: (value: any) => void) => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: mockProducts, error: null }).then(resolve)
        } else if (callCount === 2) {
          return Promise.resolve({
            data: { id: 'order-123' },
            error: null,
          }).then(resolve)
        } else {
          return Promise.resolve({ data: null, error: null }).then(resolve)
        }
      })

      await OrderService.createOrder(mockOrderData)

      // Subtotal: 45.97, Tax: 45.97 × 0.08 = 3.6776
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tax: expect.any(Number),
        })
      )

      const insertCall = queryChain.insert.mock.calls[0][0]
      expect(insertCall.tax).toBeCloseTo(3.68, 2)
    })
  })

  describe('getOrder', () => {
    it('should fetch order by ID with items', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        status: 'pending',
        total: 49.65,
        order_items: [
          {
            id: 'item-1',
            quantity: 2,
            products: { name: 'Chamomile Tea' },
          },
        ],
      }

      queryChain._setResolveData({ data: mockOrder, error: null })

      const result = await OrderService.getOrder('order-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(queryChain.select).toHaveBeenCalledWith('*, order_items(*, products(*))')
      expect(queryChain.eq).toHaveBeenCalledWith('id', 'order-123')
      expect(queryChain.single).toHaveBeenCalled()
      expect(result).toEqual(mockOrder)
    })

    it('should throw error if order not found', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'Order not found' },
      })

      await expect(OrderService.getOrder('non-existent')).rejects.toThrow(
        'Failed to get order: Order not found'
      )
    })
  })

  describe('getUserOrders', () => {
    it('should fetch all orders for a user', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          user_id: 'user-123',
          status: 'delivered',
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'order-2',
          user_id: 'user-123',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      queryChain._setResolveData({ data: mockOrders, error: null })

      const result = await OrderService.getUserOrders('user-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(queryChain.select).toHaveBeenCalledWith('*, order_items(*, products(*))')
      expect(queryChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockOrders)
    })

    it('should return empty array if user has no orders', async () => {
      queryChain._setResolveData({ data: [], error: null })

      const result = await OrderService.getUserOrders('user-123')

      expect(result).toEqual([])
    })

    it('should throw error if fetch fails', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(OrderService.getUserOrders('user-123')).rejects.toThrow(
        'Failed to get user orders: Database error'
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status to processing', async () => {
      const mockOrder = {
        id: 'order-123',
        status: 'processing',
      }

      queryChain._setResolveData({ data: mockOrder, error: null })

      const result = await OrderService.updateOrderStatus('order-123', 'processing')

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(queryChain.update).toHaveBeenCalledWith({ status: 'processing' })
      expect(queryChain.eq).toHaveBeenCalledWith('id', 'order-123')
      expect(result).toEqual(mockOrder)
    })

    it('should update order status to shipped', async () => {
      queryChain._setResolveData({
        data: { id: 'order-123', status: 'shipped' },
        error: null,
      })

      await OrderService.updateOrderStatus('order-123', 'shipped')

      expect(queryChain.update).toHaveBeenCalledWith({ status: 'shipped' })
    })

    it('should update order status to delivered', async () => {
      queryChain._setResolveData({
        data: { id: 'order-123', status: 'delivered' },
        error: null,
      })

      await OrderService.updateOrderStatus('order-123', 'delivered')

      expect(queryChain.update).toHaveBeenCalledWith({ status: 'delivered' })
    })

    it('should update order status to cancelled', async () => {
      queryChain._setResolveData({
        data: { id: 'order-123', status: 'cancelled' },
        error: null,
      })

      await OrderService.updateOrderStatus('order-123', 'cancelled')

      expect(queryChain.update).toHaveBeenCalledWith({ status: 'cancelled' })
    })

    it('should throw error if update fails', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'Order not found' },
      })

      await expect(
        OrderService.updateOrderStatus('non-existent', 'shipped')
      ).rejects.toThrow('Failed to update order status: Order not found')
    })
  })
})
