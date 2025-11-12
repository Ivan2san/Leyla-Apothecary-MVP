import { createClient } from '@/lib/supabase/server'

export interface CreateOrderData {
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
  subtotal: number
  shippingCost: number
  tax: number
  totalAmount: number
}

export class OrderService {
  static async createOrder(data: CreateOrderData) {
    const supabase = await createClient()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: data.userId,
        status: 'pending',
        subtotal: data.subtotal,
        shipping_cost: data.shippingCost,
        tax: data.tax,
        total_amount: data.totalAmount,
        shipping_address: data.shippingAddress,
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create order items
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback: delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    return order
  }

  static async getOrder(orderId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single()

    if (error) {
      throw new Error(`Failed to get order: ${error.message}`)
    }

    return data
  }

  static async getUserOrders(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get user orders: ${error.message}`)
    }

    return data
  }

  static async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    return data
  }
}
