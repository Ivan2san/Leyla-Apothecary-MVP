import type { BrandOverlayVariant } from "@/lib/visual/overlay-variants"

export type InventoryStatus = "ready" | "needs-optimization" | "pending-license"

export interface ImageInventoryItem {
  id: string
  filename: string
  category: string
  subcategory: string
  usage: string
  brandColors: string[]
  tags: string[]
  status: InventoryStatus
  optimized: boolean
  lastUpdated: string
  publicUrl?: string
}

export const IMAGE_INVENTORY: ImageInventoryItem[] = [
  {
    id: "hero-home-morning",
    filename: "2024-11-13_hero_homepage_morning-ritual_sage-overlay_v1.webp",
    category: "hero-banners",
    subcategory: "homepage",
    usage: "Homepage hero, personalization quiz CTA",
    brandColors: ["sage", "forest"],
    tags: ["morning", "tea", "ritual"],
    status: "ready",
    optimized: true,
    lastUpdated: "2025-02-10",
  },
  {
    id: "hero-booking-greenhouse",
    filename: "2025-02-05_hero_booking_greenhouse-focus_forest-gradient_v1.webp",
    category: "hero-banners",
    subcategory: "booking",
    usage: "Booking hero, appointments campaign",
    brandColors: ["forest", "warmWhite"],
    tags: ["consultation", "garden", "focus"],
    status: "needs-optimization",
    optimized: false,
    lastUpdated: "2025-02-05",
  },
  {
    id: "product-lavender-calm",
    filename: "2025-01-22_product_tincture_lavender-calm_primary_v3.webp",
    category: "products",
    subcategory: "tinctures",
    usage: "Product detail page primary image",
    brandColors: ["sage", "terracotta"],
    tags: ["lavender", "bottle", "still-life"],
    status: "ready",
    optimized: true,
    lastUpdated: "2025-01-25",
    publicUrl: "/images/products/tinctures/2025-01-22_product_tincture_lavender-calm_primary_v3.webp",
  },
  {
    id: "product-lavender-lifestyle",
    filename: "2025-01-22_product_tincture_lavender-calm_lifestyle_v1.webp",
    category: "products",
    subcategory: "lifestyle",
    usage: "Product card hover image",
    brandColors: ["warmWhite"],
    tags: ["wellness", "hands", "application"],
    status: "pending-license",
    optimized: false,
    lastUpdated: "2025-01-22",
     publicUrl: "/images/products/lifestyle/2025-01-22_product_tincture_lavender-calm_lifestyle_v1.webp",
  },
  {
    id: "lifestyle-workbench",
    filename: "2025-01-30_lifestyle_workspace_herbal-workbench_mobile_v1.webp",
    category: "lifestyle",
    subcategory: "workspace",
    usage: "Blog headers + educational articles",
    brandColors: ["forest", "warmWhite"],
    tags: ["studio", "herbs", "craft"],
    status: "needs-optimization",
    optimized: false,
    lastUpdated: "2025-01-30",
  },
]

export interface RecommendedAsset {
  id: string
  title: string
  description: string
  desktopSrc: string
  mobileSrc?: string
  overlay: BrandOverlayVariant
  priority: "hero" | "product" | "lifestyle"
}

export const RECOMMENDED_ASSETS: RecommendedAsset[] = [
  {
    id: "hero-home-spring",
    title: "Spring Ritual Hero",
    description: "Seasonal hero for homepage featuring morning sunlight + steam.",
    desktopSrc: "https://plus.unsplash.com/premium_photo-1675127366476-98e3f3acca8a?q=80&w=790",
    mobileSrc: "https://plus.unsplash.com/premium_photo-1675127366476-98e3f3acca8a?q=80&w=790",
    overlay: "sage-gradient",
    priority: "hero",
  },
  {
    id: "hero-booking-greenhouse",
    title: "Booking Greenhouse Hero",
    description: "Focus shot of Leyla reviewing charts in the greenhouse studio.",
    desktopSrc: "https://plus.unsplash.com/premium_photo-1675127366476-98e3f3acca8a?q=80&w=790",
    mobileSrc: "https://plus.unsplash.com/premium_photo-1675127366476-98e3f3acca8a?q=80&w=790",
    overlay: "forest-gradient",
    priority: "hero",
  },
  {
    id: "hero-products-collection",
    title: "Products Collection Hero",
    description: "Studio line-up of tinctures and botanicals for the catalog page.",
    desktopSrc: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2940",
    mobileSrc: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600",
    overlay: "terracotta-gradient",
    priority: "hero",
  },
  {
    id: "product-lavender-lifestyle",
    title: "Lavender Calm Lifestyle",
    description: "Hands cradling the tincture over linen — perfect card hover asset.",
    desktopSrc: "/images/products/tinctures/2025-01-22_product_tincture_lavender-calm_lifestyle_v1.webp",
    overlay: "warm-gradient",
    priority: "product",
  },
  {
    id: "lifestyle-workbench",
    title: "Workbench Process Shot",
    description: "Macro botanicals + tools for educational content headers.",
    desktopSrc: "/images/lifestyle/workspace/2025-01-30_lifestyle_workspace_herbal-workbench_mobile_v1.webp",
    overlay: "terracotta-gradient",
    priority: "lifestyle",
  },
]

export const getRecommendedAsset = (id: string) =>
  RECOMMENDED_ASSETS.find((asset) => asset.id === id)

export interface HeroAssignment {
  id: string
  page: string
  route: string
  description: string
  assetId: string
  mobileAssetId?: string | null
  overlay?: BrandOverlayVariant
}

export const HERO_ASSIGNMENTS: HeroAssignment[] = [
  {
    id: "home",
    page: "Homepage",
    route: "/",
    description: "Primary hero with personalization CTA.",
    assetId: "hero-home-spring",
    overlay: "sage-gradient",
  },
  {
    id: "products",
    page: "Products",
    route: "/products",
    description: "Catalog hero showcasing the full collection.",
    assetId: "hero-products-collection",
    overlay: "terracotta-gradient",
  },
  {
    id: "booking",
    page: "Booking",
    route: "/booking",
    description: "Consultation hero for lead-gen landing.",
    assetId: "hero-booking-greenhouse",
    overlay: "forest-gradient",
  },
]

export interface DirectoryNode {
  name: string
  children?: DirectoryNode[]
}

export const VISUAL_DIRECTORY_TREE: DirectoryNode[] = [
  {
    name: "public/images",
    children: [
      {
        name: "heroes",
        children: [
          { name: "homepage" },
          { name: "about" },
          { name: "products" },
          { name: "booking" },
          { name: "blog" },
          { name: "seasonal" },
        ],
      },
      {
        name: "products",
        children: [
          { name: "tinctures" },
          { name: "salves" },
          { name: "teas" },
          { name: "collections" },
          { name: "lifestyle" },
        ],
      },
      {
        name: "lifestyle",
        children: [
          { name: "wellness-routines" },
          { name: "process-shots" },
          { name: "workspace" },
          { name: "testimonials" },
        ],
      },
      {
        name: "ingredients",
        children: [
          { name: "fresh-herbs" },
          { name: "dried-herbs" },
          { name: "botanical-portraits" },
          { name: "macro-details" },
        ],
      },
      {
        name: "marketing",
        children: [
          { name: "email-headers" },
          { name: "social-media" },
          { name: "seasonal-campaigns" },
        ],
      },
      {
        name: "ui-elements",
        children: [
          { name: "category-icons" },
          { name: "badges" },
          { name: "decorative" },
        ],
      },
    ],
  },
]
