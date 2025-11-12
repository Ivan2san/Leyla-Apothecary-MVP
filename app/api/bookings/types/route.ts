/**
 * GET /api/bookings/types
 * Returns all available booking type configurations
 */

import { NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking.service'

export async function GET() {
  try {
    const bookingTypes = await BookingService.getBookingTypes()

    return NextResponse.json({ bookingTypes }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/bookings/types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking types' },
      { status: 500 }
    )
  }
}
