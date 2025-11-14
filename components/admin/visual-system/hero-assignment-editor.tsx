"use client"

import { useFormState } from "react-dom"
import { heroAssignmentInitialState, updateHeroAssignmentAction } from "@/app/admin/visual-system/hero-actions"
import type { HeroAssignmentWithAsset } from "@/lib/visual/hero-config"
import { RECOMMENDED_ASSETS } from "@/lib/visual/inventory"
import { BRAND_COLORS, OVERLAY_STYLES, type BrandOverlayVariant } from "@/lib/visual/overlay-variants"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useFormStatus } from "react-dom"

const HERO_ASSETS = RECOMMENDED_ASSETS.filter((asset) => asset.priority === "hero")
const OVERLAY_OPTIONS = Object.keys(OVERLAY_STYLES) as BrandOverlayVariant[]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  )
}

export function HeroAssignmentEditor({ assignments }: { assignments: HeroAssignmentWithAsset[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {assignments.map((assignment) => (
        <HeroAssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  )
}

function HeroAssignmentCard({ assignment }: { assignment: HeroAssignmentWithAsset }) {
  const [state, formAction] = useFormState(updateHeroAssignmentAction, heroAssignmentInitialState)

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-sage/40 bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={assignment.id} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-forest/60">{assignment.page}</p>
          <p className="font-semibold text-forest">{assignment.description}</p>
        </div>
        <Button asChild variant="link" className="text-xs text-terracotta">
          <a href={assignment.route} target="_blank" rel="noopener noreferrer">
            View page
          </a>
        </Button>
      </div>
      <div className="relative h-40 overflow-hidden rounded-lg border border-sage/30">
        {assignment.asset?.desktopSrc ? (
          <Image
            src={assignment.asset.desktopSrc}
            alt={assignment.asset.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-forest/50">
            Assign an asset
          </div>
        )}
        <div className="absolute inset-0" style={{ background: OVERLAY_STYLES[assignment.overlay] }} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/60">
          Desktop Asset
        </label>
        <select
          name="assetId"
          defaultValue={assignment.assetId}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          {HERO_ASSETS.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/60">
          Mobile Asset (Optional)
        </label>
        <select
          name="mobileAssetId"
          defaultValue={assignment.mobileAssetId ?? ""}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          <option value="">Use desktop asset</option>
          {HERO_ASSETS.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/60">
          Overlay Variant
        </label>
        <select
          name="overlay"
          defaultValue={assignment.overlay}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          {OVERLAY_OPTIONS.map((variant) => (
            <option key={variant} value={variant}>
              {variant}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between text-xs text-forest/60">
        <p>Overlay swatch below.</p>
        <SubmitButton />
      </div>
      {state.status === "error" && <p className="text-xs text-terracotta">{state.message}</p>}
      <div className="h-10 rounded-md border border-sage/30" style={{ background: OVERLAY_STYLES[assignment.overlay] }} />
    </form>
  )
}
