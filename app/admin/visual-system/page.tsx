import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, BookOpenCheck, Image as ImageIcon, RefreshCw } from "lucide-react"

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
    </div>
  )
}
