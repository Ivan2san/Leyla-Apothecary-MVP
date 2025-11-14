# Leyla's Apothecary - Visual Content System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Content Taxonomy & Naming Conventions](#content-taxonomy--naming-conventions)
3. [Codebase Structure for Visual Assets](#codebase-structure-for-visual-assets)
4. [Hero Banner System](#hero-banner-system)
5. [Image Sourcing Strategy](#image-sourcing-strategy)
6. [Responsive Implementation Guide](#responsive-implementation-guide)
7. [Component Usage Patterns](#component-usage-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Team Documentation Framework](#team-documentation-framework)

---

## System Overview

### Purpose
This Visual Content System provides a scalable, maintainable architecture for managing all visual assets across the Leyla's Apothecary e-commerce platform. It integrates with the existing [Photography Guide](./Leylas_Apothecary_Image_Photography_Guide.md) and [Brand Color System](./BRAND_COLOR_SYSTEM.md) to create a unified approach to visual content.

### Core Principles
1. **Brand Consistency**: All visuals must adhere to immutable brand colors and aesthetic
2. **Performance First**: Optimized delivery using Next.js Image component
3. **Scalability**: System grows with platform without technical debt
4. **Maintainability**: Clear conventions and documentation
5. **Accessibility**: Alt text, ARIA labels, and semantic HTML

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Visual Content System                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Hero Banners │  │   Product    │  │  Lifestyle   │    │
│  │              │  │  Photography │  │   Content    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Educational  │  │   Marketing  │  │  Seasonal    │    │
│  │  Infographics│  │   Campaign   │  │   Content    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              Content Delivery & Optimization                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Next/Image   │  │    WebP      │  │  Lazy Load   │    │
│  │  Component   │  │  Conversion  │  │   Strategy   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Taxonomy & Naming Conventions

### File Naming Standard

All visual assets must follow this strict naming convention:

```
{DATE}_{CATEGORY}_{SUBCATEGORY}_{DESCRIPTION}_{VARIANT}_{VERSION}.{EXT}

Examples:
2024-11-13_hero_homepage_morning-ritual_sage-overlay_v1.webp
2024-11-13_product_tincture_lavender-calm_lifestyle_v2.jpg
2024-11-13_lifestyle_wellness_yoga-morning_mobile_v1.webp
2024-11-13_marketing_email_winter-campaign_header_v1.png
```

#### Naming Components Explained

| Component | Format | Example | Required |
|-----------|--------|---------|----------|
| Date | `YYYY-MM-DD` | `2024-11-13` | Yes |
| Category | `lowercase-hyphen` | `hero`, `product`, `lifestyle` | Yes |
| Subcategory | `lowercase-hyphen` | `homepage`, `tincture`, `wellness` | Yes |
| Description | `lowercase-hyphen` | `morning-ritual`, `lavender-calm` | Yes |
| Variant | `lowercase-hyphen` | `sage-overlay`, `mobile`, `hover` | Optional |
| Version | `v{number}` | `v1`, `v2`, `v3` | Yes |
| Extension | `lowercase` | `webp`, `jpg`, `png`, `svg` | Yes |

### Content Category Taxonomy

```
visual-assets/
├── hero-banners/
│   ├── homepage/
│   ├── about/
│   ├── products/
│   ├── booking/
│   ├── blog/
│   └── seasonal/
├── products/
│   ├── individual/
│   │   ├── tinctures/
│   │   ├── salves/
│   │   └── teas/
│   ├── collections/
│   ├── lifestyle/
│   └── hover-states/
├── lifestyle/
│   ├── wellness-routines/
│   ├── process-shots/
│   ├── workspace/
│   └── testimonials/
├── ingredients/
│   ├── fresh-herbs/
│   ├── dried-herbs/
│   ├── botanical-portraits/
│   └── macro-details/
├── educational/
│   ├── infographics/
│   ├── diagrams/
│   ├── process-flows/
│   └── icons/
├── marketing/
│   ├── email-headers/
│   ├── social-media/
│   │   ├── instagram/
│   │   ├── facebook/
│   │   └── pinterest/
│   ├── promotional/
│   └── seasonal-campaigns/
├── ui-elements/
│   ├── category-icons/
│   ├── loading-animations/
│   ├── badges/
│   └── decorative/
└── brand/
    ├── logos/
    ├── patterns/
    └── textures/
```

### Metadata Tagging System

Every image file should include metadata tags for searchability:

```typescript
// Example metadata structure
interface ImageMetadata {
  id: string
  filename: string
  category: ContentCategory
  subcategory: string
  tags: string[]
  brandColors: BrandColor[]
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  mood: string[]
  usageRights: 'owned' | 'licensed' | 'stock'
  photographer?: string
  dateCreated: string
  dimensions: {
    width: number
    height: number
  }
  fileSize: number
  optimized: boolean
}

// Example usage
const imageMetadata: ImageMetadata = {
  id: "hero-homepage-001",
  filename: "2024-11-13_hero_homepage_morning-ritual_sage-overlay_v1.webp",
  category: "hero-banners",
  subcategory: "homepage",
  tags: ["morning", "ritual", "tea", "herbs", "wellness", "peaceful"],
  brandColors: ["sage", "forest", "warmWhite"],
  season: "spring",
  mood: ["calm", "nurturing", "intentional"],
  usageRights: "stock",
  photographer: "Unsplash - Manki Kim",
  dateCreated: "2024-11-13",
  dimensions: { width: 1920, height: 1080 },
  fileSize: 185000, // bytes
  optimized: true
}
```

---

## Codebase Structure for Visual Assets

### Directory Structure

```
leyla-apothecary/
├── public/
│   └── images/
│       ├── heroes/                    # Hero banner images
│       │   ├── homepage/
│       │   ├── about/
│       │   ├── products/
│       │   ├── booking/
│       │   └── blog/
│       ├── products/                  # Product photography
│       │   ├── tinctures/
│       │   ├── salves/
│       │   └── collections/
│       ├── lifestyle/                 # Lifestyle photography
│       ├── ingredients/               # Botanical photography
│       ├── marketing/                 # Campaign imagery
│       ├── ui/                        # UI elements
│       │   ├── icons/
│       │   ├── patterns/
│       │   └── textures/
│       └── placeholders/              # Loading placeholders
├── components/
│   └── visual/
│       ├── HeroBanner.tsx            # Enhanced hero component
│       ├── ProductImage.tsx          # Product image component
│       ├── LifestyleImage.tsx        # Lifestyle image component
│       ├── BrandOverlay.tsx          # Reusable overlay component
│       └── ImageWithFallback.tsx     # Error handling wrapper
├── lib/
│   └── visual/
│       ├── image-configs.ts          # Centralized image configs
│       ├── overlay-variants.ts       # Brand overlay definitions
│       ├── image-loaders.ts          # Custom image loaders
│       └── image-utils.ts            # Helper functions
└── docs/
    ├── VISUAL_CONTENT_SYSTEM.md      # This document
    ├── IMAGE_SOURCING_GUIDE.md       # Detailed sourcing guide
    └── COMPONENT_USAGE_GUIDE.md      # Component documentation
```

### Configuration Files

#### 1. Image Configuration (`lib/visual/image-configs.ts`)

```typescript
/**
 * Centralized image configuration for the Leyla's Apothecary platform
 *
 * This file defines all image paths, dimensions, and configurations used
 * throughout the application. Update here to maintain consistency.
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
```

#### 2. Brand Overlay Variants (`lib/visual/overlay-variants.ts`)

```typescript
/**
 * Brand overlay variants for hero banners and feature imagery
 *
 * These overlays use the immutable brand colors defined in PROJECT_RULES.md
 * NEVER change these color values without explicit approval.
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

export const OVERLAY_STYLES: Record<BrandOverlayVariant, string> = {
  // Solid color overlays
  sage: `
    background: linear-gradient(180deg,
      rgba(163, 177, 138, 0.7) 0%,
      rgba(163, 177, 138, 0.6) 50%,
      rgba(52, 78, 65, 0.8) 100%
    );
  `,
  terracotta: `
    background: linear-gradient(180deg,
      rgba(217, 140, 74, 0.7) 0%,
      rgba(217, 140, 74, 0.6) 50%,
      rgba(52, 78, 65, 0.8) 100%
    );
  `,
  forest: `
    background: linear-gradient(180deg,
      rgba(52, 78, 65, 0.7) 0%,
      rgba(52, 78, 65, 0.8) 50%,
      rgba(52, 78, 65, 0.9) 100%
    );
  `,

  // Gradient overlays (multi-color)
  'sage-gradient': `
    background: linear-gradient(135deg,
      rgba(163, 177, 138, 0.8) 0%,
      rgba(52, 78, 65, 0.7) 50%,
      rgba(163, 177, 138, 0.6) 100%
    );
  `,
  'terracotta-gradient': `
    background: linear-gradient(135deg,
      rgba(217, 140, 74, 0.8) 0%,
      rgba(163, 177, 138, 0.6) 50%,
      rgba(52, 78, 65, 0.7) 100%
    );
  `,
  'forest-gradient': `
    background: linear-gradient(135deg,
      rgba(52, 78, 65, 0.9) 0%,
      rgba(163, 177, 138, 0.6) 50%,
      rgba(52, 78, 65, 0.8) 100%
    );
  `,
  'warm-gradient': `
    background: linear-gradient(135deg,
      rgba(217, 140, 74, 0.7) 0%,
      rgba(253, 251, 248, 0.3) 50%,
      rgba(163, 177, 138, 0.6) 100%
    );
  `,

  // No overlay
  none: '',
}

// Mobile-specific overlays (increased opacity for text readability)
export const MOBILE_OVERLAY_STYLES: Record<BrandOverlayVariant, string> = {
  sage: `
    background: linear-gradient(180deg,
      rgba(163, 177, 138, 0.85) 0%,
      rgba(52, 78, 65, 0.9) 100%
    );
  `,
  terracotta: `
    background: linear-gradient(180deg,
      rgba(217, 140, 74, 0.85) 0%,
      rgba(52, 78, 65, 0.9) 100%
    );
  `,
  forest: `
    background: linear-gradient(180deg,
      rgba(52, 78, 65, 0.9) 0%,
      rgba(52, 78, 65, 0.95) 100%
    );
  `,
  'sage-gradient': `
    background: linear-gradient(135deg,
      rgba(163, 177, 138, 0.9) 0%,
      rgba(52, 78, 65, 0.85) 100%
    );
  `,
  'terracotta-gradient': `
    background: linear-gradient(135deg,
      rgba(217, 140, 74, 0.9) 0%,
      rgba(52, 78, 65, 0.85) 100%
    );
  `,
  'forest-gradient': `
    background: linear-gradient(135deg,
      rgba(52, 78, 65, 0.95) 0%,
      rgba(163, 177, 138, 0.8) 100%
    );
  `,
  'warm-gradient': `
    background: linear-gradient(135deg,
      rgba(217, 140, 74, 0.85) 0%,
      rgba(163, 177, 138, 0.8) 100%
    );
  `,
  none: '',
}

// Optional texture overlay for sophisticated look
export const TEXTURE_OVERLAY = `
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 35px,
    rgba(255, 255, 255, 0.05) 35px,
    rgba(255, 255, 255, 0.05) 70px
  );
  opacity: 0.1;
`
```

---

## Hero Banner System

### Enhanced HeroBanner Component

The existing `HeroBanner` component will be enhanced to support brand-specific overlays:

```typescript
// components/visual/HeroBanner.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BrandOverlayVariant, OVERLAY_STYLES, MOBILE_OVERLAY_STYLES } from "@/lib/visual/overlay-variants"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

interface HeroBannerProps {
  title: string
  subtitle?: string
  description?: string
  imageSrc: string
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
  imageAlt,
  primaryCTA,
  secondaryCTA,
  overlay = "sage-gradient", // Default to brand overlay
  height = "large",
  textAlign = "center",
  textPosition = "center",
  withTexture = false,
  className,
}: HeroBannerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Use mobile-specific overlays for better text readability
  const getOverlayStyle = () => {
    if (overlay === "none") return ""

    // Handle legacy overlay types
    if (["light", "dark", "gradient"].includes(overlay)) {
      const legacyOverlays = {
        light: "bg-white/60",
        dark: "bg-black/60",
        gradient: "bg-gradient-to-b from-black/40 via-black/30 to-black/50",
      }
      return legacyOverlays[overlay as keyof typeof legacyOverlays]
    }

    // Handle brand overlays
    const overlayStyles = isMobile ? MOBILE_OVERLAY_STYLES : OVERLAY_STYLES
    return overlayStyles[overlay as BrandOverlayVariant]
  }

  // Height, text alignment, and position classes remain the same...
  // [Previous implementation code]

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
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />

        {/* Brand Color Overlay */}
        {overlay !== "none" && (
          <div
            className="absolute inset-0"
            style={{ background: getOverlayStyle() }}
          />
        )}

        {/* Optional Texture Overlay */}
        {withTexture && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255,255,255,0.05) 35px,
                rgba(255,255,255,0.05) 70px
              )`
            }}
          />
        )}
      </div>

      {/* Content - remains the same as existing implementation */}
      {/* [Previous implementation code for content] */}
    </section>
  )
}
```

### Hero Banner Usage Patterns

#### Homepage Hero
```typescript
<HeroBanner
  title="Natural Wellness, Powered by AI"
  subtitle="Where Nature Meets Technology"
  description="Personalized herbal remedies crafted for your unique wellness journey"
  imageSrc="/images/heroes/homepage/morning-ritual-sage.webp"
  imageAlt="Peaceful morning herbal tea ritual with fresh herbs on wooden table"
  overlay="sage-gradient"
  height="large"
  textAlign="center"
  textPosition="center"
  withTexture={true}
  primaryCTA={{
    text: "Take Wellness Quiz",
    href: "/quiz"
  }}
  secondaryCTA={{
    text: "Explore Products",
    href: "/products"
  }}
