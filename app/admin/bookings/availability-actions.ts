'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

type ActionState = {
  status: 'success' | 'error' | null
  message?: string
}

export const availabilityActionInitialState: ActionState = {
  status: null,
}

export async function updateBookingTypeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const type = formData.get('type')?.toString()
  const name = formData.get('name')?.toString()
  const description = formData.get('description')?.toString()
  const duration = Number(formData.get('duration_minutes'))
  const price = Number(formData.get('price'))
  const isActive = formData.get('is_active') === 'true'

  if (!type || !name || Number.isNaN(duration) || Number.isNaN(price)) {
    return { status: 'error', message: 'Invalid booking type data' }
  }

  const { error } = await client
    .from('booking_type_config')
    .update({
      name,
      description,
      duration_minutes: duration,
      price,
      is_active: isActive,
    })
    .eq('type', type)

  if (error) {
    console.error('Admin booking type update error:', error)
    return { status: 'error', message: 'Failed to update booking type' }
  }

  revalidatePath('/admin/bookings/availability')
  return { status: 'success', message: 'Booking type updated' }
}

export async function createAvailabilitySlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const day = Number(formData.get('day_of_week'))
  const startTime = formData.get('start_time')?.toString()
  const endTime = formData.get('end_time')?.toString()

  if (Number.isNaN(day) || day < 0 || day > 6 || !startTime || !endTime) {
    return { status: 'error', message: 'Invalid availability slot data' }
  }

  const { error } = await client.from('availability_slots').insert({
    day_of_week: day,
    start_time: startTime,
    end_time: endTime,
  })

  if (error) {
    console.error('Admin availability slot create error:', error)
    return { status: 'error', message: 'Failed to add availability slot' }
  }

  revalidatePath('/admin/bookings/availability')
  return { status: 'success', message: 'Availability slot added' }
}

export async function toggleAvailabilitySlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const slotId = formData.get('slot_id')?.toString()
  const nextState = formData.get('next_active') === 'true'

  if (!slotId) {
    return { status: 'error', message: 'Missing slot id' }
  }

  const { error } = await client
    .from('availability_slots')
    .update({ is_active: nextState })
    .eq('id', slotId)

  if (error) {
    console.error('Admin availability slot toggle error:', error)
    return { status: 'error', message: 'Failed to update slot' }
  }

  revalidatePath('/admin/bookings/availability')
  return { status: 'success', message: 'Availability updated' }
}

export async function createBlockedDateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const date = formData.get('date')?.toString()
  const reason = formData.get('reason')?.toString()

  if (!date) {
    return { status: 'error', message: 'Date is required' }
  }

  const { error } = await client.from('blocked_dates').insert({
    date,
    reason: reason || null,
  })

  if (error) {
    console.error('Admin blocked date create error:', error)
    return { status: 'error', message: 'Failed to block date' }
  }

  revalidatePath('/admin/bookings/availability')
  return { status: 'success', message: 'Date blocked' }
}

export async function removeBlockedDateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const blockedId = formData.get('blocked_id')?.toString()

  if (!blockedId) {
    return { status: 'error', message: 'Missing blocked date' }
  }

  const { error } = await client.from('blocked_dates').delete().eq('id', blockedId)

  if (error) {
    console.error('Admin blocked date delete error:', error)
    return { status: 'error', message: 'Failed to unblock date' }
  }

  revalidatePath('/admin/bookings/availability')
  return { status: 'success', message: 'Date unblocked' }
}
