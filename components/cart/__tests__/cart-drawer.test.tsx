import { render, screen, fireEvent } from '@testing-library/react'
import { CartDrawer } from '../cart-drawer'
import { useCartStore } from '@/lib/store/cart'
import { Product, ProductCategory } from '@/types'

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

describe('CartDrawer', () => {
  const mockRemoveItem = jest.fn()
  const mockUpdateQuantity = jest.fn()
  const mockGetTotalItems = jest.fn()
  const mockGetTotalPrice = jest.fn()

  const mockProduct1: Product = {
    id: '1',
    name: 'Chamomile Tea',
    slug: 'chamomile-tea',
    description: 'Calming herbal tea',
    price: 12.99,
    category: 'herbs' as ProductCategory,
    image_url: '/images/chamomile.jpg',
    stock_quantity: 50,
    volume_ml: 100,
    is_active: true,
    benefits: ['Relaxation'],
    ingredients: ['Chamomile'],
    dosage_instructions: 'Steep in hot water',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockProduct2: Product = {
    id: '2',
    name: 'Lavender Oil',
    slug: 'lavender-oil',
    description: 'Essential oil',
    price: 19.99,
    category: 'essential-oils' as ProductCategory,
    image_url: '/images/lavender.jpg',
    stock_quantity: 30,
    volume_ml: 50,
    is_active: true,
    benefits: ['Aromatherapy'],
    ingredients: ['Lavender'],
    dosage_instructions: 'Use as directed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display empty cart message when cart is empty', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Add some products to get started!')).toBeInTheDocument()
  })

  it('should display cart items correctly', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 1 },
      ],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 3,
      getTotalPrice: () => 45.97,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Check cart items are displayed
    expect(screen.getByText('Chamomile Tea')).toBeInTheDocument()
    expect(screen.getByText('Lavender Oil')).toBeInTheDocument()
    expect(screen.getByText('100ml')).toBeInTheDocument()
    expect(screen.getByText('50ml')).toBeInTheDocument()
  })

  it('should show correct item count badge', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 3 },
      ],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 5,
      getTotalPrice: () => 85.95,
    })

    render(<CartDrawer />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should not show badge when cart is empty', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
    })

    render(<CartDrawer />)

    // Badge should not be visible
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('should update quantity when + button is clicked', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct1, quantity: 2 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 2,
      getTotalPrice: () => 25.98,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Find the + button and click it
    const plusButtons = screen.getAllByRole('button')
    const plusButton = plusButtons.find((btn) => btn.querySelector('.lucide-plus'))
    fireEvent.click(plusButton!)

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3)
  })

  it('should update quantity when - button is clicked', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct1, quantity: 2 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 2,
      getTotalPrice: () => 25.98,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Find the - button and click it
    const minusButtons = screen.getAllByRole('button')
    const minusButton = minusButtons.find((btn) => btn.querySelector('.lucide-minus'))
    fireEvent.click(minusButton!)

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1)
  })

  it('should disable + button when quantity reaches stock limit', () => {
    const lowStockProduct = {
      ...mockProduct1,
      stock_quantity: 5,
    }

    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: lowStockProduct, quantity: 5 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 5,
      getTotalPrice: () => 64.95,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Find the + button
    const plusButtons = screen.getAllByRole('button')
    const plusButton = plusButtons.find((btn) => btn.querySelector('.lucide-plus'))

    expect(plusButton).toBeDisabled()
  })

  it('should call removeItem when remove button is clicked', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct1, quantity: 2 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 2,
      getTotalPrice: () => 25.98,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Click remove button
    const removeButton = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)

    expect(mockRemoveItem).toHaveBeenCalledWith('1')
  })

  it('should display correct subtotal for each item', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: mockProduct1, quantity: 3 }, // 3 × $12.99 = $38.97
        { product: mockProduct2, quantity: 2 }, // 2 × $19.99 = $39.98
      ],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 5,
      getTotalPrice: () => 78.95,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Check item subtotals
    expect(screen.getByText('$38.97')).toBeInTheDocument() // Chamomile Tea: 3 × $12.99
    expect(screen.getByText('$39.98')).toBeInTheDocument() // Lavender Oil: 2 × $19.99
  })

  it('should display correct total price', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 1 },
      ],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 3,
      getTotalPrice: () => 45.97,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    // Check total price
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('$45.97')).toBeInTheDocument()
  })

  it('should have "View Cart" link', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct1, quantity: 1 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 1,
      getTotalPrice: () => 12.99,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    const viewCartLink = screen.getByRole('link', { name: /view cart/i })
    expect(viewCartLink).toHaveAttribute('href', '/cart')
  })

  it('should have "Proceed to Checkout" button that links to checkout page', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct1, quantity: 1 }],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 1,
      getTotalPrice: () => 12.99,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    const checkoutLink = screen.getByRole('link', { name: /proceed to checkout/i })
    expect(checkoutLink).toHaveAttribute('href', '/checkout')
  })

  it('should not show footer buttons when cart is empty', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    expect(screen.queryByText('Total:')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /view cart/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /proceed to checkout/i })).not.toBeInTheDocument()
  })

  it('should show cart title with item count', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 3 },
      ],
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      getTotalItems: () => 5,
      getTotalPrice: () => 85.95,
    })

    render(<CartDrawer />)

    // Open the drawer
    const cartButton = screen.getByRole('button')
    fireEvent.click(cartButton)

    expect(screen.getByText('Shopping Cart (5 items)')).toBeInTheDocument()
  })
})