/>
```

#### About Page Hero
```typescript
<HeroBanner
  title="Meet Leyla"
  subtitle="Your Holistic Health Partner"
  description="15 years of naturopathic expertise, now enhanced with AI precision"
  imageSrc="/images/heroes/about/leyla-garden.webp"
  imageAlt="Leyla examining fresh herbs in her garden"
  overlay="forest-gradient"
  height="medium"
  textAlign="left"
  textPosition="center"
  primaryCTA={{
    text: "Book Consultation",
    href: "/booking"
  }}
/>
```

#### Products Page Hero
```typescript
<HeroBanner
  title="Our Apothecary"
  subtitle="Handcrafted with Care"
  description="Premium tinctures, salves, and custom compounds for your wellness"
  imageSrc="/images/heroes/products/apothecary-cabinet.webp"
  imageAlt="Elegant amber bottles arranged on wooden shelves"
  overlay="terracotta-gradient"
  height="medium"
  textAlign="center"
  primaryCTA={{
    text: "Shop All Products",
    href: "/products"
  }}
/>
```

#### Booking Page Hero
```typescript
<HeroBanner
  title="Book Your Consultation"
  subtitle="Personalized Naturopathic Care"
  description="Virtual consultations available - Start your healing journey today"
  imageSrc="/images/heroes/booking/consultation-space.webp"
  imageAlt="Cozy consultation room with plants and herbal tea"
  overlay="warm-gradient"
  height="medium"
  textAlign="center"
  textPosition="center"
  primaryCTA={{
    text: "Schedule Now",
    href: "/booking#calendar"
  }}
