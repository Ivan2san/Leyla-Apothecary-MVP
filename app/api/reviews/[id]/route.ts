import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'
import { updateReviewSchema } from '@/lib/validations/reviews'
import { ZodError } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/reviews/[id]
 * Update a review (user can only update their own reviews)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const body = await request.json()

    // Validate input with Zod
    const validatedData = updateReviewSchema.parse(body)

    // Update review (service layer enforces ownership)
    const review = await ReviewService.updateReview(
      reviewId,
      user.id,
      validatedData
    )

    return NextResponse.json({ review })
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Review update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a review (user can only delete their own reviews)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id

    // Delete review (service layer enforces ownership)
    await ReviewService.deleteReview(reviewId, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Review deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    )
  }
}
