import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  BookOpenCheck,
  Image as ImageIcon,
  Layers,
  Palette,
  RefreshCw,
} from "lucide-react"
import {
  IMAGE_INVENTORY,
  RECOMMENDED_ASSETS,
  VISUAL_DIRECTORY_TREE,
  type DirectoryNode,
} from "@/lib/visual/inventory"
import { BRAND_COLORS, OVERLAY_STYLES } from "@/lib/visual/overlay-variants"
import { AssetTable } from "@/components/admin/visual-system/asset-table"
import { HeroAssignments } from "@/components/admin/visual-system/hero-assignments"
import { MediaLibraryPanel } from "@/components/admin/visual-system/media-library-panel"
import { ProductImageryDrawer } from "@/components/admin/visual-system/product-imagery-drawer"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { IMAGE_DIMENSIONS } from "@/lib/visual/image-configs"
import type { ProductImageSummary } from "@/types/admin-visual"

export const metadata = {
  title: "Visual System | Leyla's Apothecary Admin",
  description: "Track documentation and maintenance tasks for the visual content system.",
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
    const hasLifestyle = imagesArray.some(
      (img: any) => img?.type === "lifestyle" && typeof img.url === "string" && img.url.length > 0
    )

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      hasPrimary,
      hasLifestyle,
      fallbackOnly: !hasPrimary && Boolean(product.image_url),
      imageCount: imagesArray.length,
    }
  })
}

const DOC_BASE = "https://github.com/Ivan2san/Leyla-Apothecary-MVP/blob/main"

const docLinks = [
  {
    title: "Visual Content System Architecture",
    href: `${DOC_BASE}/docs/VISUAL_CONTENT_SYSTEM.md`,
    description: "Source of truth for overlays, asset naming, and component guidelines.",
  },
  {
    title: "Visual Content Implementation Guide",
    href: `${DOC_BASE}/docs/VISUAL_CONTENT_IMPLEMENTATION.md`,
    description: "Step-by-step instructions for building and maintaining the system.",
  },
  {
    title: "Photography Guide",
    href: `${DOC_BASE}/docs/Leylas_Apothecary_Image_Photography_Guide.md`,
    description: "Composition, staging, and editing guidelines for brand imagery.",
  },
  {
    title: "Brand Color System",
    href: `${DOC_BASE}/docs/BRAND_COLOR_SYSTEM.md`,
    description: "Immutable palette references for all experiences.",
  },
]

const maintenanceChecklist = [
  { label: "Monthly", items: ["Run image performance audit", "Rotate seasonal hero imagery", "Verify alt text + accessibility"] },
  { label: "Quarterly", items: ["Full visual brand QA", "Review Unsplash/licensed assets", "Update overlay variants"] },
  { label: "Annual", items: ["Professional photoshoot planning", "Palette review (requires approval)", "Renew stock photo licenses"] },
]

const nextActions = [
  {
    title: "Sync Image Inventory",
    description: "Upload MediHerb bottles, tag them, and keep Supabase in sync.",
    icon: ImageIcon,
    badge: (ready: number, total: number) => `${ready}/${total} ready`,
    href: "#media-library",
  },
  {
    title: "Wire Up Visual Helpers",
    description: "Keep hero overlays + ProductImage helpers active in code.",
    icon: RefreshCw,
    badge: () => "Helpers live",
    href: `${DOC_BASE}/docs/VISUAL_CONTENT_SYSTEM.md#hero-banner-system`,
  },
  {
    title: "Document Component Usage",
    description: "Ensure every visual component has annotated usage + screenshots.",
    icon: BookOpenCheck,
    badge: () => "Docs available",
    href: "#documentation-hub",
  },
]

const buttonClass =
  "inline-flex h-10 items-center justify-center rounded-md bg-sage px-4 font-semibold text-forest transition hover:bg-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"

const inventoryStats = {
  total: IMAGE_INVENTORY.length,
  ready: IMAGE_INVENTORY.filter((item) => item.status === "ready").length,
  needsOptimization: IMAGE_INVENTORY.filter((item) => item.status === "needs-optimization").length,
  pendingLicense: IMAGE_INVENTORY.filter((item) => item.status === "pending-license").length,
}

function renderDirectory(node: DirectoryNode): JSX.Element {
  return (
    <li key={node.name}>
      <span className="font-mono text-sm text-forest">{node.name}</span>
      {node.children && (
        <ul className="ml-4 border-l border-sage/40 pl-4 mt-2 space-y-1">
          {node.children.map((child) => renderDirectory(child))}
        </ul>
      )}
    </li>
  )
}

