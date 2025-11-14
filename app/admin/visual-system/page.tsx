import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Image as ImageIcon, LayoutTemplate } from "lucide-react"
import { AssetTable } from "@/components/admin/visual-system/asset-table"
import { HeroAssignmentEditor } from "@/components/admin/visual-system/hero-assignment-editor"
import { MediaLibraryPanel } from "@/components/admin/visual-system/media-library-panel"
import { ProductImageryDrawer } from "@/components/admin/visual-system/product-imagery-drawer"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { IMAGE_DIMENSIONS } from "@/lib/visual/image-configs"
import { IMAGE_INVENTORY } from "@/lib/visual/inventory"
import type { ProductImageSummary } from "@/types/admin-visual"
import { getHeroAssignments } from "@/lib/visual/hero-config"
import { DOCUMENTS } from "@/lib/docs/document-service"
import { DocumentViewerPanel } from "@/components/admin/visual-system/document-viewer-panel"

export const metadata = {
  title: "Visual System | Leyla's Apothecary Admin",
  description: "Operational console for the hero + product image focus work.",
}

async function getProductImageSummary(): Promise<ProductImageSummary[]> {
  const client = createServiceRoleClient()

  const { data, error } = await client
    .from("products")
    .select("id,name,slug,category,image_url,images")
    .order("name", { ascending: true })

  if (error) {
    console.error("[visual-system] product imagery summary", error)
    return []
  }

  return (data ?? []).map((product) => {
    const imagesArray = Array.isArray(product.images) ? product.images : []
    const hasPrimary = imagesArray.some(
      (img: any) => img?.type === "primary" && typeof img.url === "string" && img.url.length > 0
    )
    const hasProtocol = imagesArray.some(
      (img: any) => img?.type === "protocol" && typeof img.url === "string" && img.url.length > 0
    )

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      hasPrimary,
      hasLifestyle: hasProtocol,
      fallbackOnly: !hasPrimary && Boolean(product.image_url),
      imageCount: imagesArray.length,
    }
  })
}

const simplificationDoc = DOCUMENTS.find((doc) => doc.id === "visual-simplification")

