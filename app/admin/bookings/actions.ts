'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { EmailService } from '@/lib/services/email'

const BOOKING_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']

export type BookingActionState = {
  status: 'success' | 'error' | null
  message?: string
}

export const bookingActionInitialState: BookingActionState = {
  status: null,
}

export async function updateBookingStatusAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  await requireAdmin()
  const client = createServiceRoleClient()

  const bookingId = formData.get('booking_id')?.toString()
  const status = formData.get('status')?.toString().toLowerCase()

  if (!bookingId || !status || !BOOKING_STATUSES.includes(status)) {
    return { status: 'error', message: 'Invalid booking status' }
  }

  const { error } = await client.from('bookings').update({ status }).eq('id', bookingId)

  if (error) {
    console.error('Admin booking update error:', error)
    return { status: 'error', message: 'Failed to update booking' }
  }

  ;(async () => {
    try {
      const { data } = await client
        .from('bookings')
        .select('type,date,time,duration_minutes,profiles:user_id ( full_name,email )')
        .eq('id', bookingId)
        .single()

      if (!data) return

      type ProfileInfo = { full_name?: string | null; email?: string | null }
      const profile = Array.isArray(data?.profiles)
        ? (data?.profiles?.[0] as ProfileInfo | undefined)
        : (data?.profiles as ProfileInfo | undefined)

      if (!profile?.email) return

      await EmailService.sendBookingStatusUpdate({
        email: profile.email,
        name: profile.full_name,
        type: data.type,
        date: data.date,
        time: data.time,
        status,
      })
    } catch (emailError) {
      console.error('Failed to send booking status email:', emailError)
    }
  })()

  revalidatePath('/admin/bookings')
  return { status: 'success', message: 'Booking updated' }
}