/>
```

---

## Image Sourcing Strategy

### Unsplash Collections

Create curated Unsplash collections for each content category:

#### Hero Banner Images

**Apothecary & Herbal Medicine**
- Collection URL: `https://unsplash.com/collections/apothecary-herbs`
- Keywords: "herbal medicine", "apothecary bottles", "tincture", "amber bottles", "herbal workspace"

Recommended Images:
1. **Apothecary Cabinet**
   - URL: `https://unsplash.com/photos/amber-bottles-on-shelf`
   - Photographer: Conscious Design
   - Use: Products page hero
   - Overlay: Terracotta gradient

2. **Mortar & Pestle with Fresh Herbs**
   - URL: `https://unsplash.com/photos/mortar-pestle-herbs`
   - Photographer: Conscious Design
   - Use: Homepage alternate hero
   - Overlay: Sage gradient

3. **Herbal Tea Morning Ritual**
   - URL: `https://unsplash.com/photos/herbal-tea-morning`
   - Photographer: Manki Kim
   - Use: Homepage primary hero
   - Overlay: Warm gradient

#### Lifestyle & Wellness

**Morning Routines**
- Collection URL: `https://unsplash.com/collections/morning-wellness`
- Keywords: "morning ritual", "herbal tea", "wellness routine", "peaceful morning"

