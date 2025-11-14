'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type MediaUploadState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export const mediaUploadInitialState: MediaUploadState = {
  status: 'idle',
}

const NAMING_REGEX =
  /^\d{4}-\d{2}-\d{2}_[a-z0-9-]+_[a-z0-9-]+_[a-z0-9-]+_[a-z0-9-]+_v\d+\.(webp|jpg|jpeg|png)$/i

export async function uploadMediaAssetAction(
  _prevState: MediaUploadState,
  formData: FormData
): Promise<MediaUploadState> {
  await requireAdmin()
  const file = formData.get('file')
  const folder = formData.get('folder')?.toString().trim().replace(/^\/*/, '').replace(/\s+/g, '-') ?? ''
  const filename = formData.get('filename')?.toString().trim() || (file instanceof File ? file.name : '')

  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: 'Please choose an image to upload.' }
  }

  if (!NAMING_REGEX.test(filename)) {
    return {
      status: 'error',
      message:
        'Filename must follow the convention YYYY-MM-DD_category_subcategory_description_variant_v1.webp',
    }
  }

  const arrayBuffer = await file.arrayBuffer()
  const client = createServiceRoleClient()
  const path = folder ? `${folder}/${filename}` : filename

  const { error } = await client.storage.from('product-images').upload(path, arrayBuffer, {
    upsert: true,
    contentType: file.type || 'image/webp',
  })

  if (error) {
    console.error('[visual-system] upload error', error)
    return { status: 'error', message: 'Upload failed. Please try again.' }
  }

  revalidatePath('/admin/visual-system')
  return { status: 'success', message: 'Image uploaded successfully.' }
}
