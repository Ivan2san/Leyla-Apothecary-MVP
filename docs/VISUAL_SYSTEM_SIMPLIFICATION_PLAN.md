# Visual System Simplification Plan

## Intent

The current visual platform is overloaded with competing initiatives. Until we stabilize quality, all energy shifts to two slices of the experience:

1. **Hero Image Sections**
2. **Product & Protocol Imagery**

Everything else (overlay experiments, lifestyle galleries, metadata tooling, performance experiments) becomes inactive/read-only until these pillars ship and we regain confidence.

---

## Roles & Ownership

| Role | Responsibilities |
|------|------------------|
| Architect (you) | Final decision maker, unblocks Supabase + Next.js integration, approves scope. |
| UX Lead | Maps interim admin workflow for uploading/selecting hero + product assets. Produces low-fidelity flows for review. |
| Visual Designer | Supplies updated palettes, crop specs, lightweight component states that fit new flows. |

Weekly sync cadence: 30 minutes every Monday to review blockers and confirm updated tasks.

---

## Scope A – Hero Image Sections

### Goals
- Upload new hero imagery via a single admin surface.
- Assign desktop/mobile versions per section (Home, Products, Booking, future expansion).
- Flip overlay palettes using the approved brand colors, but restrict the set to whatever the designer re-validates.

### Deliverables
1. **Wireframe (UX)**
   - Upload dropzone + metadata form (title, section, alt text, overlay palette).
   - Preview of hero in the chosen layout.
2. **Design Pack (Visual Design)**
   - Palette tokens (hex + naming) for the reduced set.
   - Overlay mockups showing acceptable opacity/texture.
3. **Implementation Notes (Architect)**
   - Continue storing hero assignments in Supabase (`visual-config` bucket).
   - Maintain JSON schema: `{ id, page, route, assetId, overlay, desktopSrc, mobileSrc }`.
   - Provide API endpoints / admin actions limited to the above attributes.

### Out of Scope
- Legacy overlay lab UI.
- Automated performance logging.
- Programmatic metadata tagging.

---

## Scope B – Product & Protocol Images

### Goals
- Upload or delete product/practice protocol imagery.
- Choose which image is active per SKU/protocol directly from a curated inventory list.
- Guarantee each SKU has at least one hero bottle shot before publishing.

### Deliverables
1. **Inventory UX Flow**
   - Table filtered to SKU/protocol.
   - Buttons: `Upload`, `Delete`, `Set as Primary`.
   - Confirmation modal before deletion.
2. **Design Tokens**
   - Thumbnails (aspect ratios, corner radius, hover states).
   - Status badges (Ready, Needs Optimization, Pending License).
3. **Data Model**
   - Continue using Supabase `product-images` bucket.
   - Normalize references into `products.images` JSON array:
     ```json
     {
       "type": "primary" | "protocol" | "lifestyle",
       "storagePath": "product-images/2025-02-20_products_tinctures_lavender_primary_v1.webp",
       "alt": "Lavender Calm tincture bottle",
       "status": "ready"
     }
     ```
   - Architect to expose CRUD actions via admin API with RLS-protected Supabase calls.

### Out of Scope
- Lifestyle galleries.
- Batch import scripts.
- Metadata/analytics dashboards.

---

## Supabase & Storage Guidelines

- **Buckets**: keep `product-images` (public read) and `visual-config` (service-role only). No new buckets until these stabilize.
- **File Naming**: still follow `YYYY-MM-DD_category_subcategory_description_variant_version.ext`.
- **Inactive Components**: mark unused admin sections (overlay lab, content taxonomy viewers) as disabled in the UI so contributors are not confused. Back them up in the README but note they are paused.

---

## Communication Plan

1. **Kickoff Memo (this doc)** – share in `#visual-system` and pin.
2. **Weekly Check-ins** – architect + UX + visual designer confirm deliverables for each scope.
3. **Status Dashboard** – repurpose the existing admin visual page to show “Hero Flow” and “Product Flow” status only; hide other cards until reactivation.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Legacy components accidentally reactivated | Gate behind feature flag `VISUAL_SYSTEM_V2_ENABLED=false`. |
| Asset drift between Supabase and local repo | Require every upload to register metadata immediately; add weekly spot check. |
| Scope creep (e.g., trying to rebuild overlay lab) | Architect rejects additions until the two core workflows are in QA. |

---

## Next Steps Checklist

- [ ] Share doc with UX + visual design.
- [ ] UX delivers draft flows for hero uploader + product inventory.
- [ ] Visual design provides updated palette + component tokens.
- [ ] Architect sets `inactive` flags on admin modules not part of the two scopes.
- [ ] Begin implementation sprint focused exclusively on Scope A + Scope B.

Status of remaining Visual Content System artifacts: **paused** until both scopes are accepted in staging.
