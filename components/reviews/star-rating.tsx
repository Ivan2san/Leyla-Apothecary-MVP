'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  count?: number
  showRating?: boolean
  size?: 'sm' | 'md' | 'lg'
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  count,
  showRating,
  size = 'md',
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const isInteractive = !!onChange

  const displayRating = hoverRating ?? rating
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const handleClick = (value: number) => {
    if (onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (isInteractive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(null)
    }
  }

  return (
    <div
      className={cn('flex items-center gap-1', sizeClasses[size], className)}
      onMouseLeave={handleMouseLeave}
    >
      {stars.map((star) => {
        const isFilled = star <= Math.floor(displayRating)
        const isHovered = hoverRating !== null && star <= hoverRating

        if (isInteractive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              className={cn(
                'transition-colors',
                isFilled || isHovered ? 'text-yellow-400' : 'text-gray-300',
                'hover:text-yellow-400'
              )}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'w-5 h-5',
                  size === 'sm' && 'w-4 h-4',
                  size === 'lg' && 'w-6 h-6'
                )}
                fill={isFilled || isHovered ? 'currentColor' : 'none'}
                data-filled={isFilled}
                data-hover={isHovered}
              />
            </button>
          )
        }

        // Display mode (non-interactive)
        return (
          <Star
            key={star}
            className={cn(
              'w-5 h-5',
              size === 'sm' && 'w-4 h-4',
              size === 'lg' && 'w-6 h-6',
              isFilled ? 'text-yellow-400' : 'text-gray-300'
            )}
            fill={isFilled ? 'currentColor' : 'none'}
            data-filled={isFilled}
          />
        )
      })}

      {showRating && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="ml-1 text-sm text-gray-500">({count})</span>
      )}
    </div>
  )
}
