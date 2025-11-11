"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { Product } from "@/types"
import { ShoppingCart, Check, Plus, Minus } from "lucide-react"
import { useState } from "react"

interface AddToCartSectionProps {
  product: Product
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem, getItemQuantity } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const itemInCart = getItemQuantity(product.id)

  const handleAddToCart = () => {
    addItem(product, quantity)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={increaseQuantity}
            disabled={quantity >= product.stock_quantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {itemInCart > 0 && (
          <span className="text-sm text-muted-foreground">
            ({itemInCart} in cart)
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1"
          disabled={product.stock_quantity === 0 || justAdded}
          onClick={handleAddToCart}
        >
          {justAdded ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Added to Cart!
            </>
          ) : product.stock_quantity === 0 ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
