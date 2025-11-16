import {
  bestPracticeQuestions,
  type BestPracticeAnswers,
  type WellnessAssessmentInput,
} from './types'
import { calculateWellnessScore, insightCopyMap } from './scoring'
import { buildRecommendation, determineQualificationLevel } from './qualification'
import type { AssessmentResultPayload } from './types'

export const extractBestPracticeAnswers = (
  input: WellnessAssessmentInput
): BestPracticeAnswers =>
  bestPracticeQuestions.reduce(
    (acc, key) => ({ ...acc, [key]: input[key] }),
    {} as BestPracticeAnswers
  )

export const buildResultPayload = (
  id: string,
  input: WellnessAssessmentInput
): AssessmentResultPayload => {
  const score = calculateWellnessScore(extractBestPracticeAnswers(input))

  const qualificationLevel = determineQualificationLevel(input, score.score)

  return {
    id,
    name: input.name,
    ...score,
    qualificationLevel,
    recommendedNextStep: buildRecommendation(qualificationLevel, score.score),
    insights: insightCopyMap(score.insightFlags),
  }
}
