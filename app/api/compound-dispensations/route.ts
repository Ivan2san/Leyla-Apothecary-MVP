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
  const batchId = searchParams.get('batchId')
  const userId = searchParams.get('userId')

  let query = supabase
    .from('compound_dispensations')
    .select('*')
    .order('dispensed_at', { ascending: false })
    .limit(100)

  if (batchId) {
    query = query.eq('batch_id', batchId)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch dispensations:', error)
    return NextResponse.json(
      { error: 'Unable to fetch dispensation records' },
      { status: 500 }
    )
  }

  return NextResponse.json({ dispensations: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const session = await requirePractitionerProfile(supabase)

  if ('error' in session) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

  const body = await request.json()
  const { batch_id, order_id, user_id, volume_ml } = body
  const parsedVolume = Number(volume_ml)

  if (!batch_id || !user_id || !Number.isFinite(parsedVolume) || parsedVolume <= 0) {
    return NextResponse.json(
      { error: 'batch_id, user_id, and volume_ml are required' },
      { status: 400 }
    )
  }

  const { data: batch, error: batchError } = await supabase
    .from('compound_batches')
    .select('id, total_volume_ml, status')
    .eq('id', batch_id)
    .single()

  if (batchError || !batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  const { data: dispenses, error: sumError } = await supabase
    .from('compound_dispensations')
    .select('volume_ml')
    .eq('batch_id', batch_id)

  if (sumError) {
    console.error('Failed to load dispensation totals:', sumError)
    return NextResponse.json(
      { error: 'Unable to validate batch volume' },
      { status: 500 }
    )
  }

  const dispensedVolume = (dispenses || []).reduce(
    (acc, record) => acc + (record.volume_ml ?? 0),
    0
  )

  if (dispensedVolume + parsedVolume > batch.total_volume_ml) {
    return NextResponse.json(
      {
        error: `Dispensing ${parsedVolume}ml would exceed the batch total of ${batch.total_volume_ml}ml.`,
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('compound_dispensations')
    .insert({
      batch_id,
      order_id,
      user_id,
      volume_ml: parsedVolume,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed to record dispensation:', error)
    return NextResponse.json(
      { error: 'Unable to record dispensation' },
      { status: 500 }
    )
  }

  const newTotal = dispensedVolume + parsedVolume
  if (newTotal >= batch.total_volume_ml && batch.status !== 'dispensed') {
    await supabase
      .from('compound_batches')
      .update({ status: 'dispensed' })
      .eq('id', batch_id)
  }

  return NextResponse.json({
    dispensation: data,
    remaining_volume_ml: Math.max(batch.total_volume_ml - newTotal, 0),
  })
}