Recommended Images:
1. **Woman with Herbal Tea**
   - URL: `https://unsplash.com/photos/woman-herbal-tea`
   - Photographer: Thought Catalog
   - Use: Lifestyle content
   - Overlay: Sage

2. **Yoga & Mindfulness**
   - URL: `https://unsplash.com/photos/yoga-home`
   - Photographer: Elina Fairytale
   - Use: Wellness journey imagery
   - Overlay: Forest gradient

#### Botanical & Ingredients

**Fresh Herbs**
- Collection URL: `https://unsplash.com/collections/fresh-herbs`
- Keywords: "lavender", "chamomile", "mint", "basil", "fresh herbs", "garden"

Recommended Images:
1. **Lavender Field**
   - URL: `https://unsplash.com/photos/lavender-field-purple`
   - Photographer: Cosmic Timetraveler
   - Use: Product backgrounds, email headers
   - Overlay: None (use as-is)

2. **Herb Bundles Drying**
   - URL: `https://unsplash.com/photos/dried-herb-bundles`
   - Photographer: Conscious Design
   - Use: Process shots, educational content
   - Overlay: Light sage tint

### Stock Photo Requirements

When sourcing images, ensure they meet these criteria:

#### Technical Requirements
- **Minimum Resolution**: 1920x1080px for heroes, 2000x2000px for products
- **Format**: RAW or high-quality JPEG (can be converted to WebP)
- **Color Space**: sRGB for web
- **File Size**: Source images can be large (will be optimized)

