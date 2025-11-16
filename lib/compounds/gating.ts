import type { SupabaseClient } from '@supabase/supabase-js'
import type { Assessment } from '@/types'

type AnySupabase = SupabaseClient<any, 'public', any>

const DEFAULT_MAX_AGE_DAYS = 30

function getCutoffDate(maxAgeDays: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)
  return cutoff.toISOString()
}

export async function fetchLatestGuidedAssessment(
  supabase: AnySupabase,
  userId: string,
  maxAgeDays: number = DEFAULT_MAX_AGE_DAYS
) {
  const cutoffIso = getCutoffDate(maxAgeDays)

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'guided_compound')
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data as Assessment | null
}

export async function fetchGuidedAssessmentById(
  supabase: AnySupabase,
  userId: string,
  assessmentId: string
) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('user_id', userId)
    .eq('type', 'guided_compound')
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data as Assessment | null
}

export interface GuidedAssessmentGateResult {
  assessment: Assessment | null
  isExpired: boolean
  maxAgeDays: number
}

export async function resolveGuidedAssessmentForBuilder(
  supabase: AnySupabase,
  userId: string,
  {
    assessmentId,
    maxAgeDays = DEFAULT_MAX_AGE_DAYS,
  }: { assessmentId?: string; maxAgeDays?: number } = {}
): Promise<GuidedAssessmentGateResult> {
  let assessment: Assessment | null = null

  if (assessmentId) {
    assessment = await fetchGuidedAssessmentById(supabase, userId, assessmentId)
  }

  if (!assessment) {
    assessment = await fetchLatestGuidedAssessment(supabase, userId, maxAgeDays)
  }

  if (!assessment) {
    return {
      assessment: null,
      isExpired: true,
      maxAgeDays,
    }
  }

  const createdAt = new Date(assessment.created_at)
  const isExpired = createdAt < new Date(getCutoffDate(maxAgeDays))

  return {
    assessment,
    isExpired,
    maxAgeDays,
  }
}