export default async function AdminVisualSystemPage() {
  const [productImageSummary, heroAssignments] = await Promise.all([
    getProductImageSummary(),
    getHeroAssignments(),
  ])

  const heroConfigured = heroAssignments.filter((assignment) => assignment.asset).length
  const heroCoverage = heroAssignments.length
    ? Math.round((heroConfigured / heroAssignments.length) * 100)
    : 0

  const skuReady = productImageSummary.filter((product) => product.hasPrimary).length
  const skuCoverage = productImageSummary.length
    ? Math.round((skuReady / productImageSummary.length) * 100)
    : 0

  const missingPrimary = productImageSummary.filter((product) => !product.hasPrimary)
  const needsProtocol = productImageSummary.filter((product) => !product.hasLifestyle)
  const fallbackOnly = productImageSummary.filter((product) => product.fallbackOnly)

  const inventoryStats = {
    total: IMAGE_INVENTORY.length,
    ready: IMAGE_INVENTORY.filter((item) => item.status === "ready").length,
    needsOptimization: IMAGE_INVENTORY.filter((item) => item.status === "needs-optimization").length,
    pendingLicense: IMAGE_INVENTORY.filter((item) => item.status === "pending-license").length,
  }

  return (
    <div className="space-y-8">
      <Card className="border-terracotta/40 bg-terracotta/5">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Visual Simplification Mode</CardTitle>
            <CardDescription>
              All effort is directed at hero imagery and product/protocol assets. Every other visual
              module is paused until these flows ship.
            </CardDescription>
          </div>
          {simplificationDoc && (
            <Button asChild variant="outline">
              <Link href={simplificationDoc.githubHref} target="_blank" rel="noopener noreferrer">
                View Plan
              </Link>
            </Button>
          )}
        </CardHeader>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hero Sections</CardTitle>
              <CardDescription>Upload, assign, and recolor hero imagery per section.</CardDescription>
            </div>
            <LayoutTemplate className="h-10 w-10 text-sage" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm text-forest/70">
            <div>
              <p className="text-3xl font-bold text-forest">{heroConfigured}</p>
              <p>Configured heroes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-forest">{heroCoverage}%</p>
              <p>Coverage</p>
            </div>
            <div>
              <p className="text-sm">
                Maintain desktop + mobile images per section. Only designer-approved palette tokens
                should be selectable for overlays.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product & Protocol Imagery</CardTitle>
              <CardDescription>Ensure every SKU has a bottle shot plus an optional protocol photo.</CardDescription>
            </div>
            <ImageIcon className="h-10 w-10 text-sage" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm text-forest/70">
            <div>
              <p className="text-3xl font-bold text-forest">{skuReady}</p>
              <p>SKUs ready</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-forest">{skuCoverage}%</p>
              <p>Coverage</p>
            </div>
            <div className="col-span-2 text-xs">
              {missingPrimary.length} SKUs missing primary bottle imagery · {needsProtocol.length} needs
              protocol/lifestyle shots · {fallbackOnly.length} relying on legacy `image_url`.
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="hero-images" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Hero Image Workflow</CardTitle>
              <CardDescription>
                Upload in Supabase, record assignments below, and use only the simplified palette
                variants.
              </CardDescription>
            </div>
            <Link
              href="#media-library"
              className="text-sm font-semibold text-terracotta hover:underline"
            >
              Jump to uploads
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-forest/70">
            <p className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-terracotta" />
              Remove references to paused modules (overlay lab, marketing galleries) until phase 2.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Store assets in the `visual-config` + `product-images` Supabase buckets only.</li>
              <li>Each hero expects desktop + optional mobile URLs plus the approved overlay token.</li>
              <li>Document every change in the simplification plan for weekly review.</li>
            </ul>
          </CardContent>
        </Card>

        <HeroAssignmentEditor assignments={heroAssignments} />
      </section>

      <section id="product-images" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product & Protocol Workflow</CardTitle>
            <CardDescription>
              Upload → assign → delete directly from the curated inventory. Protocol images share the
              same buckets as product bottles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-forest/70">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Primary bottles: deliver {IMAGE_DIMENSIONS.product.main.width}x
                {IMAGE_DIMENSIONS.product.main.height}px WebP (&lt;200KB).
              </li>
              <li>Protocols: square crop preferred, mark `type: "protocol"` in JSON payload.</li>
              <li>Deleting an asset removes Supabase storage + detaches from the SKU record.</li>
            </ul>
          </CardContent>
        </Card>

        <Card id="media-library">
          <CardHeader>
            <CardTitle>Image Uploads</CardTitle>
            <CardDescription>Direct interface to the `product-images` bucket.</CardDescription>
          </CardHeader>
          <CardContent>
            <MediaLibraryPanel />
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Product Coverage</CardTitle>
              <CardDescription>
                Focus on bottle shots first, then protocol/lifestyle imagery.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-3xl font-bold text-forest">{productImageSummary.length}</p>
                <p className="text-forest/60">Total SKUs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-terracotta">{missingPrimary.length}</p>
                <p className="text-forest/60">Missing bottle</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-700">{needsProtocol.length}</p>
                <p className="text-forest/60">Need protocol shot</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-700">{fallbackOnly.length}</p>
                <p className="text-forest/60">Using legacy URL</p>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Upload Checklist</CardTitle>
                <CardDescription>Applies to both bottle shots and protocol imagery.</CardDescription>
              </div>
              {simplificationDoc && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`${simplificationDoc.githubHref}#scope-b--product--protocol-images`} target="_blank">
                    View scope
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-forest/80">
                <li>Match the naming convention to avoid mismatches when selecting from inventory.</li>
                <li>Immediately register uploaded files in each product’s `images` JSON array.</li>
                <li>Use `ProductImageryDrawer` below to delete or set the active asset per SKU.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SKU Imagery Status</CardTitle>
              <CardDescription>Filter, upload, and assign assets per SKU.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/products">Go to Product Manager</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-sage/30">
              <table className="min-w-full text-sm text-forest/80">
                <thead className="bg-sage/10 text-left text-forest/60">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Product</th>
                    <th className="px-4 py-2 font-semibold">Category</th>
                    <th className="px-4 py-2 font-semibold">Primary Bottle</th>
                    <th className="px-4 py-2 font-semibold">Protocol Image</th>
                    <th className="px-4 py-2 font-semibold">Images</th>
                    <th className="px-4 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/20 bg-white">
                  {productImageSummary.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-forest">{product.name}</p>
                        <p className="text-xs font-mono text-forest/60">{product.slug}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{product.category}</td>
                      <td className="px-4 py-3">
                        {product.hasPrimary ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Present
                          </span>
                        ) : (
                          <span className="rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-semibold text-terracotta">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.hasLifestyle ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Present
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.imageCount} file{product.imageCount === 1 ? "" : "s"}
                        {product.fallbackOnly && (
                          <span className="ml-2 text-xs text-terracotta">(uses legacy image_url)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ProductImageryDrawer product={product} />
                          <Button asChild size="sm" variant="outline" className="text-xs">
                            <Link href={`/admin/products?focus=${product.slug}`}>Edit product</Link>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <Link href="#media-library">Upload image</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory Summary</CardTitle>
                <CardDescription>Only assets relevant to hero + product scopes are tracked.</CardDescription>
              </div>
              <ImageIcon className="h-8 w-8 text-sage" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-3xl font-bold text-forest">{inventoryStats.total}</p>
                <p className="text-forest/60">Tracked files</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">{inventoryStats.ready}</p>
                <p className="text-forest/60">Ready to use</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-700">{inventoryStats.needsOptimization}</p>
                <p className="text-forest/60">Need optimization</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-700">{inventoryStats.pendingLicense}</p>
                <p className="text-forest/60">Pending license</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Image Inventory</CardTitle>
              <CardDescription>
                Review metadata and pick assets directly when wiring products or hero entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetTable inventory={IMAGE_INVENTORY} />
            </CardContent>
          </Card>
        </section>
      </section>

      <section id="documentation" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Documentation Hub</CardTitle>
            <CardDescription>Reference the simplification plan and supporting guides.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentViewerPanel />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
