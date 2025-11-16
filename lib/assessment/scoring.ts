import { bestPracticeQuestions, type BestPracticeAnswers, type BestPracticeQuestionId, type InsightCopy, type WellnessAssessmentInput, type WellnessScoreSummary } from './types'

const answerScores: Record<WellnessAssessmentInput[BestPracticeQuestionId], number> = {
  yes: 0,
  sometimes: 5,
  no: 10,
}

const gutQuestions: BestPracticeQuestionId[] = ['q1_digestive_issues', 'q3_medications', 'q4_processed_foods', 'q9_supplements']
const toxicQuestions: BestPracticeQuestionId[] = ['q7_toxic_exposure', 'q8_symptoms', 'q9_supplements']
const lifestyleQuestions: BestPracticeQuestionId[] = ['q2_sleep_quality', 'q5_energy_crashes', 'q6_water_intake', 'q10_unresolved_issues']

const concernScore = (answer: WellnessAssessmentInput[BestPracticeQuestionId]) =>
  answer === 'yes' ? 1 : answer === 'sometimes' ? 0.5 : 0

const determineGroupFlag = (answers: BestPracticeAnswers, ids: BestPracticeQuestionId[]): 'stable' | 'focus' => {
  const total = ids.reduce((sum, id) => sum + concernScore(answers[id]), 0)
  return total >= 1.5 ? 'focus' : 'stable'
}

export const calculateWellnessScore = (
  answers: BestPracticeAnswers
): WellnessScoreSummary => {
  const totalPoints = bestPracticeQuestions.reduce(
    (sum, key) => sum + answerScores[answers[key]],
    0
  )

  const score = Math.round((totalPoints / (bestPracticeQuestions.length * 10)) * 100)

  const category = score >= 80 ? 'strong' : score >= 50 ? 'moderate' : 'needs_attention'

  return {
    score,
    category,
    insightFlags: {
      gut: determineGroupFlag(answers, gutQuestions),
      toxic: determineGroupFlag(answers, toxicQuestions),
      lifestyle: determineGroupFlag(answers, lifestyleQuestions),
    },
  }
}

export const insightCopyMap = (
  flags: WellnessScoreSummary['insightFlags']
): InsightCopy[] => {
  const gut: InsightCopy =
    flags.gut === 'focus'
      ? {
          title: 'Gut Health Analysis',
          status: 'attention',
          summary:
            'Your digestive system may be compromised. Patterns point to potential dysbiosis, inflammation, or slowed digestive function that needs targeted support.',
        }
      : {
          title: 'Gut Health Analysis',
          status: 'positive',
          summary:
            'Your gut health appears relatively stable. Strategic fine-tuning could still unlock better nutrient absorption and less reactivity.',
        }

  const toxic: InsightCopy =
    flags.toxic === 'focus'
      ? {
          title: 'Toxic Load & Mineral Status',
          status: 'attention',
          summary:
            'Your exposure patterns and symptoms suggest a higher likelihood of heavy metal burden or mineral depletion. Cellular testing like Oligoscan can reveal exact imbalances.',
        }
      : {
          title: 'Toxic Load & Mineral Status',
          status: 'positive',
          summary:
            'Your toxic load appears manageable, though routine monitoring and mineral replenishment will help prevent future accumulation.',
        }

  const lifestyle: InsightCopy =
    flags.lifestyle === 'focus'
      ? {
          title: 'Lifestyle & Energy Patterns',
          status: 'attention',
          summary:
            'Daily rhythms may be draining your energy reserves. Dialing in sleep, hydration, and nervous-system support could unlock dramatic improvements.',
        }
      : {
          title: 'Lifestyle & Energy Patterns',
          status: 'positive',
          summary:
            'Your lifestyle foundations are largely supportive. Continue refining stress, sleep, and hydration habits to protect your momentum.',
        }

  return [gut, toxic, lifestyle]
}

export const scoreCategoryLabels: Record<WellnessScoreSummary['category'], { title: string; subtitle: string }> = {
  strong: {
    title: 'Strong Foundation',
    subtitle: 'Excellent! You have resilient health foundations and can focus on optimization.',
  },
  moderate: {
    title: 'Room for Improvement',
    subtitle: 'Great progress so far, but there are clear opportunities to strengthen your baseline.',
  },
  needs_attention: {
    title: 'Urgent Attention Needed',
    subtitle: 'Your body is sending clear signals it needs support. Let’s create a plan quickly.',
  },
}
