'use client'

import { useState, useEffect } from 'react'
import { StarRating } from './star-rating'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Review } from '@/types'
import { Loader2 } from 'lucide-react'

interface ReviewFormData {
  rating: number
  title: string
  comment: string
}

interface ReviewFormProps {
  initialData?: Review
  isSubmitting?: boolean
  onSubmit: (data: ReviewFormData) => void
  onCancel?: () => void
}

export function ReviewForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0)
  const [title, setTitle] = useState(initialData?.title || '')
  const [comment, setComment] = useState(initialData?.comment || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating)
      setTitle(initialData.title)
      setComment(initialData.comment)
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = 'Rating is required'
    }

    if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be at most 100 characters'
    }

    if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters'
    } else if (comment.trim().length > 1000) {
      newErrors.comment = 'Comment must be at most 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div>
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
        {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your review in a few words"
          maxLength={100}
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{errors.title || 'Minimum 5 characters'}</span>
          <span>{title.length}/100</span>
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review *</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here. Share your experience with this product..."
          rows={6}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{errors.comment || 'Minimum 10 characters'}</span>
          <span>{comment.length}/1000</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : initialData ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  )
}
