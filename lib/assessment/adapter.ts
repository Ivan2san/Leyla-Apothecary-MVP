import type { WellnessAssessmentInput } from '@/lib/validations/wellness-assessment'

export interface WellnessAssessmentRow extends WellnessAssessmentInput {
  id: string
  created_at: string
  wellness_score: number | null
  score_category: string | null
  qualification_level: string | null
  recommended_next_step: Record<string, unknown> | null
  completed_at: string | null
  result_viewed: boolean
  clicked_cta: boolean
  booking_made: boolean
}

export const rowToAssessmentInput = (row: WellnessAssessmentRow): WellnessAssessmentInput => ({
  name: row.name,
  email: row.email,
  phone: row.phone ?? undefined,
  location: row.location ?? undefined,
  ip_address: row.ip_address ?? undefined,
  q1_digestive_issues: row.q1_digestive_issues,
  q2_sleep_quality: row.q2_sleep_quality,
  q3_medications: row.q3_medications,
  q4_processed_foods: row.q4_processed_foods,
  q5_energy_crashes: row.q5_energy_crashes,
  q6_water_intake: row.q6_water_intake,
  q7_toxic_exposure: row.q7_toxic_exposure,
  q8_symptoms: row.q8_symptoms,
  q9_supplements: row.q9_supplements,
  q10_unresolved_issues: row.q10_unresolved_issues,
  current_situation: row.current_situation,
  primary_goal: row.primary_goal,
  biggest_obstacle: row.biggest_obstacle,
  preferred_support: row.preferred_support,
  additional_notes: row.additional_notes ?? undefined,
  utm_source: row.utm_source ?? undefined,
  utm_medium: row.utm_medium ?? undefined,
  utm_campaign: row.utm_campaign ?? undefined,
})
