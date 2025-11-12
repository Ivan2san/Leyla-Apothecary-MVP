import { ProductService } from '../products'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductCategory } from '@/types'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('ProductService', () => {
  // Mock Supabase query builder
  let mockSelect: jest.Mock
  let mockEq: jest.Mock
  let mockOr: jest.Mock
  let mockOrder: jest.Mock
  let mockLimit: jest.Mock
  let mockRange: jest.Mock
  let mockSingle: jest.Mock
  let mockFrom: jest.Mock
  let queryChain: any

  beforeEach(() => {
    // Create a chainable query mock that is also thenable (can be awaited)
    let resolveData: any = { data: [], error: null }

    queryChain = {
      select: jest.fn(),
      eq: jest.fn(),
      or: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      range: jest.fn(),
      single: jest.fn(),
      then: jest.fn((resolve) => {
        // Make the chain thenable so it can be awaited
        return Promise.resolve(resolveData).then(resolve)
      }),
      // Method to set what the promise should resolve to
      _setResolveData: (data: any) => {
        resolveData = data
      },
    }

    // Each method returns the chain for chaining
    queryChain.select.mockReturnValue(queryChain)
    queryChain.eq.mockReturnValue(queryChain)
    queryChain.or.mockReturnValue(queryChain)
    queryChain.order.mockReturnValue(queryChain)
    queryChain.limit.mockReturnValue(queryChain)
    queryChain.range.mockReturnValue(queryChain)
    queryChain.single.mockReturnValue(queryChain)

    mockSelect = queryChain.select
    mockEq = queryChain.eq
    mockOr = queryChain.or
    mockOrder = queryChain.order
    mockLimit = queryChain.limit
    mockRange = queryChain.range
    mockSingle = queryChain.single

    mockFrom = jest.fn(() => queryChain)

    const mockSupabase = {
      from: mockFrom,
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('getProducts', () => {
    it('should fetch all active products', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Chamomile Tea',
          slug: 'chamomile-tea',
          description: 'Calming herbal tea',
          price: 12.99,
          category: 'herbs' as ProductCategory,
          image_url: '/images/chamomile.jpg',
          stock_quantity: 50,
          is_active: true,
          benefits: ['Relaxation', 'Sleep aid'],
          ingredients: ['Chamomile flowers'],
          dosage_instructions: 'Steep 1 tea bag in hot water for 5-7 minutes',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      queryChain._setResolveData({ data: mockProducts, error: null })

      const result = await ProductService.getProducts()

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockProducts)
    })

    it('should filter products by category', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ category: 'herbs' as ProductCategory })

      expect(mockEq).toHaveBeenCalledWith('category', 'herbs')
    })

    it('should sanitize search input by removing special characters', async () => {
      queryChain._setResolveData({ data: [], error: null })

      // Test with dangerous special characters
      await ProductService.getProducts({ search: 'test%_*()' })

      // Verify that special characters were removed
      // The sanitized search should be "test" without %_*()
      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.*test*,description.ilike.*test*'
      )
    })

    it('should sanitize search input with multiple special characters', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ search: '  chamomile%tea_*(filter)  ' })

      // Special characters removed, whitespace trimmed
      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.*chamomileteafilter*,description.ilike.*chamomileteafilter*'
      )
    })

    it('should not perform search if sanitized input is empty', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ search: '   %_*()   ' })

      // or() should NOT be called because the sanitized string is empty
      expect(mockOr).not.toHaveBeenCalled()
    })

    it('should perform search with valid sanitized input', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ search: 'lavender' })

      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.*lavender*,description.ilike.*lavender*'
      )
    })

    it('should apply limit when provided', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ limit: 10 })

      expect(mockLimit).toHaveBeenCalledWith(10)
    })

    it('should apply pagination with offset and limit', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProducts({ offset: 10, limit: 5 })

      // range(10, 14) because offset=10, limit=5 means items 10-14
      expect(mockRange).toHaveBeenCalledWith(10, 14)
    })

    it('should throw error when query fails', async () => {
      const mockError = new Error('Database error')
      queryChain._setResolveData({ data: null, error: mockError })

      await expect(ProductService.getProducts()).rejects.toThrow('Database error')
    })
  })

  describe('getProductBySlug', () => {
    it('should fetch a product by slug', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Chamomile Tea',
        slug: 'chamomile-tea',
        description: 'Calming herbal tea',
        price: 12.99,
        category: 'herbs' as ProductCategory,
        image_url: '/images/chamomile.jpg',
        stock_quantity: 50,
        is_active: true,
        benefits: ['Relaxation'],
        ingredients: ['Chamomile'],
        dosage_instructions: 'Steep in hot water',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      queryChain._setResolveData({ data: mockProduct, error: null })

      const result = await ProductService.getProductBySlug('chamomile-tea')

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(mockEq).toHaveBeenCalledWith('slug', 'chamomile-tea')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockProduct)
    })

    it('should throw error when product not found', async () => {
      const mockError = new Error('Product not found')
      queryChain._setResolveData({ data: null, error: mockError })

      await expect(
        ProductService.getProductBySlug('non-existent')
      ).rejects.toThrow('Product not found')
    })
  })

  describe('getProductById', () => {
    it('should fetch a product by ID', async () => {
      const mockProduct: Product = {
        id: '123',
        name: 'Lavender Oil',
        slug: 'lavender-oil',
        description: 'Essential oil',
        price: 19.99,
        category: 'essential-oils' as ProductCategory,
        image_url: '/images/lavender.jpg',
        stock_quantity: 30,
        is_active: true,
        benefits: ['Aromatherapy'],
        ingredients: ['Lavender extract'],
        dosage_instructions: 'Use as directed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      queryChain._setResolveData({ data: mockProduct, error: null })

      const result = await ProductService.getProductById('123')

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(mockEq).toHaveBeenCalledWith('id', '123')
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockProduct)
    })
  })

  describe('getCategories', () => {
    it('should return unique product categories', async () => {
      const mockData = [
        { category: 'herbs' },
        { category: 'herbs' },
        { category: 'essential-oils' },
        { category: 'tinctures' },
      ]

      queryChain._setResolveData({ data: mockData, error: null })

      const result = await ProductService.getCategories()

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(mockSelect).toHaveBeenCalledWith('category')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(result).toEqual(['herbs', 'essential-oils', 'tinctures'])
    })
  })

  describe('getFeaturedProducts', () => {
    it('should fetch featured products with default limit', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getFeaturedProducts()

      expect(mockLimit).toHaveBeenCalledWith(6)
    })

    it('should fetch featured products with custom limit', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getFeaturedProducts(10)

      expect(mockLimit).toHaveBeenCalledWith(10)
    })
  })

  describe('getProductsByCategory', () => {
    it('should call getProducts with category filter', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.getProductsByCategory('herbs' as ProductCategory)

      expect(mockEq).toHaveBeenCalledWith('category', 'herbs')
    })
  })

  describe('searchProducts', () => {
    it('should call getProducts with search term', async () => {
      queryChain._setResolveData({ data: [], error: null })

      await ProductService.searchProducts('lavender')

      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.*lavender*,description.ilike.*lavender*'
      )
    })
  })
})
