"use client"

import { useMemo, useState } from "react"
import { RECOMMENDED_ASSETS } from "@/lib/visual/inventory"
import { BrandOverlayVariant, OVERLAY_STYLES } from "@/lib/visual/overlay-variants"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useFormState } from "react-dom"
import { heroAssignmentInitialState, updateHeroAssignmentAction } from "@/app/admin/visual-system/hero-actions"

const HERO_ASSETS = RECOMMENDED_ASSETS.filter((asset) => asset.priority === "hero")
const OVERLAY_OPTIONS = Object.keys(OVERLAY_STYLES) as BrandOverlayVariant[]

export function OverlayLab({ heroIds }: { heroIds: string[] }) {
  const [selectedHero, setSelectedHero] = useState(heroIds[0])
  const [selectedAsset, setSelectedAsset] = useState(HERO_ASSETS[0]?.id ?? "")
  const [selectedOverlay, setSelectedOverlay] = useState<BrandOverlayVariant>("sage-gradient")
  const [state, formAction] = useFormState(updateHeroAssignmentAction, heroAssignmentInitialState)

  const previewAsset = useMemo(
    () => HERO_ASSETS.find((asset) => asset.id === selectedAsset),
    [selectedAsset]
  )

  return (
    <div className="space-y-4 rounded-xl border border-sage/40 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-forest">Overlay Lab</h3>
        <p className="text-sm text-forest/70">
          Experiment with overlays, then push them live to a hero assignment.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-forest/60">
              Hero
            </label>
            <select
              name="id"
              value={selectedHero}
              onChange={(event) => setSelectedHero(event.target.value)}
              className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
            >
              {heroIds.map((hero) => (
                <option key={hero} value={hero}>
                  {hero}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-forest/60">
              Asset
            </label>
            <select
              name="assetId"
              value={selectedAsset}
              onChange={(event) => setSelectedAsset(event.target.value)}
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
              Overlay
            </label>
            <select
              name="overlay"
              value={selectedOverlay}
              onChange={(event) => setSelectedOverlay(event.target.value as BrandOverlayVariant)}
              className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
            >
              {OVERLAY_OPTIONS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input type="hidden" name="mobileAssetId" value="" />
        <div className="relative h-60 overflow-hidden rounded-xl border border-sage/30">
          {previewAsset ? (
            <>
              <Image
                src={previewAsset.desktopSrc}
                alt={previewAsset.title}
                fill
                sizes="400px"
                className="object-cover"
              />
              <div className="absolute inset-0" style={{ background: OVERLAY_STYLES[selectedOverlay] }} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-forest/50">
              Select an asset to preview
            </div>
          )}
        </div>
        <Button type="submit" disabled={state.status === "pending"}>
          {state.status === "pending" ? "Applying..." : "Apply to Hero"}
        </Button>
        {state.status === "error" && <p className="text-sm text-terracotta">{state.message}</p>}
        {state.status === "success" && (
          <p className="text-sm text-forest">Overlay applied to {selectedHero}.</p>
        )}
      </form>
    </div>
  )
}
