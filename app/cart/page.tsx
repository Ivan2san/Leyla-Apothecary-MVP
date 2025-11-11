"use client"

import { useCartStore } from "@/lib/store/cart"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, X, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore()

  const totalPrice = getTotalPrice()
  const shippingCost = totalPrice > 50 ? 0 : 5.99
  const finalTotal = totalPrice + shippingCost

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Link href="/products">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-xl font-semibold hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.category} • {item.product.volume_ml}ml
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.product.description}
                    </p>

                    {/* Stock Warning */}
                    {item.product.stock_quantity <= 5 && (
                      <p className="text-sm text-orange-600 mt-2">
                        Only {item.product.stock_quantity} left in stock
                      </p>
                    )}

                    {/* Price */}
                    <p className="text-2xl font-bold text-primary mt-4">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-3 border rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xl font-bold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Clear Cart Button */}
          <div className="flex justify-between items-center pt-4">
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  confirm("Are you sure you want to clear your entire cart?")
                ) {
                  clearCart()
                }
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {totalPrice < 50 && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Add {formatPrice(50 - totalPrice)} more for free shipping!
                </p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Link href="/checkout" className="w-full">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Secure checkout • Free returns • Money-back guarantee
              </p>
            </CardFooter>
          </Card>

          {/* Trust Badges */}
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Secure SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Expert naturopathy support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
