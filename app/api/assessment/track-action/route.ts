import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const ACTION_FIELDS: Record<string, string> = {
  view: 'result_viewed',
  cta: 'clicked_cta',
  secondary: 'clicked_cta',
  booking: 'booking_made',
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = body?.id as string | undefined
  const action = body?.action as string | undefined

  if (!id || !action || !(action in ACTION_FIELDS)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const field = ACTION_FIELDS[action]
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('wellness_assessments')
    .update({ [field]: true })
    .eq('id', id)

  if (error) {
    console.error('Track action failed', error)
    return NextResponse.json({ error: 'Unable to track action' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
