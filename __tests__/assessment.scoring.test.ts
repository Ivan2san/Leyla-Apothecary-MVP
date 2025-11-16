import { calculateWellnessScore, scoreCategoryLabels } from '@/lib/assessment/scoring'
import { determineQualificationLevel, buildRecommendation } from '@/lib/assessment/qualification'
import type { WellnessAssessmentInput } from '@/lib/validations/wellness-assessment'
import { extractBestPracticeAnswers } from '@/lib/assessment/results'

const baseInput: WellnessAssessmentInput = {
  name: 'Test User',
  email: 'test@example.com',
  phone: undefined,
  location: undefined,
  ip_address: undefined,
  q1_digestive_issues: 'no',
  q2_sleep_quality: 'no',
  q3_medications: 'no',
  q4_processed_foods: 'no',
  q5_energy_crashes: 'no',
  q6_water_intake: 'no',
  q7_toxic_exposure: 'no',
  q8_symptoms: 'no',
  q9_supplements: 'no',
  q10_unresolved_issues: 'no',
  current_situation: 'just_beginning',
  primary_goal: 'resolve_digestive',
  biggest_obstacle: 'dont_know_where_to_start',
  preferred_support: 'self_guided',
  additional_notes: undefined,
  utm_source: undefined,
  utm_medium: undefined,
  utm_campaign: undefined,
}

describe('wellness scoring', () => {
  it('returns strong foundation when all answers are optimal', () => {
    const result = calculateWellnessScore(extractBestPracticeAnswers(baseInput))
    expect(result.score).toBe(100)
    expect(scoreCategoryLabels[result.category].title).toBe('Strong Foundation')
  })

  it('lowers score when multiple answers need support', () => {
    const answers: WellnessAssessmentInput = {
      ...baseInput,
      q1_digestive_issues: 'yes',
      q2_sleep_quality: 'yes',
      q3_medications: 'yes',
      q4_processed_foods: 'yes',
      q5_energy_crashes: 'yes',
      q6_water_intake: 'sometimes',
    }

    const result = calculateWellnessScore(extractBestPracticeAnswers(answers))
    expect(result.score).toBeLessThan(50)
    expect(result.category).toBe('needs_attention')
  })
})

describe('qualification logic', () => {
  it('classifies high qualification when comprehensive support + chronic', () => {
    const input: WellnessAssessmentInput = {
      ...baseInput,
      q1_digestive_issues: 'yes',
      q2_sleep_quality: 'yes',
      q3_medications: 'yes',
      q4_processed_foods: 'yes',
      q5_energy_crashes: 'yes',
      current_situation: 'managing_chronic',
      preferred_support: 'comprehensive_testing',
    }
    const score = calculateWellnessScore(extractBestPracticeAnswers(input))
    const level = determineQualificationLevel(input, score.score)
    expect(level).toBe('high')
    const recommendation = buildRecommendation(level, score.score)
    expect(recommendation.title).toMatch(/Consultation/i)
    expect(recommendation.bullets.length).toBeGreaterThan(2)
  })

  it('defaults to low qualification when signals are mild', () => {
    const level = determineQualificationLevel(baseInput, 85)
    expect(level).toBe('low')
    const recommendation = buildRecommendation(level, 85)
    expect(recommendation.title).toMatch(/Educational Resources/)
  })
})
