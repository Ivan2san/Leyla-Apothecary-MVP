import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { HERO_ASSIGNMENTS, RECOMMENDED_ASSETS } from '@/lib/visual/inventory'
import type { BrandOverlayVariant } from '@/lib/visual/overlay-variants'

export type HeroAssignmentRecord = {
  id: string
  page: string
  route: string
  description: string
  assetId: string
  mobileAssetId?: string | null
  overlay: BrandOverlayVariant
}

export type HeroAssignmentWithAsset = HeroAssignmentRecord & {
  asset?: (typeof RECOMMENDED_ASSETS)[number]
  mobileAsset?: (typeof RECOMMENDED_ASSETS)[number]
}

const HERO_ASSET_MAP = Object.fromEntries(RECOMMENDED_ASSETS.map((asset) => [asset.id, asset]))
const CONFIG_BUCKET = 'visual-config'
const HERO_CONFIG_PATH = 'hero-assignments.json'

async function loadStoredAssignments(): Promise<HeroAssignmentRecord[] | null> {
  try {
    const client = createServiceRoleClient()
    const { data, error } = await client.storage.from(CONFIG_BUCKET).download(HERO_CONFIG_PATH)
    if (error || !data) {
      return null
    }
    const text = await data.text()
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.map((row) => ({
      id: row.id,
      page: row.page,
      route: row.route,
      description: row.description ?? '',
      assetId: row.assetId ?? row.asset_id,
      mobileAssetId: row.mobileAssetId ?? row.mobile_asset_id ?? null,
      overlay: (row.overlay as BrandOverlayVariant) ?? 'sage-gradient',
    }))
  } catch (error) {
    console.error('[hero-config] failed to load hero assignments', error)
    return null
  }
}

export async function saveHeroAssignmentRecords(records: HeroAssignmentRecord[]): Promise<void> {
  const client = createServiceRoleClient()
  const payload = Buffer.from(JSON.stringify(records, null, 2), 'utf-8')
  const { error } = await client.storage
    .from(CONFIG_BUCKET)
    .upload(HERO_CONFIG_PATH, payload, { upsert: true, contentType: 'application/json' })

  if (error) {
    console.error('[hero-config] failed to save hero assignments', error)
    throw error
  }
}

export async function loadHeroAssignmentRecords(): Promise<HeroAssignmentRecord[]> {
  const stored = await loadStoredAssignments()
  if (stored) {
    return stored
  }

  return HERO_ASSIGNMENTS.map((assignment) => ({
    id: assignment.id,
    page: assignment.page,
    route: assignment.route,
    description: assignment.description,
    assetId: assignment.assetId,
    mobileAssetId: assignment.mobileAssetId ?? null,
    overlay: assignment.overlay ?? HERO_ASSET_MAP[assignment.assetId]?.overlay ?? 'sage-gradient',
  }))
}

export async function getHeroAssignments(): Promise<HeroAssignmentWithAsset[]> {
  const assignments = await loadHeroAssignmentRecords()
  return assignments.map((assignment) => ({
    ...assignment,
    asset: HERO_ASSET_MAP[assignment.assetId],
    mobileAsset: assignment.mobileAssetId ? HERO_ASSET_MAP[assignment.mobileAssetId] : undefined,
  }))
}

export async function getHeroAsset(id: string) {
  const assignments = await getHeroAssignments()
  const assignment = assignments.find((entry) => entry.id === id)
  if (!assignment || !assignment.asset) {
    return {
      overlay: 'sage-gradient' as BrandOverlayVariant,
      desktopSrc: HERO_ASSET_MAP['hero-home-spring']?.desktopSrc,
      mobileSrc: HERO_ASSET_MAP['hero-home-spring']?.mobileSrc,
    }
  }

  return {
    overlay: assignment.overlay,
    desktopSrc: assignment.asset.desktopSrc,
    mobileSrc: assignment.mobileAsset?.desktopSrc ?? assignment.asset.mobileSrc,
    assetTitle: assignment.asset.title,
  }
}
