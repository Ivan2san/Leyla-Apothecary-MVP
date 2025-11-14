import path from "path"
import fs from "fs/promises"

export type DocumentDefinition = {
  id: string
  title: string
  description: string
  file: string
  githubHref: string
}

const DOC_ROOT = "docs"
const REPO_BASE = "https://github.com/Ivan2san/Leyla-Apothecary-MVP/blob/main"

export const DOCUMENTS: DocumentDefinition[] = [
  {
    id: "visual-system",
    title: "Visual Content System Architecture",
    description: "Overlay rules, asset taxonomy, and governance.",
    file: "VISUAL_CONTENT_SYSTEM.md",
    githubHref: `${REPO_BASE}/docs/VISUAL_CONTENT_SYSTEM.md`,
  },
  {
    id: "visual-implementation",
    title: "Visual Content Implementation Guide",
    description: "Step-by-step instructions for rolling out the system.",
    file: "VISUAL_CONTENT_IMPLEMENTATION.md",
    githubHref: `${REPO_BASE}/docs/VISUAL_CONTENT_IMPLEMENTATION.md`,
  },
  {
    id: "visual-operations",
    title: "Visual Content Operations & Governance",
    description: "Supabase buckets, hero assignment workflow, and runbook checklists.",
    file: "VISUAL_CONTENT_OPERATIONS.md",
    githubHref: `${REPO_BASE}/docs/VISUAL_CONTENT_OPERATIONS.md`,
  },
  {
    id: "visual-simplification",
    title: "Visual System Simplification Plan",
    description: "Temporary focus on hero uploads and product/protocol imagery while other modules are inactive.",
    file: "VISUAL_SYSTEM_SIMPLIFICATION_PLAN.md",
    githubHref: `${REPO_BASE}/docs/VISUAL_SYSTEM_SIMPLIFICATION_PLAN.md`,
  },
  {
    id: "photography-guide",
    title: "Photography Guide",
    description: "H.E.C./MediHerb bottle style and staging requirements.",
    file: "Leylas_Apothecary_Image_Photography_Guide.md",
    githubHref: `${REPO_BASE}/docs/Leylas_Apothecary_Image_Photography_Guide.md`,
  },
  {
    id: "brand-color-system",
    title: "Brand Color System",
    description: "Immutable palette used across the product.",
    file: "BRAND_COLOR_SYSTEM.md",
    githubHref: `${REPO_BASE}/docs/BRAND_COLOR_SYSTEM.md`,
  },
]

export async function getDocumentContent(id: string): Promise<string> {
  const doc = DOCUMENTS.find((entry) => entry.id === id)
  if (!doc) {
    throw new Error(`Document ${id} not found`)
  }
  const filePath = path.join(process.cwd(), DOC_ROOT, doc.file)
  const buffer = await fs.readFile(filePath)
  return buffer.toString("utf-8")
}
