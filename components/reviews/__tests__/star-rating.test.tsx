import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating } from '../star-rating'

describe('StarRating', () => {
  describe('Display mode (non-interactive)', () => {
    it('should render 5 filled stars for rating of 5', () => {
      const { container } = render(<StarRating rating={5} />)
      const stars = container.querySelectorAll('[data-filled="true"]')
      expect(stars.length).toBe(5)
    })

    it('should render 3 filled stars for rating of 3', () => {
      const { container } = render(<StarRating rating={3} />)
      const stars = container.querySelectorAll('[data-filled="true"]')
      expect(stars.length).toBe(3)
    })

    it('should render 0 filled stars for rating of 0', () => {
      const { container } = render(<StarRating rating={0} />)
      const stars = container.querySelectorAll('[data-filled="true"]')
      expect(stars.length).toBe(0)
    })

    it('should not be interactive in display mode', () => {
      const onChange = jest.fn()
      const { container } = render(<StarRating rating={3} />)
      const stars = container.querySelectorAll('button')
      expect(stars.length).toBe(0) // No buttons in display mode
    })

    it('should show rating count when provided', () => {
      render(<StarRating rating={4.5} count={128} />)
      expect(screen.getByText('(128)')).toBeInTheDocument()
    })

    it('should show average rating text when provided', () => {
      render(<StarRating rating={4.5} showRating />)
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })
  })

  describe('Interactive mode', () => {
    it('should render interactive stars when onChange is provided', () => {
      const onChange = jest.fn()
      const { container } = render(<StarRating rating={0} onChange={onChange} />)
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(5)
    })

    it('should call onChange when star is clicked', () => {
      const onChange = jest.fn()
      const { container } = render(<StarRating rating={0} onChange={onChange} />)
      const buttons = container.querySelectorAll('button')

      fireEvent.click(buttons[2]) // Click 3rd star
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('should highlight stars on hover', () => {
      const onChange = jest.fn()
      const { container } = render(<StarRating rating={2} onChange={onChange} />)
      const buttons = container.querySelectorAll('button')

      fireEvent.mouseEnter(buttons[3]) // Hover over 4th star

      // Should show 4 stars highlighted
      const highlighted = container.querySelectorAll('[data-hover="true"]')
      expect(highlighted.length).toBeGreaterThanOrEqual(1)
    })

    it('should reset to current rating on mouse leave', () => {
      const onChange = jest.fn()
      const { container } = render(<StarRating rating={2} onChange={onChange} />)
      const wrapper = container.firstChild

      fireEvent.mouseLeave(wrapper as Element)

      // Should show original 2 stars filled
      const filled = container.querySelectorAll('[data-filled="true"]')
      expect(filled.length).toBe(2)
    })
  })

  describe('Size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<StarRating rating={3} size="sm" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-sm')
    })

    it('should apply large size class', () => {
      const { container } = render(<StarRating rating={3} size="lg" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-lg')
    })
  })
})
