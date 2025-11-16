import { type QualificationLevel, type NextStepRecommendation, type WellnessAssessmentInput } from './types'

const chronicSituations: WellnessAssessmentInput['current_situation'][] = [
  'managing_chronic',
  'years_no_resolution',
  'recovering',
]

const comprehensiveSupportPreferences: WellnessAssessmentInput['preferred_support'][] = [
  'comprehensive_testing',
  'ongoing_support',
  'full_service_partnership',
]

const consultationPreferences: WellnessAssessmentInput['preferred_support'][] = [
  'one_time_consult',
  'comprehensive_testing',
]

export const determineQualificationLevel = (
  input: WellnessAssessmentInput,
  score: number
): QualificationLevel => {
  if (score < 60 && comprehensiveSupportPreferences.includes(input.preferred_support) && chronicSituations.includes(input.current_situation)) {
    return 'high'
  }

  if (score >= 60 && score < 80 && consultationPreferences.includes(input.preferred_support)) {
    return 'medium'
  }

  return 'low'
}

export const buildRecommendation = (
  level: QualificationLevel,
  score: number
): NextStepRecommendation => {
  if (level === 'high') {
    return {
      title: 'Private Naturopathic Consultation + Oligoscan Testing',
      summary:
        'Your assessment suggests layered root-cause factors. A comprehensive consultation coupled with mineral and heavy metal analysis will fast-track clarity.',
      bullets: [
        '90-minute Initial Naturopathy Consultation ($180)',
        'Oligoscan Mineral & Heavy Metal Analysis ($120)',
        'Personalized treatment roadmap and priority protocol',
        'Custom herbal formulation if appropriate',
      ],
      primaryCta: { label: 'Book Your Consultation', href: '/booking' },
      secondaryCta: { label: 'Explore Our Services', href: '/practitioner' },
    }
  }

  if (level === 'medium') {
    return {
      title: 'Initial Naturopathy Consultation',
      summary:
        'Let’s go deeper into the symptoms you flagged and create a personalized plan you can execute confidently.',
      bullets: [
        '90-minute Initial Consultation ($180)',
        'Comprehensive history & symptom review',
        'Targeted recommendations for nutrition, herbs, and lifestyle',
        'Testing options available if needed',
      ],
      primaryCta: { label: 'Schedule Your Appointment', href: '/booking' },
      secondaryCta: { label: 'Download Our Free Gut Guide', href: '/wellness' },
    }
  }

  return {
    title: 'Start with Educational Resources',
    summary:
      score >= 80
        ? 'You are on a solid path. Continue fine-tuning with our trusted resources until you are ready for bespoke support.'
        : 'Build confidence with foundational education before diving into deeper work. These resources will help you establish momentum.',
    bullets: [
      'Free 7-Day Gut Reset Guide',
      'Video: Understanding Oligoscan Testing',
      'Article: Heavy Metals – The Hidden Health Thieves',
    ],
    primaryCta: { label: 'Access Free Resources', href: '/wellness' },
    secondaryCta: { label: 'Book a Discovery Call', href: '/practitioner' },
  }
}
