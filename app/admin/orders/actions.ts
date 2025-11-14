'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { EmailService } from '@/lib/services/email'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export type OrderActionState = {
  status: 'success' | 'error' | null
  message?: string
}

export const orderActionInitialState: OrderActionState = {
  status: null,
}

export async function updateOrderStatusAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const orderId = formData.get('order_id')?.toString()
  const status = formData.get('status')?.toString().toLowerCase()

  if (!orderId || !status || !VALID_STATUSES.includes(status)) {
    return { status: 'error', message: 'Invalid order status' }
  }

  const { error } = await client.from('orders').update({ status }).eq('id', orderId)

  if (error) {
    console.error('Admin order update error:', error)
    return { status: 'error', message: 'Failed to update order' }
  }

  ;(async () => {
    try {
      const { data } = await client
        .from('orders')
        .select('order_number,total,profiles:user_id ( email )')
        .eq('id', orderId)
        .single()

      if (!data) return

      type ProfileInfo = { email?: string | null }
      const profile = Array.isArray(data?.profiles)
        ? (data?.profiles?.[0] as ProfileInfo | undefined)
        : (data?.profiles as ProfileInfo | undefined)
      if (!profile?.email) return

      await EmailService.sendOrderStatusUpdate({
        email: profile.email,
        orderNumber: data.order_number ?? orderId,
        status,
        total: Number(data.total ?? 0),
      })
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError)
    }
  })()

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return { status: 'success', message: 'Order status updated' }
}
