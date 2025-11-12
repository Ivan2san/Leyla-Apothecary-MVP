import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ImageService } from '@/lib/services/images'
import { ProductImageType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/products/[id]/images
 * Upload a new image for a product (admin only)
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

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const productId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate image
    const validation = ImageService.validateImage(file)
    if (!validation.valid) {
      // Return 413 for file size errors, 400 for others
      const status = validation.error?.includes('File size exceeds') ? 413 : 400
      return NextResponse.json({ error: validation.error }, { status })
    }

    // Get optional metadata
    const alt = (formData.get('alt') as string) || 'Product image'
    const type = (formData.get('type') as ProductImageType) || 'primary'

    // Upload to storage
    const storagePath = await ImageService.uploadImage(file, productId)
    const publicUrl = await ImageService.getPublicUrl(storagePath)

    // Create image metadata
    const imageMetadata = {
      id: uuidv4(),
      url: publicUrl,
      alt,
      type,
      position: 0, // Will be auto-adjusted by addImageToProduct
      created_at: new Date().toISOString(),
    }

    // Add to product
    await ImageService.addImageToProduct(productId, imageMetadata)

    return NextResponse.json({ image: imageMetadata }, { status: 201 })
  } catch (error: any) {
    console.error('Image upload error:', error)

    // Handle specific errors
    if (error.message?.includes('Maximum')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]/images/[imageId]
 * Delete an image from a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id: productId, imageId } = params

    // Remove image
    await ImageService.removeImageFromProduct(productId, imageId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Image deletion error:', error)

    // Handle specific errors
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    )
  }
}
