import { useCartStore } from '../cart'
import { Product, ProductCategory } from '@/types'

// Mock product data
const mockProduct1: Product = {
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
}

const mockProduct2: Product = {
  id: '2',
  name: 'Lavender Oil',
  slug: 'lavender-oil',
  description: 'Essential oil for aromatherapy',
  price: 19.99,
  category: 'essential-oils' as ProductCategory,
  image_url: '/images/lavender.jpg',
  stock_quantity: 30,
  is_active: true,
  benefits: ['Aromatherapy', 'Relaxation'],
  ingredients: ['Lavender extract'],
  dosage_instructions: 'Use as directed',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('CartStore', () => {
  beforeEach(() => {
    // Clear the cart before each test
    const { clearCart } = useCartStore.getState()
    clearCart()
  })

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const { addItem, items } = useCartStore.getState()

      addItem(mockProduct1)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('1')
      expect(state.items[0].quantity).toBe(1)
    })

    it('should add item with specified quantity', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockProduct1, 3)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(3)
    })

    it('should increase quantity if item already exists', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockProduct1, 2)
      addItem(mockProduct1, 3)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(5)
    })

    it('should add multiple different items', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockProduct1, 2)
      addItem(mockProduct2, 1)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(2)
      expect(state.items[0].product.id).toBe('1')
      expect(state.items[1].product.id).toBe('2')
    })
  })

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const { addItem, removeItem } = useCartStore.getState()

      addItem(mockProduct1)
      addItem(mockProduct2)

      removeItem('1')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('2')
    })

    it('should do nothing if item does not exist', () => {
      const { addItem, removeItem } = useCartStore.getState()

      addItem(mockProduct1)
      removeItem('non-existent-id')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
    })

    it('should handle removing from empty cart', () => {
      const { removeItem } = useCartStore.getState()

      removeItem('1')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })
  })

  describe('updateQuantity', () => {
    it('should update quantity of existing item', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockProduct1, 2)
      updateQuantity('1', 5)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(5)
    })

    it('should remove item if quantity is set to 0', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockProduct1, 2)
      updateQuantity('1', 0)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('should remove item if quantity is negative', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockProduct1, 2)
      updateQuantity('1', -1)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('should do nothing if item does not exist', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockProduct1, 2)
      updateQuantity('non-existent-id', 5)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2) // Unchanged
    })
  })

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { addItem, clearCart } = useCartStore.getState()

      addItem(mockProduct1, 2)
      addItem(mockProduct2, 3)

      clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('should handle clearing empty cart', () => {
      const { clearCart } = useCartStore.getState()

      clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })
  })

  describe('getTotalItems', () => {
    it('should return 0 for empty cart', () => {
      const { getTotalItems } = useCartStore.getState()

      expect(getTotalItems()).toBe(0)
    })

    it('should return total quantity of all items', () => {
      const { addItem, getTotalItems } = useCartStore.getState()

      addItem(mockProduct1, 2)
      addItem(mockProduct2, 3)

      expect(getTotalItems()).toBe(5)
    })

    it('should update after adding items', () => {
      const { addItem, getTotalItems } = useCartStore.getState()

      addItem(mockProduct1, 1)
      expect(getTotalItems()).toBe(1)

      addItem(mockProduct2, 2)
      expect(getTotalItems()).toBe(3)
    })

    it('should update after removing items', () => {
      const { addItem, removeItem, getTotalItems } = useCartStore.getState()

      addItem(mockProduct1, 2)
      addItem(mockProduct2, 3)
      removeItem('1')

      expect(getTotalItems()).toBe(3)
    })
  })

  describe('getTotalPrice', () => {
    it('should return 0 for empty cart', () => {
      const { getTotalPrice } = useCartStore.getState()

      expect(getTotalPrice()).toBe(0)
    })

    it('should calculate total price correctly', () => {
      const { addItem, getTotalPrice } = useCartStore.getState()

      addItem(mockProduct1, 2) // 2 × $12.99 = $25.98
      addItem(mockProduct2, 1) // 1 × $19.99 = $19.99

      expect(getTotalPrice()).toBe(45.97)
    })

    it('should update after quantity changes', () => {
      const { addItem, updateQuantity, getTotalPrice } = useCartStore.getState()

      addItem(mockProduct1, 2) // 2 × $12.99 = $25.98
      expect(getTotalPrice()).toBe(25.98)

      updateQuantity('1', 5) // 5 × $12.99 = $64.95
      expect(getTotalPrice()).toBe(64.95)
    })

    it('should update after removing items', () => {
      const { addItem, removeItem, getTotalPrice } = useCartStore.getState()

      addItem(mockProduct1, 2) // 2 × $12.99 = $25.98
      addItem(mockProduct2, 1) // 1 × $19.99 = $19.99
      removeItem('1')

      expect(getTotalPrice()).toBe(19.99)
    })
  })

  describe('getItemQuantity', () => {
    it('should return 0 if item not in cart', () => {
      const { getItemQuantity } = useCartStore.getState()

      expect(getItemQuantity('non-existent-id')).toBe(0)
    })

    it('should return correct quantity for existing item', () => {
      const { addItem, getItemQuantity } = useCartStore.getState()

      addItem(mockProduct1, 3)

      expect(getItemQuantity('1')).toBe(3)
    })

    it('should return 0 after item is removed', () => {
      const { addItem, removeItem, getItemQuantity } = useCartStore.getState()

      addItem(mockProduct1, 3)
      removeItem('1')

      expect(getItemQuantity('1')).toBe(0)
    })

    it('should update when quantity changes', () => {
      const { addItem, updateQuantity, getItemQuantity } = useCartStore.getState()

      addItem(mockProduct1, 2)
      expect(getItemQuantity('1')).toBe(2)

      updateQuantity('1', 7)
      expect(getItemQuantity('1')).toBe(7)
    })
  })

  describe('Complex scenarios', () => {
    it('should handle adding, updating, and removing multiple items', () => {
      const { addItem, updateQuantity, removeItem, getTotalItems, getTotalPrice } =
        useCartStore.getState()

      // Add items
      addItem(mockProduct1, 2)
      addItem(mockProduct2, 3)
      expect(getTotalItems()).toBe(5)

      // Update quantity
      updateQuantity('1', 5)
      expect(getTotalItems()).toBe(8)

      // Remove one item
      removeItem('2')
      expect(getTotalItems()).toBe(5)
      expect(getTotalPrice()).toBe(64.95) // 5 × $12.99
    })

    it('should handle adding same item multiple times in sequence', () => {
      const { addItem, getItemQuantity } = useCartStore.getState()

      addItem(mockProduct1, 1)
      addItem(mockProduct1, 2)
      addItem(mockProduct1, 3)

      expect(getItemQuantity('1')).toBe(6)
    })

    it('should correctly handle decimal prices', () => {
      const { addItem, getTotalPrice } = useCartStore.getState()

      addItem(mockProduct1, 3) // 3 × $12.99 = $38.97

      // Check for floating point precision
      expect(getTotalPrice()).toBeCloseTo(38.97, 2)
    })
  })
})