export default async function AdminVisualSystemPage() {
  const productImageSummary = await getProductImageSummary()
  const missingPrimary = productImageSummary.filter((product) => !product.hasPrimary)
  const needsLifestyle = productImageSummary.filter((product) => !product.hasLifestyle)
  const fallbackOnly = productImageSummary.filter((product) => product.fallbackOnly)

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        {nextActions.map(({ title, description, icon: Icon, badge, href }) => (
          <Card key={title} className="border-sage/40">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-sage/15 text-forest">
                {badge ? badge(inventoryStats.ready, inventoryStats.total) : "Active"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Icon className="h-10 w-10 text-sage" />
                {href && (
                  <Link
                    href={href}
                    className="text-sm font-semibold text-terracotta hover:underline"
                  >
                    View
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="documentation-hub" className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documentation Hub</CardTitle>
            <CardDescription>Quick links to the visual governance playbooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {docLinks.map((doc) => (
              <div key={doc.title} className="rounded-lg border border-sage/30 p-4">
                <p className="font-semibold text-forest">{doc.title}</p>
                <p className="text-sm text-forest/70 mb-3">{doc.description}</p>
                <Link className={buttonClass} href={doc.href} target="_blank">
                  Open Documentation
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Checklist</CardTitle>
            <CardDescription>Lifted from VISUAL_CONTENT_IMPLEMENTATION.md.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {maintenanceChecklist.map((group) => (
              <div key={group.label}>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-terracotta" />
                  <p className="text-sm font-semibold uppercase tracking-wide text-forest/70">
                    {group.label}
                  </p>
                </div>
                <ul className="list-disc pl-6 text-sm text-forest/80 space-y-1">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="media-library">
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Upload and browse MediHerb bottle imagery stored in Supabase.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* @ts-expect-error Async Server Component */}
            <MediaLibraryPanel />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Hero Assignments</CardTitle>
            <CardDescription>Active imagery powering each page — swap assets by updating lib/visual/inventory.ts.</CardDescription>
          </CardHeader>
          <CardContent>
            <HeroAssignments />
          </CardContent>
        </Card>
      </section>

      <section id="sku-imagery" className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Product Bottle Coverage</CardTitle>
            <CardDescription>Every SKU must have an H.E.C./MediHerb-style bottle image.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-3xl font-bold text-forest">{productImageSummary.length}</p>
              <p className="text-forest/60">Total SKUs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-700">{missingPrimary.length}</p>
              <p className="text-forest/60">Missing bottle photo</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-700">{needsLifestyle.length}</p>
              <p className="text-forest/60">Need lifestyle image</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-terracotta">{fallbackOnly.length}</p>
              <p className="text-forest/60">Using legacy image_url</p>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Product Imagery Checklist</CardTitle>
              <CardDescription>Bottle angles inspired by Herbal Extract Company (MediHerb) dispensary line.</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href={`${DOC_BASE}/docs/Leylas_Apothecary_Image_Photography_Guide.md#image-procurement-workflow`} target="_blank">
                View Photography Guide
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-forest/80">
              <li>Use 30ml amber bottle with gold cap, label centered, soft studio lighting.</li>
              <li>Shoot on neutral warm backdrop; keep foreground props minimal and botanical.</li>
              <li>Deliver {IMAGE_DIMENSIONS.product.main.width}x{IMAGE_DIMENSIONS.product.main.height}px WebP, max 200KB.</li>
              <li>Name files with the established convention (date_category_subcategory_description_variant_v1).</li>
              <li>Upload to <code className="rounded bg-sage/20 px-1">public/images/products/tinctures</code> and register the asset in Supabase.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SKU Imagery Status</CardTitle>
              <CardDescription>Filter, search, and quickly jump into the product editor.</CardDescription>
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
                    <th className="px-4 py-2 font-semibold">Lifestyle Image</th>
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
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription>Derived from lib/visual/inventory.ts.</CardDescription>
            </div>
            <Layers className="h-8 w-8 text-sage" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-3xl font-bold text-forest">{inventoryStats.total}</p>
              <p className="text-forest/60">Tracked files</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700">{inventoryStats.ready}</p>
              <p className="text-forest/60">Ready to publish</p>
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Image Inventory</CardTitle>
            <CardDescription>Matches the metadata schema documented in the Visual Content System.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetTable inventory={IMAGE_INVENTORY} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Assets</CardTitle>
            <CardDescription>Next batch of imagery to source + wire into components.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {RECOMMENDED_ASSETS.map((asset) => (
              <div key={asset.title} className="rounded-lg border border-sage/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-forest">{asset.title}</p>
                  <Badge variant="secondary" className="bg-sage/15 text-forest capitalize">
                    {asset.priority}
                  </Badge>
                </div>
                <p className="text-sm text-forest/70">{asset.description}</p>
                <p className="text-xs font-mono text-forest/70 break-words">
                  Desktop: {asset.desktopSrc}
                  {asset.mobileSrc && (
                    <>
                      <br />
                      Mobile: {asset.mobileSrc}
                    </>
                  )}
                </p>
                <p className="text-xs text-forest/60">Overlay: {asset.overlay}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Overlay + Palette</CardTitle>
              <CardDescription>Brand references for component teams.</CardDescription>
            </div>
            <Palette className="h-8 w-8 text-sage" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-forest mb-2">Brand Colors</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(BRAND_COLORS).map(([name, hex]) => (
                  <div key={name} className="rounded-lg border border-sage/30 p-3 flex items-center gap-3">
                    <span
                      className="h-8 w-8 rounded-full border border-white/70 shadow-inner"
                      style={{ backgroundColor: hex }}
                    />
                    <div>
                      <p className="text-sm font-semibold capitalize text-forest">{name}</p>
                      <p className="font-mono text-xs text-forest/70">{hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-forest mb-2">Overlay Variants</p>
              <div className="grid gap-2">
                {Object.entries(OVERLAY_STYLES).map(([variant, gradient]) => (
                  <div key={variant} className="rounded-lg border border-sage/30 p-3 space-y-2">
                    <p className="text-sm font-semibold text-forest">{variant}</p>
                    <div className="h-10 w-full rounded-md border border-white/30" style={{ background: gradient }} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Directory Structure</CardTitle>
            <CardDescription>Mirrors the taxonomy in docs/VISUAL_CONTENT_SYSTEM.md.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {VISUAL_DIRECTORY_TREE.map((node) => renderDirectory(node))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
