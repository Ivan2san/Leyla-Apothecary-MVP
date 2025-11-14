'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { IMAGE_INVENTORY } from '@/lib/visual/inventory'

export type ProductImageryState = {
  status: 'idle' | 'pending' | 'success' | 'error'
  message?: string
}

export const productImageryInitialState: ProductImageryState = {
  status: 'idle',
}

export async function updateProductImagesAction(
  _prevState: ProductImageryState,
  formData: FormData
): Promise<ProductImageryState> {
  await requireAdmin()
  const productId = formData.get('productId')?.toString()
  const primaryId = formData.get('primaryImageId')?.toString()
  const lifestyleId = formData.get('lifestyleImageId')?.toString()

  if (!productId) {
    return { status: 'error', message: 'Product ID missing.' }
  }

  const client = createServiceRoleClient()

  const { data, error } = await client
    .from('products')
    .select('images')
    .eq('id', productId)
    .single()

  if (error) {
    console.error('[visual-system] fetch product images error', error)
    return { status: 'error', message: 'Unable to load product images.' }
  }

  const existingImages: any[] = Array.isArray(data?.images) ? data!.images : []
  const filtered = existingImages.filter(
    (img) => img.type !== 'primary' && img.type !== 'lifestyle'
  )

  function buildImagePayload(imageId: string | undefined, type: 'primary' | 'lifestyle') {
    if (!imageId) return null
    const entry = IMAGE_INVENTORY.find((item) => item.id === imageId)
    if (!entry) return null
    const url = entry.publicUrl ?? `/images/products/${entry.subcategory}/${entry.filename}`
    return {
      id: crypto.randomUUID(),
      url,
      alt: entry.filename.replace(/_/g, ' '),
      type,
      position: type === 'primary' ? 0 : 1,
      created_at: new Date().toISOString(),
    }
  }

  const primaryPayload = buildImagePayload(primaryId, 'primary')
  const lifestylePayload = buildImagePayload(lifestyleId, 'lifestyle')

  const nextImages = [
    ...filtered,
    ...(primaryPayload ? [primaryPayload] : []),
    ...(lifestylePayload ? [lifestylePayload] : []),
  ]

  const { error: updateError } = await client
    .from('products')
    .update({ images: nextImages })
    .eq('id', productId)

  if (updateError) {
    console.error('[visual-system] update product images error', updateError)
    return { status: 'error', message: 'Failed to update imagery.' }
  }

  revalidatePath('/admin/visual-system')
  revalidatePath('/admin/products')
  revalidatePath('/products')

  return { status: 'success', message: 'Imagery updated.' }
}
