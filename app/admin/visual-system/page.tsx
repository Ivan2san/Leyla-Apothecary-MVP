import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export const metadata = {
  title: "Visual System | Leyla's Apothecary Admin",
  description: "Track documentation and maintenance tasks for the visual content system.",
}

const docLinks = [
  {
    title: "Visual Content System Architecture",
    href: "/docs/VISUAL_CONTENT_SYSTEM.md",
    description: "Source of truth for overlays, asset naming, and component guidelines.",
  },
  {
    title: "Visual Content Implementation Guide",
    href: "/docs/VISUAL_CONTENT_IMPLEMENTATION.md",
    description: "Step-by-step instructions for building and maintaining the system.",
  },
  {
    title: "Photography Guide",
    href: "/docs/Leylas_Apothecary_Image_Photography_Guide.md",
    description: "Composition, staging, and editing guidelines for brand imagery.",
  },
  {
    title: "Brand Color System",
    href: "/docs/BRAND_COLOR_SYSTEM.md",
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
    description: "Populate the spreadsheet/database that tracks filenames, usage, and license info for every asset.",
    icon: ImageIcon,
  },
  {
    title: "Wire Up Visual Helpers",
    description: "Implement `lib/visual/*` utilities (image configs, overlays, performance monitors) described in the docs.",
    icon: RefreshCw,
  },
  {
    title: "Document Component Usage",
    description: "Add README snippets for hero/product components that showcase how overlays, ratios, and color locks work.",
    icon: BookOpenCheck,
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

const statusVariantMap: Record<
  string,
  {
    label: string
    className: string
  }
> = {
  ready: { label: "Ready", className: "bg-green-100 text-green-800" },
  "needs-optimization": { label: "Needs optimization", className: "bg-yellow-100 text-yellow-800" },
  "pending-license": { label: "Pending license", className: "bg-orange-100 text-orange-800" },
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

export default function AdminVisualSystemPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        {nextActions.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-sage/40">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-sage/15 text-forest">
                In Progress
              </Badge>
            </CardHeader>
            <CardContent>
              <Icon className="h-10 w-10 text-sage" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
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
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-forest/80">
                <thead>
                  <tr className="text-left text-forest/60">
                    <th className="py-2 pr-4 font-medium">Filename</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Usage</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/30">
                  {IMAGE_INVENTORY.map((item) => {
                    const statusConfig = statusVariantMap[item.status]
                    return (
                      <tr key={item.id}>
                        <td className="py-2 pr-4 font-mono text-xs">{item.filename}</td>
                        <td className="py-2 pr-4 capitalize">
                          {item.category} / {item.subcategory}
                        </td>
                        <td className="py-2 pr-4">{item.usage}</td>
                        <td className="py-2 pr-4">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusConfig.className)}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-2">{item.lastUpdated}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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
