import { z } from 'zod'

export const guidedAssessmentSchema = z.object({
  primary_concern: z
    .string()
    .min(10, 'Please describe your primary concern in more detail.')
    .max(500, 'Keep descriptions under 500 characters.'),
  goals: z
    .array(
      z.enum([
        'sleep',
        'stress',
        'digestion',
        'immunity',
        'energy',
        'detox',
      ])
    )
    .min(1, 'Select at least one health goal.')
    .max(3, 'Focus on up to three goals so we can craft a precise blend.'),
  medications: z.array(z.string()).max(10).default([]),
  allergies: z.array(z.string()).max(10).default([]),
  pregnancy_status: z.enum(['not_pregnant', 'pregnant', 'nursing', 'unsure']),
  sensitivities: z
    .array(
      z.enum([
        'avoid_bitter',
        'avoid_alcohol',
        'sensitive_stimulants',
        'sensitive_digestive',
      ])
    )
    .max(4)
    .default([]),
  taste_preferences: z
    .array(z.enum(['sweet', 'bitter', 'floral', 'spicy', 'earthy']))
    .max(5)
    .default([]),
  stimulant_sensitivity: z.enum(['low', 'medium', 'high']),
  sleep_quality: z.enum(['rested', 'tired', 'wired']),
  notes: z
    .string()
    .max(500, 'Notes are limited to 500 characters.')
    .optional(),
})

const shortNoteSchema = z
  .string()
  .max(400, 'Keep notes concise (400 characters max).')
  .optional()

export const oligoscanMineralStatusSchema = z.enum([
  'optimal',
  'borderline',
  'depleted',
  'excess',
])

export const oligoscanHeavyMetalStatusSchema = z.enum([
  'none',
  'mild_burden',
  'moderate_burden',
  'high_burden',
])

export const oligoscanVitaminStatusSchema = z.enum([
  'optimal',
  'borderline',
  'depleted',
])

export const oligoscanAssessmentSchema = z.object({
  bookingId: z.string().uuid(),
  userId: z.string().uuid(),
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .min(0, 'Minimum score is 0')
    .max(10, 'Maximum score is 10'),
  summary: z
    .string()
    .min(20, 'Please provide a short summary of the findings.')
    .max(1200, 'Summary must be under 1200 characters.'),
  keyFindings: z
    .array(
      z
        .string()
        .min(3, 'Key findings should be at least a few words.')
        .max(180, 'Keep key findings brief.')
    )
    .min(3, 'Provide at least three key findings.')
    .max(6, 'Limit to six key findings.'),
  categories: z.object({
    minerals: z.object({
      status: oligoscanMineralStatusSchema,
      notes: shortNoteSchema,
    }),
    heavyMetals: z.object({
      status: oligoscanHeavyMetalStatusSchema,
      notes: shortNoteSchema,
    }),
    vitamins: z.object({
      status: oligoscanVitaminStatusSchema,
      notes: shortNoteSchema,
    }),
  }),
})

export type GuidedAssessmentInput = z.infer<typeof guidedAssessmentSchema>
export type OligoscanAssessmentInput = z.infer<typeof oligoscanAssessmentSchema>
