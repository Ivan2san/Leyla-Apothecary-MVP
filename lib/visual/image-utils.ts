/**
 * Utility helpers for delivering optimized imagery.
 * Mirrors the Responsive Implementation Guide in docs/VISUAL_CONTENT_SYSTEM.md.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type SizeConfig = {
  sm: string
  md: string
  lg: string
  xl: string
}

const SIZE_CONFIGS: Record<"hero" | "product" | "lifestyle" | "thumbnail", SizeConfig> = {
  hero: { sm: "100vw", md: "100vw", lg: "100vw", xl: "100vw" },
  product: { sm: "100vw", md: "50vw", lg: "33vw", xl: "25vw" },
  lifestyle: { sm: "100vw", md: "50vw", lg: "50vw", xl: "33vw" },
  thumbnail: { sm: "50vw", md: "33vw", lg: "25vw", xl: "20vw" },
}

export type ResponsiveImageType = keyof typeof SIZE_CONFIGS

/**
 * Generate a sizes attribute tailored to our immutable breakpoints.
 */
export function getResponsiveImageSizes(imageType: ResponsiveImageType): string {
  const config = SIZE_CONFIGS[imageType] ?? SIZE_CONFIGS.lifestyle

  return `(max-width: ${BREAKPOINTS.sm}px) ${config.sm}, (max-width: ${BREAKPOINTS.md}px) ${config.md}, (max-width: ${BREAKPOINTS.lg}px) ${config.lg}, ${config.xl}`
}

/**
 * Simple helper to pick the correct asset for the current viewport.
 */
export function resolveResponsiveImage(
  assets: { desktop: string; mobile?: string },
  isMobile: boolean
) {
  return isMobile && assets.mobile ? assets.mobile : assets.desktop
}
