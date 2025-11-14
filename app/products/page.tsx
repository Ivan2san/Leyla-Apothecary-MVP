import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/products/product-card"
import { Product } from "@/types"
import { HeroBanner } from "@/components/ui/hero-banner"
import { getHeroAsset } from "@/lib/visual/hero-config"

export const metadata = {
  title: "Herbal Tinctures - Leyla's Apothecary",
  description: "Browse our collection of premium herbal tinctures for natural wellness",
}

async function getProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = Array.from(new Set(data.map(p => p.category)))
  return categories
}

export default async function ProductsPage() {
  const [products, categories, heroAsset] = await Promise.all([
    getProducts(),
    getCategories(),
    getHeroAsset("products"),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner
        title="Premium Herbal Tinctures"
        subtitle="Shop Our Collection"
        description="Discover high-quality herbal extracts, carefully crafted for your wellness journey"
        imageSrc={heroAsset.desktopSrc ?? "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=2940"}
        mobileImageSrc={heroAsset.mobileSrc}
        imageAlt="Collection of herbal tincture bottles"
        height="medium"
        textAlign="center"
        overlay={heroAsset.overlay}
        withTexture
      />

      <div className="container py-12">

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors capitalize"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No products found. Check back soon!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {products.length} products
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  )
}