#### Aesthetic Requirements
- **Lighting**: Warm, natural, soft shadows
- **Color Palette**: Aligns with brand colors (sage, terracotta, forest, warm white)
- **Composition**: 40-60% negative space
- **Style**: Organic, slightly imperfect, authentic
- **Mood**: Calm, nurturing, professional yet approachable

#### Content Requirements
- **No competing brands**: No visible logos or brand names
- **Authentic**: Avoid overly staged or "stock photo" feeling
- **Diverse representation**: Various ages, ethnicities, body types
- **Rights**: Commercial use license required
- **Model releases**: Required for recognizable people

### Image Procurement Workflow

```
1. Research & Curation
   └─> Browse Unsplash/Pexels collections
   └─> Save potential images to mood board
   └─> Tag with intended use and overlay

2. Selection & Download
   └─> Download highest resolution available
   └─> Save to /source-images/ (not in public/)
   └─> Record photographer credit and license

3. Processing
   └─> Apply brand color grading preset
   └─> Crop to required dimensions
   └─> Convert to WebP with JPEG fallback
   └─> Optimize file size (<200KB)

4. Organization
   └─> Rename per naming convention
   └─> Move to appropriate public/images/ folder
   └─> Add metadata to image database
   └─> Update documentation

5. Implementation
   └─> Create component usage example
   └─> Test across devices
   └─> Measure performance impact
   └─> Deploy to staging
```

