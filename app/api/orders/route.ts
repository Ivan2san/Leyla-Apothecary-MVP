import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrderService, CreateOrderData } from '@/lib/services/orders'
import { createOrderSchema } from '@/lib/validations/orders'
import { ZodError } from 'zod'
import { EmailService } from '@/lib/services/email'

// Force dynamic rendering since we use Supabase (cookies)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validatedData = createOrderSchema.parse(body)

    // Create order data
    const orderData: CreateOrderData = {
      userId: user.id,
      items: validatedData.items,
      shippingAddress: validatedData.shippingAddress,
      subtotal: validatedData.subtotal,
      shippingCost: validatedData.shippingCost,
      tax: validatedData.tax,
      totalAmount: validatedData.totalAmount,
    }

    // Create the order (with server-side price validation and stock management)
    const order = await OrderService.createOrder(orderData)

    if (user.email) {
      ;(async () => {
        try {
          const fullOrder = await OrderService.getOrder(order.id)
          if (!fullOrder) return

          const items =
            fullOrder.order_items?.map((item: any) => ({
              name: item.products?.name ?? 'Herbal Tincture',
              quantity: item.quantity,
              unitPrice: item.price,
            })) ?? []

          await EmailService.sendOrderConfirmation({
            email: user.email!,
            orderNumber: fullOrder.order_number ?? order.order_number,
            createdAt: fullOrder.created_at ?? new Date().toISOString(),
            items,
            totals: {
              subtotal: Number(fullOrder.subtotal ?? 0),
              shipping: Number(fullOrder.shipping ?? 0),
              tax: Number(fullOrder.tax ?? 0),
              total: Number(fullOrder.total ?? 0),
            },
            shippingAddress: fullOrder.shipping_address,
          })
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError)
        }
      })()
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's orders
    const orders = await OrderService.getUserOrders(user.id)

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
