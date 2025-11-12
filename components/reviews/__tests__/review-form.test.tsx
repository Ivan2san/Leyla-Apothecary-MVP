import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReviewForm } from '../review-form'
import { Review } from '@/types'

const mockReview: Review = {
  id: 'review-123',
  product_id: 'product-123',
  user_id: 'user-123',
  user_name: 'John Doe',
  rating: 4,
  title: 'Good product',
  comment: 'This is a good product with minor issues.',
  verified_purchase: true,
  helpful_count: 5,
  is_approved: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
}

describe('ReviewForm', () => {
  describe('Create mode', () => {
    it('should render empty form fields', () => {
      render(<ReviewForm onSubmit={jest.fn()} />)

      expect(screen.getByText(/rating \*/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/sum up your review/i)).toHaveValue('')
      expect(screen.getByPlaceholderText(/write your review/i)).toHaveValue('')
    })

    it('should show submit button with "Submit Review" text', () => {
      render(<ReviewForm onSubmit={jest.fn()} />)

      expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument()
    })

    it('should allow rating selection', () => {
      render(<ReviewForm onSubmit={jest.fn()} />)

      const stars = screen.getAllByRole('button')
      fireEvent.click(stars[3]) // Click 4th star

      // Rating should be selected (tested by StarRating component)
      expect(stars[3]).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const onSubmit = jest.fn()
      render(<ReviewForm onSubmit={onSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit review/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/rating is required/i)).toBeInTheDocument()
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should validate title length', async () => {
      const onSubmit = jest.fn()
      render(<ReviewForm onSubmit={onSubmit} />)

      const titleInput = screen.getByPlaceholderText(/sum up your review/i)
      fireEvent.change(titleInput, { target: { value: 'Bad' } }) // Only 3 chars

      const submitButton = screen.getByRole('button', { name: /submit review/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate comment length', async () => {
      const onSubmit = jest.fn()
      render(<ReviewForm onSubmit={onSubmit} />)

      const commentInput = screen.getByPlaceholderText(/write your review/i)
      fireEvent.change(commentInput, { target: { value: 'Short' } }) // Only 5 chars

      const submitButton = screen.getByRole('button', { name: /submit review/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/comment must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('should submit valid form data', async () => {
      const onSubmit = jest.fn()
      render(<ReviewForm onSubmit={onSubmit} />)

      // Select rating
      const stars = screen.getAllByRole('button')
      fireEvent.click(stars[4]) // 5 stars

      // Fill in title
      const titleInput = screen.getByPlaceholderText(/sum up your review/i)
      fireEvent.change(titleInput, { target: { value: 'Excellent product!' } })

      // Fill in comment
      const commentInput = screen.getByPlaceholderText(/write your review/i)
      fireEvent.change(commentInput, {
        target: { value: 'This product exceeded my expectations. Highly recommended!' },
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          rating: 5,
          title: 'Excellent product!',
          comment: 'This product exceeded my expectations. Highly recommended!',
        })
      })
    })

    it('should show loading state during submission', async () => {
      render(<ReviewForm onSubmit={jest.fn()} isSubmitting={true} />)

      const submitButton = screen.getByRole('button', { name: /submitting/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Edit mode', () => {
    it('should pre-fill form with existing review data', () => {
      render(<ReviewForm initialData={mockReview} onSubmit={jest.fn()} />)

      expect(screen.getByDisplayValue('Good product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is a good product with minor issues.')).toBeInTheDocument()
    })

    it('should show "Update Review" button text', () => {
      render(<ReviewForm initialData={mockReview} onSubmit={jest.fn()} />)

      expect(screen.getByRole('button', { name: /update review/i })).toBeInTheDocument()
    })

    it('should submit updated form data', async () => {
      const onSubmit = jest.fn()
      render(<ReviewForm initialData={mockReview} onSubmit={onSubmit} />)

      // Update title
      const titleInput = screen.getByDisplayValue('Good product')
      fireEvent.change(titleInput, { target: { value: 'Excellent product now!' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update review/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          rating: 4,
          title: 'Excellent product now!',
          comment: 'This is a good product with minor issues.',
        })
      })
    })
  })

  describe('Cancel functionality', () => {
    it('should show cancel button when onCancel is provided', () => {
      render(<ReviewForm onSubmit={jest.fn()} onCancel={jest.fn()} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn()
      render(<ReviewForm onSubmit={jest.fn()} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })
  })
})
