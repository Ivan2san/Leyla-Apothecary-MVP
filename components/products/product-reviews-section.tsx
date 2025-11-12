'use client'

import { useState, useEffect, useCallback } from 'react'
import { Review } from '@/types'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { StarRating } from '@/components/reviews/star-rating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface ProductReviewsSectionProps {
  productId: string
  initialReviews?: Review[]
}

export function ProductReviewsSection({ productId, initialReviews = [] }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = createClient()
  const limit = 10

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  // Fetch reviews
  const fetchReviews = useCallback(async (loadMore = false) => {
    setIsLoading(true)
    try {
      const currentOffset = loadMore ? offset + limit : 0
      const params = new URLSearchParams({
        sortBy,
        limit: limit.toString(),
        offset: currentOffset.toString(),
      })

      const response = await fetch(`/api/products/${productId}/reviews?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')

      const data = await response.json()

      setReviews((prevReviews) => {
        if (loadMore) {
          return [...prevReviews, ...data.reviews]
        } else {
          return data.reviews
        }
      })

      setAverageRating(data.averageRating || 0)
      setTotalCount(data.totalCount || 0)
      setHasMore(data.reviews.length === limit)
      setOffset(currentOffset)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [productId, sortBy, limit, offset])

  // Fetch reviews on mount and when sortBy changes
  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  async function handleSubmitReview(data: { rating: number; title: string; comment: string }) {
    if (!currentUserId) {
      alert('Please sign in to leave a review')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingReview
        ? `/api/reviews/${editingReview.id}`
        : `/api/products/${productId}/reviews`

      const method = editingReview ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit review')

      // Refresh reviews
      await fetchReviews()
      setShowReviewForm(false)
      setEditingReview(null)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVoteHelpful(reviewId: string, isHelpful: boolean) {
    if (!currentUserId) {
      alert('Please sign in to vote')
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_helpful: isHelpful }),
      })

      if (!response.ok) throw new Error('Failed to vote')

      // Refresh reviews to show updated vote counts
      await fetchReviews()
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to record vote. Please try again.')
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete review')

      // Refresh reviews
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review. Please try again.')
    }
  }

  function handleEditReview(review: Review) {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  function handleCancelReview() {
    setShowReviewForm(false)
    setEditingReview(null)
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <StarRating rating={averageRating} count={totalCount} showRating size="lg" />
          </div>

          {currentUserId && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="mt-4"
            >
              Write a Review
            </Button>
          )}

          {!currentUserId && (
            <p className="mt-4 text-sm text-muted-foreground">
              Please sign in to write a review
            </p>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReview ? 'Edit Review' : 'Write a Review'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              initialData={editingReview || undefined}
              onSubmit={handleSubmitReview}
              onCancel={handleCancelReview}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        totalCount={totalCount}
        hasMore={hasMore}
        currentUserId={currentUserId || undefined}
        onSortChange={setSortBy}
        onLoadMore={() => fetchReviews(true)}
        onVoteHelpful={handleVoteHelpful}
        onEditReview={handleEditReview}
        onDeleteReview={handleDeleteReview}
      />
    </div>
  )
}
