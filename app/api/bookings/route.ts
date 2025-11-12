/**
 * GET /api/bookings
 * Returns all bookings for the authenticated user
 *
 * POST /api/bookings
 * Creates a new booking for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/lib/services/booking.service'
import { createBookingSchema } from '@/lib/validations/bookings'

export async function GET() {
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

    // Get user's bookings
    const bookings = await BookingService.getUserBookings(user.id)

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = createBookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { type, date, time, notes } = validation.data

    // Create the booking
    try {
      const booking = await BookingService.createBooking(
        user.id,
        type,
        date,
        time,
        notes
      )

      return NextResponse.json(
        {
          booking,
          message: 'Booking created successfully',
        },
        { status: 201 }
      )
    } catch (bookingError: any) {
      // Handle specific booking errors
      if (bookingError.message === 'Selected time slot is not available') {
        return NextResponse.json(
          { error: 'Selected time slot is no longer available' },
          { status: 409 }
        )
      }

      if (bookingError.message === 'Invalid booking type') {
        return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
      }

      throw bookingError
    }
  } catch (error) {
    console.error('Error in POST /api/bookings:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
