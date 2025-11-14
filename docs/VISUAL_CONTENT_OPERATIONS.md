# Visual Content System – Operations & Governance

## Table of Contents
1. [Purpose](#purpose)
2. [Supabase Storage Architecture](#supabase-storage-architecture)
3. [Hero Assignment Workflow](#hero-assignment-workflow)
4. [Image Inventory & Tagging](#image-inventory--tagging)
5. [Media Library Operations](#media-library-operations)
6. [Performance Observability](#performance-observability)
7. [Documentation Hub Maintenance](#documentation-hub-maintenance)
8. [Operational Checklists](#operational-checklists)

---

## Purpose

This guide documents the day‑to‑day operations that keep the visual system healthy. It assumes the architecture and implementation guides in `VISUAL_CONTENT_SYSTEM.md` and `VISUAL_CONTENT_IMPLEMENTATION.md` are in place, and focuses on:

- How Supabase buckets are organized and governed
- How hero imagery is assigned, versioned, and surfaced in the product
- How we monitor inventory coverage, signed URLs, and performance
- How the admin console (`/admin/visual-system`) ties all of the above together

Use this as the operational playbook when rotating assets, onboarding teammates, or responding to regressions.

---

## Supabase Storage Architecture

| Bucket | Purpose | Primary Consumers | Notes |
|--------|---------|-------------------|-------|
| `product-images` | Stores optimized WebP/JPEG assets for products, heroes, and lifestyle content. | `MediaLibraryPanel`, `components/visual/*` | Enforce naming convention documented in the architecture guide. |
| `visual-config` | Stores JSON configuration such as hero assignments. | `lib/visual/hero-config.ts` | Write-protected outside of service-role client usage. |

### Hero Configuration File
- Path: `visual-config/hero-assignments.json`
- Shape mirrors `HeroAssignmentRecord` in `lib/visual/hero-config.ts`
- Deployments fall back to `HERO_ASSIGNMENTS` if this file is missing

```bash
# Upload updated assignments (service-role key required)
supabase storage upload \
  --bucket visual-config \
  --file lib/visual/fixtures/hero-assignments.json \
  --path hero-assignments.json \
  --upsert
```

### Bucket Permissions
- `product-images`: read for `anon` role, write restricted to service-role or RLS policies defined for admins.
- `visual-config`: no public access. Service-role key only. Never expose via client bundles.

---

## Hero Assignment Workflow

The hero system is centralized inside `lib/visual/hero-config.ts` and used by every page that renders `<HeroBanner />`.

1. **Data Load**
   - `loadHeroAssignmentRecords` tries Supabase first.
   - If nothing is stored, it falls back to the static seed array `HERO_ASSIGNMENTS`.

2. **Admin Editing**
   - `/admin/visual-system#hero-assignments` renders `HeroAssignmentEditor`.
   - Actions hit `app/admin/visual-system/hero-actions.ts` which persists using `saveHeroAssignmentRecords`.
   - All file paths referenced should already exist in `RECOMMENDED_ASSETS` to avoid broken imagery.

3. **Runtime Consumption**
   - Public routes (`app/page.tsx`, `app/products/page.tsx`, `app/booking/page.tsx`) call `getHeroAsset(id)`.
   - Each response includes desktop/mobile sources plus overlay variant, ensuring branding stays consistent without sprinkling magic strings across the app.

4. **Disaster Recovery**
   - Delete/corrupt the Supabase JSON? The fallback ensures the app still renders.
   - Keep a copy of assignments in version control for quick redeploys.

---

## Image Inventory & Tagging

The canonical metadata lives in `lib/visual/inventory.ts`.

### Inventory Schema
```ts
type ImageInventoryItem = {
  id: string
  filename: string
  category: string          // hero-banners | products | lifestyle | ...
  subcategory: string
  usage: string             // Where the asset appears
  brandColors: string[]
  tags: string[]            // Used for filtering/searching
  status: "ready" | "needs-optimization" | "pending-license"
  optimized: boolean
  lastUpdated: string       // ISO timestamp
  publicUrl?: string        // Optional, points to /public image
}
```

Key rules:
- **Immutable naming**: filenames must match `{date}_{category}_{subcategory}_{description}_{variant}_{version}`.
- **Status lifecycle**:
  - `pending-license`: waiting on legal clearance or commercial license docs.
  - `needs-optimization`: asset exists but needs compression, alt text, or overlay prep.
  - `ready`: can be wired into production.
- Update `IMAGE_INVENTORY` whenever assets move between statuses so admin dashboards stay trustworthy.

### Recommended Assets
`RECOMMENDED_ASSETS` is the prioritized backlog for sourcing. Tie each entry to a hero/product requirement so the admin UI can highlight what is still missing.

---

## Media Library Operations

The media library panel relies on `lib/storage/media-library.ts`.

1. **Recursive Listing**
   - `listMediaLibraryAssets` walks the `product-images` bucket with depth-first recursion.
   - `MAX_ITEMS` prevents runaway pagination; bump if we exceed 200 assets per directory.

2. **Signed URLs**
   - Each file receives a one-hour signed URL for previews inside the admin panel.
   - Public pages should prefer static `/public/images` references for cacheability.

3. **Uploads**
   - Use the `MediaUploadForm` component or CLI scripts to upload WebP/JPEG pairs.
   - Always register new files inside Supabase `products.images` JSON array or `IMAGE_INVENTORY`.

4. **Naming Guardrails**
   - Run the provided `lib/services/images.ts` helpers before accepting user uploads.
   - Reject files lacking the required metadata (date, category, description, version).

---

## Performance Observability

Every image component should report slow loads through `lib/visual/performance-monitor.ts`.

```ts
import { logImagePerformance } from "@/lib/visual/performance-monitor"

logImagePerformance("2025-01-22_product_tincture_lavender-calm_primary_v3.webp", 1875)
```

- **Thresholds**: Warns at >2,000ms. Adjust only via this helper.
- **Analytics**: Sends `image_load` events to `window.gtag` (if configured) with image name, load time, and page path.
- **Usage**: Already wired into `components/visual/product-image.tsx`. Mirror that pattern for hero, lifestyle, or marketing-specific components.
- **Troubleshooting**: Use Lighthouse and the admin dashboard statistics to correlate warnings with assets stuck in `needs-optimization`.

---

## Documentation Hub Maintenance

The admin console renders documentation using `lib/docs/document-service.ts` + `/api/admin/docs`.

**Adding a Document**
1. Drop the Markdown file in `docs/`.
2. Append an entry to `DOCUMENTS` with `id`, `title`, `description`, `file`, and `githubHref`.
3. Deploy – `DocumentViewerPanel` automatically loads the new doc.

**Why it matters**
- Product + content teams can review guardrails inside the product without leaving the admin area.
- Keeps the operational knowledge co-located with tooling (hero editor, media library, overlay lab).

---

## Operational Checklists

### Weekly
- [ ] Review `hero-assignments.json` for outdated assets or overlays.
- [ ] Clear `pending-license` entries once contracts land.
- [ ] Verify newly uploaded files respect the naming convention and have alt text drafted.

### Monthly
- [ ] Run Lighthouse on homepage, products, booking to confirm hero load times < 2s.
- [ ] Refresh Unsplash/stock collections referenced by `RECOMMENDED_ASSETS`.
- [ ] Export signed URLs for QA to test across mobile breakpoints.

### Quarterly
- [ ] Archive stale assets (unused for >6 months) to cold storage.
- [ ] Audit Supabase bucket permissions and rotate service-role keys.
- [ ] Reconcile `IMAGE_INVENTORY` with actual files on disk/Supabase to avoid drift.

---

**Maintained by**: Visual Systems Team  
**Version**: 1.0 (February 2025)  
**Related Docs**:
- [Visual Content System Architecture](./VISUAL_CONTENT_SYSTEM.md)
- [Visual Content Implementation Guide](./VISUAL_CONTENT_IMPLEMENTATION.md)
- [Photography Guide](./Leylas_Apothecary_Image_Photography_Guide.md)

For questions, reach out in `#visual-system` or open a GitHub issue tagged `visual-content`.
