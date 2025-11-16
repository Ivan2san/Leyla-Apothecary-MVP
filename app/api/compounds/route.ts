import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/auth/guards'
import { calculateCompoundPrice } from '@/lib/compounds/pricing'
import {
  checkFormulaSafety,
  aggregateSafetySeverity,
  type SafetyIssue,
} from '@/lib/compounds/safety'
import type { CompoundHerbComponent, CompoundType, CompoundTier } from '@/types'

export const dynamic = 'force-dynamic'

interface CompoundPayload {
  name?: string
  formula: CompoundHerbComponent[]
  tier: CompoundTier
  type?: CompoundType
  source_assessment_id?: string
  source_booking_id?: string
  notes?: string
  context?: Record<string, any>
}

function validateFormula(formula: CompoundHerbComponent[]) {
  if (!Array.isArray(formula) || formula.length === 0) {
    return 'Formula must contain at least one herb.'
  }

  let total = 0
  for (const herb of formula) {
    if (!herb.product_id) {
      return 'Each herb must include a product_id.'
    }
    if (typeof herb.percentage !== 'number' || Number.isNaN(herb.percentage)) {
      return 'Each herb must include a numeric percentage.'
    }
    if (herb.percentage <= 0) {
      return 'Herb percentages must be greater than zero.'
    }
    total += herb.percentage
  }

  if (Math.abs(total - 100) > 0.5) {
    return 'Formula percentages must add up to 100.'
  }

  return null
}

function enforceTypeForTier(tier: CompoundTier, type?: CompoundType) {
  if (tier === 1) return 'preset'
  if (tier === 2) return 'guided'
  return type ?? 'practitioner'
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)

  if ('error' in session) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

  const searchParams = request.nextUrl.searchParams
  const tier = searchParams.get('tier')
  const type = searchParams.get('type')

  let query = supabase
    .from('compounds')
    .select('*')
    .eq('owner_user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (tier) {
    query = query.eq('tier', Number(tier))
  }
  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to load compounds:', error)
    return NextResponse.json({ error: 'Unable to load compounds' }, { status: 500 })
  }

  return NextResponse.json({ compounds: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)

  if ('error' in session) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

  const isPreview = request.nextUrl.searchParams.get('preview') === '1'

  const payload = (await request.json()) as CompoundPayload
  const validationError = validateFormula(payload.formula)

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  if (!payload.tier) {
    return NextResponse.json({ error: 'Tier is required.' }, { status: 400 })
  }

  let assessment: any = null
  let ownerUserId = session.user.id
  let bookingRecord: any = null

  if (payload.tier === 2) {
    if (!payload.source_assessment_id) {
      return NextResponse.json(
        { error: 'Guided compounds require a linked assessment.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', payload.source_assessment_id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    assessment = data
  }

  if (payload.tier === 3 && !payload.source_booking_id) {
    return NextResponse.json(
      { error: 'Practitioner compounds must reference a completed booking.' },
      { status: 400 }
    )
  }

  if (payload.tier === 3) {
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', payload.source_booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.practitioner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed consultations can receive practitioner compounds.' },
        { status: 400 }
      )
    }

    bookingRecord = booking
    ownerUserId = booking.user_id
  }

  const context = assessment
    ? {
        pregnancyStatus: assessment.responses?.pregnancy_status,
        medications: assessment.responses?.medications,
        allergies: assessment.responses?.allergies,
      }
    : payload.context

  try {
    const [pricing, safetyIssues] = await Promise.all([
      calculateCompoundPrice({
        supabase,
        formula: payload.formula,
        tier: payload.tier,
      }),
      checkFormulaSafety({
        supabase,
        formula: payload.formula,
        context,
      }),
    ])

    const safetySeverity = aggregateSafetySeverity(safetyIssues)
    const responsePayload: {
      price_breakdown: typeof pricing
      safety_issues: SafetyIssue[]
      safety_severity: typeof safetySeverity
      compound?: any
    } = {
      price_breakdown: pricing,
      safety_issues: safetyIssues,
      safety_severity: safetySeverity,
    }

    if (isPreview) {
      return NextResponse.json(responsePayload)
    }

    if (!payload.name || payload.name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Name must be at least 3 characters when saving a compound.' },
        { status: 400 }
      )
    }

    const derivedType = enforceTypeForTier(payload.tier, payload.type)

    const { data, error } = await supabase
      .from('compounds')
      .insert({
        name: payload.name.trim(),
        owner_user_id: ownerUserId,
        created_by: session.user.id,
        type: derivedType,
        tier: payload.tier,
        formula: payload.formula,
        price: pricing.price,
        notes: payload.notes,
        source_assessment_id: payload.source_assessment_id,
        source_booking_id: payload.source_booking_id,
        status: 'draft',
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to save compound:', error)
      return NextResponse.json(
        { error: 'Unable to save compound right now.' },
        { status: 500 }
      )
    }

    responsePayload.compound = data
    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Compound pricing/safety error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process compound.' },
      { status: 400 }
    )
  }
}
