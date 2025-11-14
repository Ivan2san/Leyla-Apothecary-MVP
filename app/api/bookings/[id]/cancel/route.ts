/**
 * POST /api/bookings/[id]/cancel
 * Cancels a booking for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/lib/services/booking.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get booking ID from params
    const { id: bookingId } = await params

    // Cancel the booking
    try {
      await BookingService.cancelBooking(bookingId, user.id)

      return NextResponse.json(
        { message: 'Booking cancelled successfully' },
        { status: 200 }
      )
    } catch (cancelError: any) {
      // Handle specific cancellation errors
      if (cancelError.message === 'Booking not found or unauthorized') {
        return NextResponse.json(
          { error: 'Booking not found or unauthorized' },
          { status: 404 }
        )
      }

      if (cancelError.message === 'Booking is already cancelled') {
        return NextResponse.json(
          { error: 'Booking is already cancelled' },
          { status: 409 }
        )
      }

      if (cancelError.message === 'Cannot cancel a completed booking') {
        return NextResponse.json(
          { error: 'Cannot cancel a completed booking' },
          { status: 409 }
        )
      }

      throw cancelError
    }
  } catch (error) {
    console.error('Error in POST /api/bookings/[id]/cancel:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
