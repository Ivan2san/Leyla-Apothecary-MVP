import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrderService, CreateOrderData } from '@/lib/services/orders'
import { createOrderSchema } from '@/lib/validations/orders'
import { ZodError } from 'zod'

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
