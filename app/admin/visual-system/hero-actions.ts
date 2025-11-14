'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import type { BrandOverlayVariant } from '@/lib/visual/overlay-variants'
import { loadHeroAssignmentRecords, saveHeroAssignmentRecords } from '@/lib/visual/hero-config'

const OVERLAY_OPTIONS: BrandOverlayVariant[] = [
  'sage',
  'terracotta',
  'forest',
  'sage-gradient',
  'terracotta-gradient',
  'forest-gradient',
  'warm-gradient',
  'none',
]

export type HeroAssignmentState = {
  status: 'idle' | 'pending' | 'success' | 'error'
  message?: string
}

export const heroAssignmentInitialState: HeroAssignmentState = {
  status: 'idle',
}

export async function updateHeroAssignmentAction(
  _prevState: HeroAssignmentState,
  formData: FormData
): Promise<HeroAssignmentState> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  const assetId = formData.get('assetId')?.toString()
  const overlay = formData.get('overlay')?.toString() as BrandOverlayVariant | undefined
  const mobileAssetId = formData.get('mobileAssetId')?.toString() || null

  if (!id || !assetId || !overlay || !OVERLAY_OPTIONS.includes(overlay)) {
    return { status: 'error', message: 'Invalid hero assignment data.' }
  }

  const records = await loadHeroAssignmentRecords()
  const nextRecords = records.map((record) =>
    record.id === id
      ? {
          ...record,
          assetId,
          mobileAssetId,
          overlay,
        }
      : record
  )

  await saveHeroAssignmentRecords(nextRecords)

  revalidatePath('/admin/visual-system')
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/booking')

  return { status: 'success', message: 'Hero assignment updated.' }
}
