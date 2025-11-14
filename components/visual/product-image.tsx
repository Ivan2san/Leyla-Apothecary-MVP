"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getResponsiveImageSizes } from "@/lib/visual/image-utils"
import { logImagePerformance } from "@/lib/visual/performance-monitor"

interface ProductImageProps {
  src: string
  alt: string
  hoverSrc?: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function ProductImage({
  src,
  alt,
  hoverSrc,
  className,
  priority = false,
  sizes = getResponsiveImageSizes("product"),
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const loadStartRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now()
  )

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  return (
    <div
      className={cn("relative aspect-square overflow-hidden rounded-lg", className)}
      onMouseEnter={() => hoverSrc && setCurrentSrc(hoverSrc)}
      onMouseLeave={() => setCurrentSrc(src)}
    >
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        className={cn(
          "object-cover transition-all duration-300",
          isLoading ? "blur-sm scale-105" : "blur-0 scale-100"
        )}
        sizes={sizes}
        quality={90}
        onLoadingComplete={() => {
          setIsLoading(false)
          const now = typeof performance !== "undefined" ? performance.now() : Date.now()
          const loadTime = now - (loadStartRef.current ?? now)
          logImagePerformance(currentSrc, loadTime)
        }}
      />

      {isLoading && <div className="absolute inset-0 animate-pulse bg-sage/10" />}
    </div>
  )
}
