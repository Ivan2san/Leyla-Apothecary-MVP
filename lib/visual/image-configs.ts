/**
 * Centralized image configuration for the Leyla's Apothecary platform
 *
 * This file defines all image paths, dimensions, and configurations used
 * throughout the application. Update here to maintain consistency.
 *
 * @see docs/VISUAL_CONTENT_SYSTEM.md
 */

export const IMAGE_PATHS = {
  heroes: {
    homepage: '/images/heroes/homepage',
    about: '/images/heroes/about',
    products: '/images/heroes/products',
    booking: '/images/heroes/booking',
    blog: '/images/heroes/blog',
  },
  products: {
    tinctures: '/images/products/tinctures',
    salves: '/images/products/salves',
    collections: '/images/products/collections',
  },
  lifestyle: '/images/lifestyle',
  ingredients: '/images/ingredients',
  marketing: '/images/marketing',
  ui: '/images/ui',
} as const

export const IMAGE_DIMENSIONS = {
  hero: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 768, height: 1024 },
  },
  product: {
    main: { width: 2000, height: 2000 },
    thumbnail: { width: 400, height: 400 },
    preview: { width: 800, height: 800 },
  },
  lifestyle: {
    standard: { width: 1200, height: 800 },
    square: { width: 1080, height: 1080 },
  },
  marketing: {
    emailHeader: { width: 600, height: 200 },
    socialSquare: { width: 1080, height: 1080 },
    socialStory: { width: 1080, height: 1920 },
  },
} as const

export const IMAGE_QUALITY = {
  hero: 85,
  product: 90,
  lifestyle: 80,
  thumbnail: 75,
} as const

export const IMAGE_FORMATS = {
  preferred: 'webp',
  fallback: 'jpeg',
  lossless: 'png',
  vector: 'svg',
} as const

/**
 * Get responsive image sizes string for Next/Image component
 *
 * @param imageType - The type of image (hero, product, lifestyle, thumbnail)
 * @returns Sizes string for Next/Image sizes prop
 *
 * @example
 * <Image
 *   src="/image.jpg"
 *   sizes={getResponsiveImageSizes('hero')}
 *   ...
 * />
 */
export const getResponsiveImageSizes = (
  imageType: 'hero' | 'product' | 'lifestyle' | 'thumbnail'
): string => {
  const sizeConfigs = {
    hero: {
      sm: '100vw',
      md: '100vw',
      lg: '100vw',
      xl: '100vw',
    },
    product: {
      sm: '100vw',
      md: '50vw',
      lg: '33vw',
      xl: '25vw',
    },
    lifestyle: {
      sm: '100vw',
      md: '50vw',
      lg: '50vw',
      xl: '33vw',
    },
    thumbnail: {
      sm: '50vw',
      md: '33vw',
      lg: '25vw',
      xl: '20vw',
    },
  }

  const config = sizeConfigs[imageType]

  return `(max-width: 640px) ${config.sm}, (max-width: 768px) ${config.md}, (max-width: 1024px) ${config.lg}, ${config.xl}`
}
