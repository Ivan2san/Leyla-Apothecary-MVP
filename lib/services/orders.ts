import { createClient } from '@/lib/supabase/server'
import type { CompoundTier, CompoundType } from '@/types'

export interface CreateOrderData {
  userId: string
  items: Array<{
    productId?: string
    compoundId?: string
    quantity: number
    price: number
    type?: 'product' | 'compound'
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

    const productRequests = data.items.filter(
      (item): item is { productId: string; quantity: number; price: number } =>
        Boolean(item.productId)
    )
    const compoundRequests = data.items.filter(
      (item): item is { compoundId: string; quantity: number; price: number; type?: 'compound' } =>
        Boolean(item.compoundId)
    )

    let calculatedSubtotal = 0
    const validatedItems: Array<{
      type: 'product' | 'compound'
      product_id?: string
      compound_id?: string
      compound_snapshot?: any
      quantity: number
      price: number
      product_snapshot: any
    }> = []

    let products: any[] = []
    if (productRequests.length > 0) {
      const { data: productRows, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, is_active')
        .in(
          'id',
          productRequests.map((item) => item.productId)
        )

      if (productsError) {
        throw new Error(`Failed to fetch products: ${productsError.message}`)
      }

      products = productRows ?? []
      if (products.length !== productRequests.length) {
        throw new Error('Some products not found or inactive')
      }
    }

    for (const item of productRequests) {
      const product = products.find((p) => p.id === item.productId)

      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      if (!product.is_active) {
        throw new Error(`Product ${product.name} is no longer available`)
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
        )
      }

      // Use SERVER price, not client-provided price
      const serverPrice = product.price
      const lineTotal = serverPrice * item.quantity
      calculatedSubtotal += lineTotal

      validatedItems.push({
        type: 'product',
        product_id: item.productId,
        quantity: item.quantity,
        price: serverPrice, // Server-validated price
        product_snapshot: {
          name: product.name,
          price: serverPrice,
        },
      })
    }

    if (compoundRequests.length > 0) {
      const { data: compounds, error: compoundsError } = await supabase
        .from('compounds')
        .select('*')
        .in(
          'id',
          compoundRequests.map((item) => item.compoundId!)
        )

      if (compoundsError) {
        throw new Error(`Failed to fetch compounds: ${compoundsError.message}`)
      }

      for (const item of compoundRequests) {
        const compound = compounds?.find((row) => row.id === item.compoundId)
        if (!compound) {
          throw new Error('Compound not found')
        }

        if (compound.owner_user_id !== data.userId) {
          throw new Error('Compound not available for this account')
        }

        const serverPrice = Number(compound.price ?? 0)
        if (!Number.isFinite(serverPrice) || serverPrice <= 0) {
          throw new Error('Compound price unavailable — please resave the blend.')
        }

        calculatedSubtotal += serverPrice * item.quantity

        validatedItems.push({
          type: 'compound',
          compound_id: compound.id,
          quantity: item.quantity,
          price: serverPrice,
          product_snapshot: {
            name: compound.name,
            price: serverPrice,
          },
          compound_snapshot: {
            id: compound.id,
            name: compound.name,
            tier: compound.tier as CompoundTier,
            type: compound.type as CompoundType,
            formula: compound.formula,
            price: serverPrice,
            source_booking_id: compound.source_booking_id,
            source_assessment_id: compound.source_assessment_id,
            bottle_volume_ml: 100,
          },
        })
      }
    }

    if (validatedItems.length === 0) {
      throw new Error('No valid items to order.')
    }

    // STEP 3: Recalculate shipping, tax, and total server-side
    const shippingCost = calculatedSubtotal >= 50 ? 0 : 5.99
    const tax = calculatedSubtotal * 0.08 // 8% tax rate
    const totalAmount = calculatedSubtotal + shippingCost + tax

    // STEP 4: Validate against client-provided values (for debugging/logging)
    const priceDifference = Math.abs(totalAmount - data.totalAmount)
    if (priceDifference > 0.01) {
      console.warn(
        `Price mismatch: Client sent ${data.totalAmount}, Server calculated ${totalAmount}`
      )
      // Don't throw error, just use server-calculated values
    }

    // STEP 5: Create the order with SERVER-CALCULATED values
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: data.userId,
        status: 'pending',
        subtotal: calculatedSubtotal,    // Server-calculated
        shipping: shippingCost,          // Server-calculated
        tax: tax,                        // Server-calculated
        total: totalAmount,              // Server-calculated
        shipping_address: data.shippingAddress,
        // order_number will be auto-generated by database trigger
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // STEP 6: Create order items
    const orderItems = validatedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItems.map((item) => ({
        order_id: item.order_id,
        product_id: item.compound_id ? null : item.product_id,
        compound_id: item.compound_id ?? null,
        quantity: item.quantity,
        price: item.price,
        product_snapshot: item.product_snapshot,
        compound_snapshot: item.compound_snapshot ?? null,
      }))
    )

    if (itemsError) {
      // Rollback: delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // STEP 7: Decrement stock for each product
    const compoundEntries = validatedItems.filter((entry) => entry.type === 'compound')

    for (const item of validatedItems.filter((entry) => entry.type === 'product')) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) continue
      const newStock = product.stock_quantity - item.quantity

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id)

      if (stockError) {
        console.error(`Failed to update stock for product ${item.product_id}:`, stockError)
      }
    }

    if (compoundEntries.length > 0) {
      await allocateCompoundDispensations(supabase, order.id, data.userId, compoundEntries)
    }

    return order
  }

  static async getOrder(orderId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*), compounds(*))')
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
      .select('*, order_items(*, products(*), compounds(*))')
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

async function allocateCompoundDispensations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  userId: string,
  entries: Array<{
    compound_id?: string
    quantity: number
    compound_snapshot?: { bottle_volume_ml?: number }
  }>
) {
  for (const entry of entries) {
    if (!entry.compound_id) continue
    const bottleVolume = entry.compound_snapshot?.bottle_volume_ml ?? 100
    const requiredVolume = bottleVolume * entry.quantity

    const { data: batches, error } = await supabase
      .from('compound_batches')
      .select('id, total_volume_ml, status, compound_dispensations(volume_ml)')
      .eq('compound_id', entry.compound_id)
      .order('prepared_at', { ascending: true })

    if (error || !batches || batches.length === 0) {
      console.warn('No batch available for compound', entry.compound_id)
      continue
    }

    let remaining = requiredVolume
    for (const batch of batches) {
      if (batch.status === 'discarded') continue
      const dispensedVolume =
        batch.compound_dispensations?.reduce(
          (sum: number, disp: { volume_ml: number }) => sum + Number(disp.volume_ml ?? 0),
          0
        ) ?? 0
      const available = Number(batch.total_volume_ml ?? 0) - dispensedVolume
      if (available <= 0) continue

      const volumeToAllocate = Math.min(available, remaining)
      const { error: dispError } = await supabase.from('compound_dispensations').insert({
        batch_id: batch.id,
        order_id: orderId,
        user_id: userId,
        volume_ml: volumeToAllocate,
      })

      if (dispError) {
        console.error('Failed to record compound dispensation', dispError)
        break
      }

      remaining -= volumeToAllocate
      if (remaining <= 0) {
        break
      }
    }

    if (remaining > 0) {
      console.warn(
        `Insufficient batch volume for compound ${entry.compound_id}. Needed ${requiredVolume}ml, remaining ${remaining}ml`
      )
    }
  }
}
