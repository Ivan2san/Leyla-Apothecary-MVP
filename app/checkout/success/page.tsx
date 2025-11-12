import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { OrderService } from "@/lib/services/orders"
import { formatPrice, formatDate } from "@/lib/utils"
import { requireAuth } from "@/lib/auth/auth-helpers"

async function getOrderDetails(orderId: string) {
  try {
    const order = await OrderService.getOrder(orderId)
    return order
  } catch (error) {
    return null
  }
}

async function OrderSuccessContent({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  await requireAuth()

  const orderId = searchParams.order_id

  if (!orderId) {
    notFound()
  }

  const order = await getOrderDetails(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.created_at, 'long')}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-3">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(order.shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{order.shipping_address.fullName}</p>
              <p>{order.shipping_address.addressLine1}</p>
              {order.shipping_address.addressLine2 && (
                <p>{order.shipping_address.addressLine2}</p>
              )}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.zipCode}
              </p>
              <p>{order.shipping_address.country}</p>
              <p className="mt-2">Phone: {order.shipping_address.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Order Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email with your order details
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Processing Your Order</p>
                <p className="text-sm text-muted-foreground">
                  Your order is being prepared and will ship within 2-3 business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Tracking Information</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive tracking details once your order ships
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link href="/account">
            <Button variant="outline">View Order History</Button>
          </Link>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
