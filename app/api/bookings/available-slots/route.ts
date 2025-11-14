/**
 * GET /api/bookings/available-slots
 * Returns available time slots for a specific date and booking type
 * Query params: date (YYYY-MM-DD), type (booking type)
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking.service'
import { getAvailableSlotsSchema } from '@/lib/validations/bookings'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const type = searchParams.get('type')

    // Validate input
    const validation = getAvailableSlotsSchema.safeParse({ date, type })
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { date: validDate, type: validType } = validation.data

    // Get available slots
    const slots = await BookingService.getAvailableSlots(validDate, validType)

    return NextResponse.json(
      {
        date: validDate,
        type: validType,
        slots,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/bookings/available-slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
