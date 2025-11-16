import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { guidedAssessmentSchema } from '@/lib/validations/assessments'
import { generateGuidedRecommendations } from '@/lib/compounds/recommendations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const parsed = guidedAssessmentSchema.parse(payload)

    const recommendations = await generateGuidedRecommendations(parsed, supabase)

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        type: 'guided_compound',
        responses: parsed,
        recommendations,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to persist assessment:', error)
      return NextResponse.json(
        { error: 'Unable to save assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      assessment: data,
      recommendations,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      )
    }

    console.error('Guided assessment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
