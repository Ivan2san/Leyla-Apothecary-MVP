"use client"

import Image from "next/image"
import Link from "next/link"
import { HERO_ASSIGNMENTS, getRecommendedAsset } from "@/lib/visual/inventory"

export function HeroAssignments() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {HERO_ASSIGNMENTS.map((assignment) => {
        const asset = getRecommendedAsset(assignment.assetId)
        return (
          <div key={assignment.id} className="rounded-xl border border-sage/40 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-forest/60">{assignment.page}</p>
                <p className="font-semibold text-forest">{assignment.description}</p>
              </div>
              <Link
                href={assignment.route}
                className="text-xs font-semibold text-terracotta hover:underline"
                target="_blank"
              >
                View page
              </Link>
            </div>
            {asset ? (
              <div className="relative h-40 overflow-hidden rounded-lg border border-sage/30">
                <Image
                  src={asset.desktopSrc}
                  alt={asset.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0" />
                <div className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-forest">
                  Overlay: {asset.overlay}
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-sage/40 text-sm text-forest/60">
                Asset not assigned
              </div>
            )}
            {asset && (
              <p className="text-xs text-forest/70">
                {asset.title}
                {asset.mobileSrc && (
                  <>
                    <br />
                    <span className="font-mono text-[11px] text-forest/50">Mobile asset available</span>
                  </>
                )}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
