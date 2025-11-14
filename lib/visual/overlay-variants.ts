/**
 * Brand overlay variants for hero banners and feature imagery
 *
 * These overlays use the immutable brand colors defined in PROJECT_RULES.md
 * NEVER change these color values without explicit approval.
 *
 * @see docs/VISUAL_CONTENT_SYSTEM.md
 * @see .claude/PROJECT_RULES.md
 */

export const BRAND_COLORS = {
  forest: '#344E41',
  sage: '#A3B18A',
  terracotta: '#D98C4A',
  warmWhite: '#FDFBF8',
} as const

export type BrandOverlayVariant =
  | 'sage'
  | 'terracotta'
  | 'forest'
  | 'sage-gradient'
  | 'terracotta-gradient'
  | 'forest-gradient'
  | 'warm-gradient'
  | 'none'

/**
 * Desktop overlay styles using brand colors
 * Opacity values: 0.6-0.8 for good text readability while showing image
 */
export const OVERLAY_STYLES: Record<BrandOverlayVariant, string> = {
  // Solid color overlays
  sage: `linear-gradient(180deg,
    rgba(163, 177, 138, 0.7) 0%,
    rgba(163, 177, 138, 0.6) 50%,
    rgba(52, 78, 65, 0.8) 100%
  )`,

  terracotta: `linear-gradient(180deg,
    rgba(217, 140, 74, 0.7) 0%,
    rgba(217, 140, 74, 0.6) 50%,
    rgba(52, 78, 65, 0.8) 100%
  )`,

  forest: `linear-gradient(180deg,
    rgba(52, 78, 65, 0.7) 0%,
    rgba(52, 78, 65, 0.8) 50%,
    rgba(52, 78, 65, 0.9) 100%
  )`,

  // Gradient overlays (multi-color blends)
  'sage-gradient': `linear-gradient(135deg,
    rgba(163, 177, 138, 0.8) 0%,
    rgba(52, 78, 65, 0.7) 50%,
    rgba(163, 177, 138, 0.6) 100%
  )`,

  'terracotta-gradient': `linear-gradient(135deg,
    rgba(217, 140, 74, 0.8) 0%,
    rgba(163, 177, 138, 0.6) 50%,
    rgba(52, 78, 65, 0.7) 100%
  )`,

  'forest-gradient': `linear-gradient(135deg,
    rgba(52, 78, 65, 0.9) 0%,
    rgba(163, 177, 138, 0.6) 50%,
    rgba(52, 78, 65, 0.8) 100%
  )`,

  'warm-gradient': `linear-gradient(135deg,
    rgba(217, 140, 74, 0.7) 0%,
    rgba(253, 251, 248, 0.3) 50%,
    rgba(163, 177, 138, 0.6) 100%
  )`,

  // No overlay
  none: '',
}

/**
 * Mobile-specific overlays with higher opacity for better text readability
 * Opacity values: 0.85-0.95 for clear text on small screens
 */
export const MOBILE_OVERLAY_STYLES: Record<BrandOverlayVariant, string> = {
  sage: `linear-gradient(180deg,
    rgba(163, 177, 138, 0.85) 0%,
    rgba(52, 78, 65, 0.9) 100%
  )`,

  terracotta: `linear-gradient(180deg,
    rgba(217, 140, 74, 0.85) 0%,
    rgba(52, 78, 65, 0.9) 100%
  )`,

  forest: `linear-gradient(180deg,
    rgba(52, 78, 65, 0.9) 0%,
    rgba(52, 78, 65, 0.95) 100%
  )`,

  'sage-gradient': `linear-gradient(135deg,
    rgba(163, 177, 138, 0.9) 0%,
    rgba(52, 78, 65, 0.85) 100%
  )`,

  'terracotta-gradient': `linear-gradient(135deg,
    rgba(217, 140, 74, 0.9) 0%,
    rgba(52, 78, 65, 0.85) 100%
  )`,

  'forest-gradient': `linear-gradient(135deg,
    rgba(52, 78, 65, 0.95) 0%,
    rgba(163, 177, 138, 0.8) 100%
  )`,

  'warm-gradient': `linear-gradient(135deg,
    rgba(217, 140, 74, 0.85) 0%,
    rgba(163, 177, 138, 0.8) 100%
  )`,

  none: '',
}

/**
 * Optional texture overlay for sophisticated look
 * Apply on top of color overlay for added depth
 */
export const TEXTURE_OVERLAY = `repeating-linear-gradient(
  45deg,
  transparent,
  transparent 35px,
  rgba(255, 255, 255, 0.05) 35px,
  rgba(255, 255, 255, 0.05) 70px
)`