---

## Responsive Implementation Guide

### Breakpoint Strategy

Following the immutable breakpoints from PROJECT_RULES.md:

```typescript
const BREAKPOINTS = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
} as const
```

### Image Size Strategy

```typescript
// lib/visual/image-utils.ts

export const getResponsiveImageSizes = (imageType: string): string => {
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

  const config = sizeConfigs[imageType] || sizeConfigs.lifestyle

  return `
    (max-width: 640px) ${config.sm},
    (max-width: 768px) ${config.md},
    (max-width: 1024px) ${config.lg},
    ${config.xl}
  `
}
```

### Mobile-Specific Considerations

#### Hero Banners on Mobile
```typescript
// Use vertical images for mobile portrait orientation
const heroImage = {
  desktop: '/images/heroes/homepage/morning-ritual-landscape.webp',
  mobile: '/images/heroes/homepage/morning-ritual-portrait.webp',
}

// In component:
const imageSrc = isMobile ? heroImage.mobile : heroImage.desktop
```

#### Overlay Opacity on Mobile
As defined in `MOBILE_OVERLAY_STYLES`, mobile devices receive higher opacity overlays (0.85-0.95) for better text readability on smaller screens.

#### Text Sizing on Mobile
```typescript
// Responsive text classes
const textClasses = {
  title: "text-3xl md:text-5xl lg:text-6xl xl:text-7xl",
  subtitle: "text-sm md:text-base lg:text-lg",
  description: "text-base md:text-lg lg:text-xl xl:text-2xl",
}
```

---

## Component Usage Patterns

### Product Image Component

```typescript
// components/visual/ProductImage.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

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
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div
      className={cn("relative aspect-square overflow-hidden", className)}
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
          isLoading ? "blur-sm" : "blur-0"
        )}
        sizes={sizes}
        quality={90}
        onLoadingComplete={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-sage/10 animate-pulse" />
      )}
    </div>
  )
}
```

### Usage Example

```typescript
// In a product card
<ProductImage
  src="/images/products/tinctures/lavender-calm-main.webp"
  alt="Lavender Calm Tincture - 30ml amber bottle"
  hoverSrc="/images/products/tinctures/lavender-calm-lifestyle.webp"
  priority={isAboveFold}
  className="rounded-lg"
/>
```

---

## Performance Optimization

### Image Optimization Checklist

- [ ] All images use Next/Image component
- [ ] Appropriate `priority` prop for above-fold images
- [ ] Correct `sizes` prop for responsive loading
- [ ] Quality setting optimized (85 for heroes, 90 for products)
- [ ] WebP format with JPEG fallback
- [ ] File sizes under 200KB
- [ ] Lazy loading for below-fold images
- [ ] Placeholder blur for loading states
- [ ] Alt text for accessibility

### Automated Optimization Script

```bash
# scripts/optimize-images.sh
#!/bin/bash

# Convert and optimize images to WebP format
for img in public/images/**/*.{jpg,jpeg,png}; do
  filename="${img%.*}"

  # Convert to WebP
  cwebp -q 85 "$img" -o "${filename}.webp"

  # Keep original as fallback
  echo "Optimized: ${filename}.webp"
done

echo "Image optimization complete!"
```

### Performance Monitoring

```typescript
// lib/visual/performance-monitor.ts

export const logImagePerformance = (imageName: string, loadTime: number) => {
  if (loadTime > 2000) {
    console.warn(`Slow image load: ${imageName} took ${loadTime}ms`)
  }

  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'image_load', {
      image_name: imageName,
      load_time: loadTime,
      page_path: window.location.pathname,
    })
  }
}
```

---

## Team Documentation Framework

### For Developers

