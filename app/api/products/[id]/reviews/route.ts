import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReviewService } from '@/lib/services/reviews'
import { createReviewSchema } from '@/lib/validations/reviews'
import { ZodError } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/products/[id]/reviews
 * Create a new review for a product (authenticated users only)
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

    const productId = params.id
    const body = await request.json()

    // Validate input with Zod
    const validatedData = createReviewSchema.parse({
      ...body,
      product_id: productId,
    })

    // Check if user has purchased this product
    const verifiedPurchase = await ReviewService.checkVerifiedPurchase(
      user.id,
      productId
    )

    // Create review with verified_purchase flag
    const review = await ReviewService.createReview({
      product_id: productId,
      user_id: user.id,
      rating: validatedData.rating,
      title: validatedData.title,
      comment: validatedData.comment,
      verified_purchase: verifiedPurchase,
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Handle duplicate review error
    if (error.message?.includes('already reviewed')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/products/[id]/reviews
 * Get all reviews for a product (public, no authentication required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'helpful' | 'rating') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get reviews
    const reviews = await ReviewService.getProductReviews(productId, {
      sortBy,
      limit,
      offset,
    })

    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get reviews' },
      { status: 500 }
    )
  }
}
