import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '../product-card'
import { Product, ProductCategory } from '@/types'
import { useCartStore } from '@/lib/store/cart'

// Mock the cart store
jest.mock('@/lib/store/cart', () => ({
  useCartStore: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

describe('ProductCard', () => {
  const mockAddItem = jest.fn()
  const mockGetItemQuantity = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
      getItemQuantity: mockGetItemQuantity,
    })
    mockGetItemQuantity.mockReturnValue(0)
  })

  const mockProduct: Product = {
    id: '1',
    name: 'Chamomile Tea',
    slug: 'chamomile-tea',
    description: 'Calming herbal tea for relaxation',
    price: 12.99,
    category: 'herbs' as ProductCategory,
    image_url: '/images/chamomile.jpg',
    stock_quantity: 50,
    volume_ml: 100,
    is_active: true,
    benefits: ['Promotes relaxation', 'Aids sleep', 'Reduces stress'],
    ingredients: ['Chamomile flowers'],
    dosage_instructions: 'Steep 1 tea bag in hot water for 5-7 minutes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('should render product name, description, and price', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Chamomile Tea')).toBeInTheDocument()
    expect(screen.getByText('Calming herbal tea for relaxation')).toBeInTheDocument()
    expect(screen.getByText('$12.99')).toBeInTheDocument()
  })

  it('should render product category', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('herbs')).toBeInTheDocument()
  })

  it('should render product benefits', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Benefits:')).toBeInTheDocument()
    expect(screen.getByText('Promotes relaxation')).toBeInTheDocument()
    expect(screen.getByText('Aids sleep')).toBeInTheDocument()
    expect(screen.getByText('Reduces stress')).toBeInTheDocument()
  })

  it('should show "Out of Stock" when stock quantity is 0', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock_quantity: 0,
    }

    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('should disable "Add to Cart" button when stock is 0', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock_quantity: 0,
    }

    render(<ProductCard product={outOfStockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i })
    expect(addToCartButton).toBeDisabled()
  })

  it('should show low stock warning when stock is 5 or less (but > 0)', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock_quantity: 3,
    }

    render(<ProductCard product={lowStockProduct} />)

    expect(screen.getByText('Only 3 left')).toBeInTheDocument()
  })

  it('should show low stock warning when stock is exactly 5', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock_quantity: 5,
    }

    render(<ProductCard product={lowStockProduct} />)

    expect(screen.getByText('Only 5 left')).toBeInTheDocument()
  })

  it('should not show low stock warning when stock is above 5', () => {
    const highStockProduct = {
      ...mockProduct,
      stock_quantity: 10,
    }

    render(<ProductCard product={highStockProduct} />)

    expect(screen.queryByText(/only \d+ left/i)).not.toBeInTheDocument()
  })

  it('should call addItem when "Add to Cart" button is clicked', () => {
    render(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 1)
  })

  it('should show "Added!" message after adding to cart', async () => {
    render(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    await waitFor(() => {
      expect(screen.getByText('Added!')).toBeInTheDocument()
    })
  })

  it('should show quantity in cart if item already exists', () => {
    mockGetItemQuantity.mockReturnValue(3)

    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText(/add to cart \(3\)/i)).toBeInTheDocument()
  })

  it('should have a link to product details page', () => {
    render(<ProductCard product={mockProduct} />)

    const viewDetailsLink = screen.getByRole('link', { name: /view details/i })
    expect(viewDetailsLink).toHaveAttribute('href', '/products/chamomile-tea')
  })

  it('should render volume in ml', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('100ml')).toBeInTheDocument()
  })

  it('should handle product without benefits', () => {
    const productWithoutBenefits = {
      ...mockProduct,
      benefits: [],
    }

    render(<ProductCard product={productWithoutBenefits} />)

    expect(screen.queryByText('Benefits:')).not.toBeInTheDocument()
  })

  it('should limit benefits display to first 3 items', () => {
    const productWithManyBenefits = {
      ...mockProduct,
      benefits: [
        'Benefit 1',
        'Benefit 2',
        'Benefit 3',
        'Benefit 4',
        'Benefit 5',
      ],
    }

    render(<ProductCard product={productWithManyBenefits} />)

    expect(screen.getByText('Benefit 1')).toBeInTheDocument()
    expect(screen.getByText('Benefit 2')).toBeInTheDocument()
    expect(screen.getByText('Benefit 3')).toBeInTheDocument()
    expect(screen.queryByText('Benefit 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Benefit 5')).not.toBeInTheDocument()
  })
})
