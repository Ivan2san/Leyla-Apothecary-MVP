import { listMediaLibraryAssets } from "@/lib/storage/media-library"
import { MediaUploadForm } from "./media-upload-form"

function formatSize(bytes: number) {
  if (!bytes) return "0 KB"
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export async function MediaLibraryPanel() {
  const assets = await listMediaLibraryAssets()

  return (
    <div className="space-y-4">
      <MediaUploadForm />
      <div className="overflow-x-auto rounded-lg border border-sage/30 bg-white">
        <table className="min-w-full text-sm text-forest/80">
          <thead className="bg-sage/10 text-left text-forest/60">
            <tr>
              <th className="px-4 py-2 font-semibold">File</th>
              <th className="px-4 py-2 font-semibold">Path</th>
              <th className="px-4 py-2 font-semibold">Size</th>
              <th className="px-4 py-2 font-semibold">Updated</th>
              <th className="px-4 py-2 font-semibold">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/20">
            {assets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-forest/60">
                  No assets found in storage. Upload a MediHerb bottle shot to get started.
                </td>
              </tr>
            )}
            {assets.map((asset) => (
              <tr key={asset.path} className="bg-white">
                <td className="px-4 py-3 font-semibold text-forest">{asset.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{asset.path}</td>
                <td className="px-4 py-3">{formatSize(asset.size)}</td>
                <td className="px-4 py-3 text-xs text-forest/60">
                  {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {asset.signedUrl ? (
                    <a
                      href={asset.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-terracotta hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-forest/50">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
