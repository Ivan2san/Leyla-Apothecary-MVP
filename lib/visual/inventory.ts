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
  title: string
  description: string
  desktopSrc: string
  mobileSrc?: string
  overlay: string
  priority: "hero" | "product" | "lifestyle"
}

export const RECOMMENDED_ASSETS: RecommendedAsset[] = [
  {
    title: "Spring Ritual Hero",
    description: "Seasonal hero for homepage featuring morning sunlight + steam.",
    desktopSrc: "/images/heroes/homepage/2025-02-10_hero_homepage_spring-ritual_sage-overlay_v1.webp",
    mobileSrc: "/images/heroes/homepage/2025-02-10_hero_homepage_spring-ritual_sage-overlay_mobile_v1.webp",
    overlay: "sage-gradient",
    priority: "hero",
  },
  {
    title: "Booking Greenhouse Hero",
    description: "Focus shot of Leyla reviewing charts in the greenhouse studio.",
    desktopSrc: "/images/heroes/booking/2025-02-05_hero_booking_greenhouse-focus_forest-gradient_v1.webp",
    mobileSrc: "/images/heroes/booking/2025-02-05_hero_booking_greenhouse-focus_forest-gradient_mobile_v1.webp",
    overlay: "forest-gradient",
    priority: "hero",
  },
  {
    title: "Lavender Calm Lifestyle",
    description: "Hands cradling the tincture over linen — perfect card hover asset.",
    desktopSrc: "/images/products/tinctures/2025-01-22_product_tincture_lavender-calm_lifestyle_v1.webp",
    overlay: "warm-gradient",
    priority: "product",
  },
  {
    title: "Workbench Process Shot",
    description: "Macro botanicals + tools for educational content headers.",
    desktopSrc: "/images/lifestyle/workspace/2025-01-30_lifestyle_workspace_herbal-workbench_mobile_v1.webp",
    overlay: "terracotta-gradient",
    priority: "lifestyle",
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
