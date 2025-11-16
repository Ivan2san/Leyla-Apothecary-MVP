import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { wellnessAssessmentSchema } from '@/lib/validations/wellness-assessment'
import { calculateWellnessScore } from '@/lib/assessment/scoring'
import { buildRecommendation, determineQualificationLevel } from '@/lib/assessment/qualification'
import { extractBestPracticeAnswers } from '@/lib/assessment/results'

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null)
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  const parsed = wellnessAssessmentSchema.safeParse({
    ...body,
    ip_address: (body as Record<string, unknown>)?.ip_address ?? forwardedFor,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data
  const scoreSummary = calculateWellnessScore(extractBestPracticeAnswers(input))
  const qualificationLevel = determineQualificationLevel(input, scoreSummary.score)
  const recommendation = buildRecommendation(qualificationLevel, scoreSummary.score)

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('wellness_assessments')
    .insert({
      ...input,
      wellness_score: scoreSummary.score,
      score_category: scoreSummary.category,
      qualification_level: qualificationLevel,
      recommended_next_step: recommendation,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Assessment insert failed', error)
    return NextResponse.json({ error: 'Unable to save assessment' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
