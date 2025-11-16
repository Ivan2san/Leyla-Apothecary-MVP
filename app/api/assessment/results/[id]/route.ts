import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { buildResultPayload } from '@/lib/assessment/results'
import { rowToAssessmentInput, type WellnessAssessmentRow } from '@/lib/assessment/adapter'

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('wellness_assessments')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<WellnessAssessmentRow>()

  if (error || !data) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }

  const payload = buildResultPayload(data.id, rowToAssessmentInput(data))
  return NextResponse.json(payload)
}
