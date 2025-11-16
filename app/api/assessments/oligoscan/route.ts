import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePractitionerProfile } from '@/lib/auth/guards'
import { oligoscanAssessmentSchema } from '@/lib/validations/assessments'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await requirePractitionerProfile(supabase)

    if ('error' in session) {
      return NextResponse.json({ error: session.error }, { status: session.status })
    }

    const payload = await request.json()
    const parsed = oligoscanAssessmentSchema.parse(payload)
    const { bookingId, userId, score, summary, keyFindings, categories } = parsed

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, profiles:user_id ( full_name )')
      .eq('id', bookingId)
      .maybeSingle()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const bookingType = booking.booking_type ?? booking.type
    if (bookingType !== 'oligoscan_assessment') {
      return NextResponse.json(
        { error: 'Only Oligoscan bookings can receive this assessment' },
        { status: 400 }
      )
    }

    if (booking.user_id !== userId) {
      return NextResponse.json(
        { error: 'Booking does not belong to this client' },
        { status: 400 }
      )
    }

    if (booking.practitioner_id && booking.practitioner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: existingAssessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('type', 'oligoscan_v1')
      .eq('booking_id', bookingId)
      .maybeSingle()

    if (existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment already recorded for this booking' },
        { status: 409 }
      )
    }

    const responses = {
      booking_id: bookingId,
      biometrics: booking.metadata?.biometrics ?? null,
      summary,
      keyFindings,
      categories,
      clientName: booking.profiles?.full_name ?? null,
    }

    const { data: assessment, error: insertError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        booking_id: bookingId,
        type: 'oligoscan_v1',
        responses,
        score,
        recommendations: [],
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert Oligoscan assessment:', insertError)
      return NextResponse.json(
        { error: 'Unable to save assessment' },
        { status: 500 }
      )
    }

    if (booking.status !== 'completed') {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
    }

    return NextResponse.json({ assessment }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    console.error('Error creating Oligoscan assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
