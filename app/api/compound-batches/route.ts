import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePractitionerProfile } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const session = await requirePractitionerProfile(supabase)

  if ('error' in session) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

  const searchParams = request.nextUrl.searchParams
  const compoundId = searchParams.get('compoundId')
  const pageSize = Number(searchParams.get('limit') || 50)

  let query = supabase
    .from('compound_batches')
    .select('*')
    .order('prepared_at', { ascending: false })
    .limit(Math.min(pageSize, 100))

  if (compoundId) {
    query = query.eq('compound_id', compoundId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to load compound batches:', error)
    return NextResponse.json(
      { error: 'Unable to fetch compound batches' },
      { status: 500 }
    )
  }

  return NextResponse.json({ batches: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const session = await requirePractitionerProfile(supabase)

  if ('error' in session) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

  const body = await request.json()
  const { compound_id, batch_code, total_volume_ml, expiry_date, notes, status } = body

  const volume = Number(total_volume_ml)

  if (!compound_id || !batch_code || !Number.isFinite(volume) || volume <= 0) {
    return NextResponse.json(
      { error: 'compound_id, batch_code, and total_volume_ml are required.' },
      { status: 400 }
    )
  }

  const payload = {
    compound_id,
    batch_code,
    total_volume_ml: volume,
    expiry_date,
    notes,
    status,
    prepared_by: session.user.id,
  }

  const { data, error } = await supabase
    .from('compound_batches')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create compound batch:', error)
    return NextResponse.json(
      { error: 'Unable to create batch' },
      { status: 500 }
    )
  }

  return NextResponse.json({ batch: data })
}
