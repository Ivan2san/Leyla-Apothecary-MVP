"use client"

import Link from "next/link"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { ProductImage } from "@/components/visual/product-image"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  const itemQuantity = getItemQuantity(product.id)
  const sortedImages = product.images?.slice().sort((a, b) => a.position - b.position)
  const primaryImage =
    sortedImages?.find((image) => image.type === "primary") ?? sortedImages?.[0]
  const lifestyleImage = sortedImages?.find((image) => image.type === "lifestyle")
  const fallbackImage = product.image_url ? { url: product.image_url, alt: product.name } : null
  const displayedImage = primaryImage ?? fallbackImage

  const handleAddToCart = () => {
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-4">
        {displayedImage ? (
          <ProductImage
            src={displayedImage.url}
            alt={displayedImage.alt || product.name}
            hoverSrc={lifestyleImage?.url}
          />
        ) : (
          <div className="aspect-square rounded-lg border border-dashed border-sage/40 bg-sage/5 flex items-center justify-center text-xs text-sage/80">
            Imagery in progress
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2">
          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Benefits:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {product.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {product.volume_ml}ml
            </span>
          </div>
          <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
            {product.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" className="w-full h-10" asChild>
            <Link href={`/products/${product.slug}`}>
              View Details
            </Link>
          </Button>
          <Button
            className="w-full h-10"
            disabled={product.stock_quantity === 0}
            onClick={handleAddToCart}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : product.stock_quantity === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
                {itemQuantity > 0 && ` (${itemQuantity})`}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
