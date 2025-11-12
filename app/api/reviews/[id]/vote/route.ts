import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'
import { voteSchema } from '@/lib/validations/reviews'
import { ZodError } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/reviews/[id]/vote
 * Vote on whether a review was helpful (authenticated users only)
 */
export async function POST(
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
    const validatedData = voteSchema.parse(body)

    // Record vote (creates new or updates existing)
    const vote = await ReviewService.voteHelpful(
      reviewId,
      user.id,
      validatedData.is_helpful
    )

    return NextResponse.json({ vote }, { status: 201 })
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Vote recording error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record vote' },
      { status: 500 }
    )
  }
}
