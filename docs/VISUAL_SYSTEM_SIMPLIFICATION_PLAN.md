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