#### Quick Start Guide
1. Read this document fully
2. Review [BRAND_COLOR_SYSTEM.md](./BRAND_COLOR_SYSTEM.md)
3. Review [Photography Guide](./Leylas_Apothecary_Image_Photography_Guide.md)
4. Understand image naming conventions
5. Use provided components (HeroBanner, ProductImage, etc.)
6. Never modify brand colors
7. Always use Next/Image component
8. Test on multiple devices
9. Run performance checks
10. Update documentation when adding new patterns

#### Component Documentation Template

For each new visual component, document:

```markdown
## ComponentName

### Purpose
[Brief description of what this component does]

### Props
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| prop1 | string | - | Yes | Description |

### Usage Examples
\`\`\`typescript
// Basic usage
<ComponentName prop1="value" />

// Advanced usage
<ComponentName
  prop1="value"
  prop2="value"
/>
\`\`\`

### Accessibility
- [ ] Alt text provided
- [ ] Keyboard navigable
- [ ] Screen reader friendly

### Performance
- Expected load time: <Xms
- File size budget: <XKB
- Lazy loaded: Yes/No
```

### For Content Creators

#### Image Upload Checklist

Before uploading any image:

1. **File Naming**
   - [ ] Follows naming convention
   - [ ] Includes date (YYYY-MM-DD)
   - [ ] Includes category and subcategory
   - [ ] Includes descriptive name
   - [ ] Includes version number
   - [ ] Uses correct file extension

2. **Technical Quality**
   - [ ] Meets minimum resolution requirements
   - [ ] Properly color graded (warm tones)
   - [ ] Optimized file size (<200KB for web)
   - [ ] Converted to WebP (with JPEG fallback)

3. **Brand Alignment**
   - [ ] Uses brand color palette
   - [ ] Matches brand aesthetic (natural, warm, authentic)
   - [ ] No competing brands visible
   - [ ] Appropriate mood and tone

4. **Legal Compliance**
   - [ ] Has commercial use rights
   - [ ] Model releases obtained (if applicable)
   - [ ] Photographer credited
   - [ ] License documented

5. **Metadata**
   - [ ] Alt text written
   - [ ] Tags added
   - [ ] Category assigned
   - [ ] Usage notes documented

### For Designers

#### Design Handoff Requirements

When providing image assets:

1. **File Formats**
   - Source: Figma/Sketch files
   - Export: PNG at 2x resolution
   - Final: WebP conversion (handled by dev)

2. **Overlays & Effects**
   - Document overlay variant used
   - Provide blend mode and opacity values
   - Include texture settings if applicable

3. **Responsive Variations**
   - Desktop version (1920x1080)
   - Tablet version (1024x768)
   - Mobile version (768x1024)

4. **Brand Compliance**
   - Use only approved brand colors
   - Follow typography guidelines
   - Maintain consistent spacing
   - Reference existing patterns

---

## Conclusion

This Visual Content System provides a comprehensive, scalable framework for managing all visual assets across the Leyla's Apothecary platform. By following these guidelines, the team can ensure brand consistency, optimal performance, and maintainability as the platform grows.

### Key Takeaways

1. **Naming Matters**: Consistent naming enables easy search and organization
2. **Brand Colors are Immutable**: Never deviate from approved colors
3. **Performance is Critical**: Optimize every image for web delivery
4. **Components are Reusable**: Use provided components, don't reinvent
5. **Documentation is Essential**: Keep this guide updated as patterns evolve

### Next Steps

1. Review this document with the full team
2. Implement enhanced HeroBanner component
3. Migrate existing images to new naming convention
4. Create Unsplash collections
5. Set up automated image optimization
6. Train team on new workflows
7. Monitor performance metrics
8. Iterate based on user feedback

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Maintained By**: Development Team
**Related Documents**:
- [Photography Guide](./Leylas_Apothecary_Image_Photography_Guide.md)
- [Brand Color System](./BRAND_COLOR_SYSTEM.md)
- [Project Rules](../.claude/PROJECT_RULES.md)

**Questions or Suggestions?** Open an issue in the repository.
