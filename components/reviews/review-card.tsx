'use client'

import { Review } from '@/types'
import { StarRating } from './star-rating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Edit, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  review: Review
  isCurrentUser?: boolean
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  className?: string
}

export function ReviewCard({
  review,
  isCurrentUser = false,
  onVoteHelpful,
  onEdit,
  onDelete,
  className,
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className={cn('border-b border-gray-200 py-6 last:border-0', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="sm" />
            {review.verified_purchase && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <h4 className="font-semibold text-gray-900">{review.title}</h4>
        </div>

        {/* Edit/Delete buttons for current user */}
        {isCurrentUser && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Review text */}
      <p className="text-gray-700 mb-3">{review.comment}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <span>
            By <span className="font-medium">{review.user_name || 'Anonymous'}</span>
          </span>
          <span>•</span>
          <span>{formatDate(review.created_at)}</span>
        </div>

        {/* Helpful votes */}
        {onVoteHelpful ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">
              {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found
              this helpful
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVoteHelpful(review.id, true)}
              className="h-8"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Helpful
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVoteHelpful(review.id, false)}
              className="h-8"
            >
              <ThumbsDown className="w-3 h-3 mr-1" />
              Not helpful
            </Button>
          </div>
        ) : (
          <span className="text-gray-600 text-sm">
            {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this
            helpful
          </span>
        )}
      </div>
    </div>
  )
}
