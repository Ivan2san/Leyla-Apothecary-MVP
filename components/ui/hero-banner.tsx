"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BrandOverlayVariant } from "@/lib/visual/overlay-variants"
import { OVERLAY_STYLES, MOBILE_OVERLAY_STYLES, TEXTURE_OVERLAY } from "@/lib/visual/overlay-variants"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

interface HeroBannerProps {
  title: string
  subtitle?: string
  description?: string
  imageSrc: string
  mobileImageSrc?: string
  imageAlt: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  overlay?: "light" | "dark" | "gradient" | "none" | BrandOverlayVariant
  height?: "small" | "medium" | "large" | "full"
  textAlign?: "left" | "center" | "right"
  textPosition?: "top" | "center" | "bottom"
  withTexture?: boolean
  className?: string
}

export function HeroBanner({
  title,
  subtitle,
  description,
  imageSrc,
  mobileImageSrc,
  imageAlt,
  primaryCTA,
  secondaryCTA,
  overlay = "sage-gradient",
  height = "large",
  textAlign = "center",
  textPosition = "center",
  withTexture = false,
  className,
}: HeroBannerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const heightClasses = {
    small: "h-[300px]",
    medium: "h-[400px] md:h-[500px]",
    large: "h-[500px] md:h-[600px] lg:h-[700px]",
    full: "min-h-screen",
  }

  type LegacyOverlay = "light" | "dark" | "gradient"

  const legacyOverlayClasses: Record<LegacyOverlay, string> = {
    light: "bg-white/60",
    dark: "bg-black/60",
    gradient: "bg-gradient-to-b from-black/40 via-black/30 to-black/50",
  }

  const textAlignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }

  const textPositionClasses = {
    top: "justify-start pt-20",
    center: "justify-center",
    bottom: "justify-end pb-20",
  }

  /**
   * Get overlay style based on overlay prop
   * Supports both legacy overlays and brand overlays
   */
  const getOverlayStyle = () => {
    if (overlay === "none") return undefined

    if (overlay === "light" || overlay === "dark" || overlay === "gradient") {
      return undefined
    }

    const styles = isMobile ? MOBILE_OVERLAY_STYLES : OVERLAY_STYLES
    return {
      background: styles[overlay as BrandOverlayVariant],
    }
  }

  const resolvedImageSrc =
    mobileImageSrc && isMobile ? mobileImageSrc : imageSrc

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        heightClasses[height],
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={resolvedImageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />

        {/* Brand Color Overlay */}
        {overlay !== "none" && (
          <>
            {/* Desktop and mobile overlays with responsive behavior */}
            <div
              className={cn(
                "absolute inset-0",
                overlay === "light" || overlay === "dark" || overlay === "gradient"
                  ? legacyOverlayClasses[overlay]
                  : ""
              )}
              style={getOverlayStyle()}
            />

            {/* Optional Texture Overlay */}
            {withTexture && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: TEXTURE_OVERLAY }}
              />
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 h-full flex flex-col px-4 sm:px-6 lg:px-8",
          textAlignClasses[textAlign],
          textPositionClasses[textPosition]
        )}
      >
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {subtitle && (
            <p className="text-sm md:text-base font-medium tracking-wider uppercase text-white/90">
              {subtitle}
            </p>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight font-['Lora']">
            {title}
          </h1>

          {description && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div
              className={cn(
                "flex gap-4 pt-4",
                textAlign === "center" && "justify-center",
                textAlign === "right" && "justify-end"
              )}
            >
              {primaryCTA && (
                <Link href={primaryCTA.href}>
                  <Button
                    size="lg"
                    className="bg-[#D98C4A] hover:bg-[#D98C4A]/90 text-white font-semibold px-8 py-6 text-lg"
                  >
                    {primaryCTA.text}
                  </Button>
                </Link>
              )}

              {secondaryCTA && (
                <Link href={secondaryCTA.href}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#344E41] font-semibold px-8 py-6 text-lg"
                  >
                    {secondaryCTA.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
