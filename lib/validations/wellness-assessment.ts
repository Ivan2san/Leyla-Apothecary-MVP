import { z } from 'zod'

export const yesNoSometimesField = z.enum(['yes', 'no', 'sometimes'])

const australianPhoneRegex = /^(?:\+?61|0)[2-478](?:[ \-]?[0-9]){8}$/

const optionalString = (max = 120) =>
  z.preprocess(
    (val) => {
      if (typeof val !== 'string') return undefined
      const trimmed = val.trim()
      return trimmed.length ? trimmed : undefined
    },
    z
      .string()
      .max(max, `Keep responses under ${max} characters.`)
      .optional()
  )

export const wellnessAssessmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter at least 2 characters.')
    .max(80, 'Keep names under 80 characters.'),
  email: z
    .string()
    .email('Enter a valid email address.')
    .transform((val) => val.trim().toLowerCase()),
  phone: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return undefined
      const trimmed = val.trim()
      return trimmed.length ? trimmed : undefined
    },
    z
      .string()
      .regex(australianPhoneRegex, 'Use a valid Australian phone number.')
      .optional()
  ),
  location: optionalString(),
  ip_address: optionalString(),
  q1_digestive_issues: yesNoSometimesField,
  q2_sleep_quality: yesNoSometimesField,
  q3_medications: yesNoSometimesField,
  q4_processed_foods: yesNoSometimesField,
  q5_energy_crashes: yesNoSometimesField,
  q6_water_intake: yesNoSometimesField,
  q7_toxic_exposure: yesNoSometimesField,
  q8_symptoms: yesNoSometimesField,
  q9_supplements: yesNoSometimesField,
  q10_unresolved_issues: yesNoSometimesField,
  current_situation: z.enum([
    'just_beginning',
    'managing_chronic',
    'years_no_resolution',
    'generally_healthy',
    'recovering',
  ]),
  primary_goal: z.enum([
    'resolve_digestive',
    'increase_energy',
    'address_toxic_load',
    'lose_weight',
    'address_specific_symptoms',
    'optimize_health',
  ]),
  biggest_obstacle: z.enum([
    'dont_know_where_to_start',
    'tried_many_things',
    'conflicting_information',
    'cost_of_care',
    'not_enough_time',
    'dismissed_by_practitioners',
  ]),
  preferred_support: z.enum([
    'self_guided',
    'one_time_consult',
    'comprehensive_testing',
    'ongoing_support',
    'full_service_partnership',
  ]),
  additional_notes: optionalString(1200),
  utm_source: optionalString(),
  utm_medium: optionalString(),
  utm_campaign: optionalString(),
})

export type WellnessAssessmentSchema = typeof wellnessAssessmentSchema
export type WellnessAssessmentInput = z.infer<typeof wellnessAssessmentSchema>
