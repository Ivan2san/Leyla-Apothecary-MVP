import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type MediaLibraryAsset = {
  name: string
  path: string
  size: number
  updatedAt?: string
  signedUrl?: string
}

const BUCKET = 'product-images'
const MAX_ITEMS = 200

export async function listMediaLibraryAssets(prefix = ''): Promise<MediaLibraryAsset[]> {
  const client = createServiceRoleClient()
  const assets: MediaLibraryAsset[] = []

  async function walk(path: string) {
    const { data, error } = await client.storage.from(BUCKET).list(path, {
      limit: MAX_ITEMS,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.error('[visual-system] list storage error', error)
      return
    }

    for (const entry of data ?? []) {
      const isFolder = !entry.id && !entry.metadata?.size
      const entryPath = path ? `${path}/${entry.name}` : entry.name

      if (isFolder) {
        await walk(entryPath)
      } else {
        const { data: signed } = await client.storage
          .from(BUCKET)
          .createSignedUrl(entryPath, 60 * 60)

        assets.push({
          name: entry.name,
          path: entryPath,
          size: Number(entry.metadata?.size ?? 0),
          updatedAt: entry.updated_at ?? entry.created_at ?? undefined,
          signedUrl: signed?.signedUrl,
        })
      }
    }
  }

  await walk(prefix)
  return assets
}
