'use client'

import { Review } from '@/types'
import { ReviewCard } from './review-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface ReviewListProps {
  reviews: Review[]
  isLoading?: boolean
  totalCount?: number
  hasMore?: boolean
  currentUserId?: string
  onSortChange?: (sortBy: 'recent' | 'helpful' | 'rating') => void
  onLoadMore?: () => void
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void
  onEditReview?: (review: Review) => void
  onDeleteReview?: (reviewId: string) => void
}

export function ReviewList({
  reviews,
  isLoading = false,
  totalCount,
  hasMore = false,
  currentUserId,
  onSortChange,
  onLoadMore,
  onVoteHelpful,
  onEditReview,
  onDeleteReview,
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No reviews yet</p>
        <p className="text-gray-400 text-sm mt-2">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with sort */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {totalCount !== undefined ? (
            <span>
              Showing {reviews.length} of {totalCount} reviews
            </span>
          ) : (
            <span>{reviews.length} reviews</span>
          )}
        </div>

        {onSortChange && (
          <Select onValueChange={(value) => onSortChange(value as any)} defaultValue="recent">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Review list */}
      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isCurrentUser={currentUserId === review.user_id}
            onVoteHelpful={onVoteHelpful}
            onEdit={onEditReview}
            onDelete={onDeleteReview}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" onClick={onLoadMore}>
            Load more reviews
          </Button>
        </div>
      )}
    </div>
  )
}
