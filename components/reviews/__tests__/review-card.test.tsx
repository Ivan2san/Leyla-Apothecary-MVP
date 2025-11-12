import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewCard } from '../review-card'
import { Review } from '@/types'

const mockReview: Review = {
  id: 'review-123',
  product_id: 'product-123',
  user_id: 'user-123',
  user_name: 'John Doe',
  rating: 5,
  title: 'Excellent product!',
  comment: 'This product exceeded my expectations. Highly recommended!',
  verified_purchase: true,
  helpful_count: 10,
  is_approved: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
}

describe('ReviewCard', () => {
  it('should render review with all details', () => {
    render(<ReviewCard review={mockReview} />)

    expect(screen.getByText('Excellent product!')).toBeInTheDocument()
    expect(screen.getByText(/exceeded my expectations/)).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should show verified purchase badge', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText(/Verified Purchase/i)).toBeInTheDocument()
  })

  it('should not show verified purchase badge when not verified', () => {
    const unverifiedReview = { ...mockReview, verified_purchase: false }
    render(<ReviewCard review={unverifiedReview} />)
    expect(screen.queryByText(/Verified Purchase/i)).not.toBeInTheDocument()
  })

  it('should display helpful count', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('should show formatted date', () => {
    render(<ReviewCard review={mockReview} />)
    // Should show "Jan 15, 2024" or similar
    expect(screen.getByText(/Jan.*15.*2024/i)).toBeInTheDocument()
  })

  it('should call onVoteHelpful when helpful button is clicked', () => {
    const onVoteHelpful = jest.fn()
    render(<ReviewCard review={mockReview} onVoteHelpful={onVoteHelpful} />)

    const helpfulButton = screen.getByRole('button', { name: /^helpful$/i })
    fireEvent.click(helpfulButton)

    expect(onVoteHelpful).toHaveBeenCalledWith(mockReview.id, true)
  })

  it('should call onVoteHelpful with false for not helpful button', () => {
    const onVoteHelpful = jest.fn()
    render(<ReviewCard review={mockReview} onVoteHelpful={onVoteHelpful} />)

    const notHelpfulButton = screen.getByRole('button', { name: /not helpful/i })
    fireEvent.click(notHelpfulButton)

    expect(onVoteHelpful).toHaveBeenCalledWith(mockReview.id, false)
  })

  it('should not show vote buttons when onVoteHelpful is not provided', () => {
    render(<ReviewCard review={mockReview} />)

    expect(screen.queryByRole('button', { name: /^helpful$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /not helpful/i })).not.toBeInTheDocument()
  })

  it('should show edit and delete buttons for current user review', () => {
    render(
      <ReviewCard
        review={mockReview}
        isCurrentUser={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<ReviewCard review={mockReview} isCurrentUser={true} onEdit={onEdit} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockReview)
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn()
    render(<ReviewCard review={mockReview} isCurrentUser={true} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockReview.id)
  })
})
