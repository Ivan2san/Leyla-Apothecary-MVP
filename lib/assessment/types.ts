import { z } from 'zod'
import { wellnessAssessmentSchema } from '@/lib/validations/wellness-assessment'

export const bestPracticeQuestions = [
  'q1_digestive_issues',
  'q2_sleep_quality',
  'q3_medications',
  'q4_processed_foods',
  'q5_energy_crashes',
  'q6_water_intake',
  'q7_toxic_exposure',
  'q8_symptoms',
  'q9_supplements',
  'q10_unresolved_issues',
] as const

export type BestPracticeQuestionId = (typeof bestPracticeQuestions)[number]
export type BestPracticeAnswers = Pick<
  WellnessAssessmentInput,
  BestPracticeQuestionId
>

export const yesNoSometimes = ['yes', 'no', 'sometimes'] as const
export type YesNoSometimes = (typeof yesNoSometimes)[number]

export const resultCategories = ['strong', 'moderate', 'needs_attention'] as const
export type AssessmentScoreCategory = (typeof resultCategories)[number]

export const qualificationLevels = ['high', 'medium', 'low'] as const
export type QualificationLevel = (typeof qualificationLevels)[number]

export type WellnessAssessmentInput = z.infer<typeof wellnessAssessmentSchema>

export interface WellnessScoreSummary {
  score: number
  category: AssessmentScoreCategory
  insightFlags: Record<'gut' | 'toxic' | 'lifestyle', 'stable' | 'focus'>
}

export interface InsightCopy {
  title: string
  status: 'positive' | 'attention'
  summary: string
}

export interface NextStepRecommendation {
  title: string
  summary: string
  bullets: string[]
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export interface AssessmentResultPayload extends WellnessScoreSummary {
  id: string
  name: string
  qualificationLevel: QualificationLevel
  recommendedNextStep: NextStepRecommendation
  insights: InsightCopy[]
}
