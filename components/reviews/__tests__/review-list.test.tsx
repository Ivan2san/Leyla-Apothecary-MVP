import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewList } from '../review-list'
import { Review } from '@/types'

const mockReviews: Review[] = [
  {
    id: 'review-1',
    product_id: 'product-123',
    user_id: 'user-1',
    user_name: 'Alice Smith',
    rating: 5,
    title: 'Excellent!',
    comment: 'Loved this product!',
    verified_purchase: true,
    helpful_count: 15,
    is_approved: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'review-2',
    product_id: 'product-123',
    user_id: 'user-2',
    user_name: 'Bob Johnson',
    rating: 4,
    title: 'Very good',
    comment: 'Great product overall.',
    verified_purchase: false,
    helpful_count: 8,
    is_approved: true,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
  },
  {
    id: 'review-3',
    product_id: 'product-123',
    user_id: 'user-3',
    user_name: 'Carol White',
    rating: 3,
    title: 'Decent',
    comment: 'It works but could be better.',
    verified_purchase: true,
    helpful_count: 3,
    is_approved: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
]

describe('ReviewList', () => {
  it('should render all reviews', () => {
    render(<ReviewList reviews={mockReviews} />)

    expect(screen.getByText('Excellent!')).toBeInTheDocument()
    expect(screen.getByText('Very good')).toBeInTheDocument()
    expect(screen.getByText('Decent')).toBeInTheDocument()
  })

  it('should show empty state when no reviews', () => {
    render(<ReviewList reviews={[]} />)

    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument()
  })

  it('should show sort select dropdown when onSortChange is provided', () => {
    render(<ReviewList reviews={mockReviews} onSortChange={jest.fn()} />)

    // Check for the select trigger
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should not show sort select when onSortChange is not provided', () => {
    render(<ReviewList reviews={mockReviews} />)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<ReviewList reviews={[]} isLoading={true} />)

    expect(screen.getByText(/Loading reviews/i)).toBeInTheDocument()
  })

  it('should show review count', () => {
    render(<ReviewList reviews={mockReviews} totalCount={25} />)

    expect(screen.getByText(/Showing 3 of 25 reviews/i)).toBeInTheDocument()
  })

  it('should show load more button when there are more reviews', () => {
    render(<ReviewList reviews={mockReviews} hasMore={true} onLoadMore={jest.fn()} />)

    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('should call onLoadMore when load more button is clicked', () => {
    const onLoadMore = jest.fn()
    render(<ReviewList reviews={mockReviews} hasMore={true} onLoadMore={onLoadMore} />)

    const loadMoreButton = screen.getByRole('button', { name: /load more/i })
    fireEvent.click(loadMoreButton)

    expect(onLoadMore).toHaveBeenCalled()
  })

  it('should not show load more button when no more reviews', () => {
    render(<ReviewList reviews={mockReviews} hasMore={false} onLoadMore={jest.fn()} />)

    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })
})
