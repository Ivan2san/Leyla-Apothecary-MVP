import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AddToCartSection } from "@/components/products/add-to-cart-section"
import { ProductReviewsSection } from "@/components/products/product-reviews-section"

async function getProduct(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Product
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - Leyla's Apothecary`,
    description: product.description,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container py-12">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Placeholder */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🌿</div>
            <p className="text-muted-foreground">Product image coming soon</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-sm text-muted-foreground capitalize">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold mt-2 mb-4">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            <div className="text-muted-foreground">
              {product.volume_ml}ml
            </div>
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <AddToCartSection product={product} />

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                <ul className="space-y-1">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Dosage */}
          {product.dosage_instructions && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">Dosage Instructions</h3>
                <p className="text-muted-foreground">{product.dosage_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Contraindications */}
          {product.contraindications && product.contraindications.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 text-orange-900">
                  ⚠️ Important Safety Information
                </h3>
                <ul className="space-y-1">
                  {product.contraindications.map((warning, index) => (
                    <li key={index} className="text-orange-900/80">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ProductReviewsSection productId={product.id} />
      </div>
    </div>
  )
}
