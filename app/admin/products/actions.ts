'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import {
  adminProductCreateSchema,
  adminProductUpdateSchema,
} from '@/lib/validations/products'

export type ProductActionState = {
  status: 'success' | 'error' | null
  message?: string
}

export const productActionInitialState: ProductActionState = {
  status: null,
}

function mapFormData(formData: FormData) {
  const get = (key: string) => formData.get(key)?.toString()?.trim() ?? ''

  const name = get('name')
  const slugValue = get('slug') || name

  return {
    name,
    slug: slugValue,
    description: get('description'),
    dosage_instructions: get('dosage_instructions'),
    category: get('category'),
    price: get('price'),
    volume_ml: get('volume_ml'),
    stock_quantity: get('stock_quantity'),
    is_active: get('is_active') || 'true',
    benefits: get('benefits'),
    ingredients: get('ingredients'),
    contraindications: get('contraindications'),
  }
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const payload = mapFormData(formData)
  const parsed = adminProductCreateSchema.safeParse(payload)

  if (!parsed.success) {
    return { status: 'error', message: 'Please double-check the product details.' }
  }

  const { error } = await client.from('products').insert(parsed.data)

  if (error) {
    console.error('Admin product create error:', error)
    return { status: 'error', message: 'Failed to create product' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/products')
  return { status: 'success', message: 'Product created' }
}

export async function updateProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const payload = mapFormData(formData)
  const id = formData.get('id')?.toString()

  const parsed = adminProductUpdateSchema.safeParse({
    ...payload,
    id,
  })

  if (!parsed.success || !parsed.data.id) {
    return { status: 'error', message: 'Invalid product data' }
  }

  const { id: productId, ...updateData } = parsed.data

  const { error } = await client.from('products').update(updateData).eq('id', productId)

  if (error) {
    console.error('Admin product update error:', error)
    return { status: 'error', message: 'Failed to update product' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/products')
  return { status: 'success', message: 'Product updated' }
}
