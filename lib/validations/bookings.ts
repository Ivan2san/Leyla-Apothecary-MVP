/**
 * Booking Validation Schemas
 * Zod schemas for validating booking-related requests
 */

import { z } from 'zod'

export const bookingTypeSchema = z.enum([
  'initial',
  'followup',
  'quick',
  'oligoscan_assessment',
  'wellness_package_initial',
  'meditation_session',
  'sauna_session',
  'dietary_session',
])

export const oligoscanGenderSchema = z.enum([
  'female',
  'male',
  'other',
  'prefer_not_to_say',
])

export const oligoscanBloodTypeSchema = z.enum([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'unknown',
])

export const bookingStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
])

// Validate ISO date format (YYYY-MM-DD)
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

// Validate time format (HH:MM or HH:MM:SS)
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
  message: 'Time must be in HH:MM or HH:MM:SS format',
})

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
  .refine((value) => {
    const dob = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dob <= today
  }, { message: 'Date of birth cannot be in the future' })

export const oligoscanBiometricsSchema = z.object({
  dateOfBirth: dateOfBirthSchema,
  gender: oligoscanGenderSchema,
  bloodType: oligoscanBloodTypeSchema,
  heightCm: z
    .number({ invalid_type_error: 'Height must be a number' })
    .min(50, 'Height must be at least 50 cm')
    .max(250, 'Height must be less than 250 cm'),
  weightKg: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(20, 'Weight must be at least 20 kg')
    .max(250, 'Weight must be less than 250 kg'),
})

// Create booking request validation
export const createBookingSchema = z
  .object({
    type: bookingTypeSchema,
    date: dateSchema.refine((date) => {
      const bookingDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return bookingDate >= today
    }, {
      message: 'Booking date must be today or in the future',
    }),
    time: timeSchema,
    notes: z.string().max(1000).optional(),
    biometrics: oligoscanBiometricsSchema.optional(),
    usePackageCredit: z.boolean().optional(),
    packageEnrolmentId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'oligoscan_assessment' && !data.biometrics) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['biometrics'],
        message: 'Biometrics are required for Oligoscan assessments',
      })
    }

    const isPackageOnlyType = [
      'wellness_package_initial',
      'meditation_session',
      'sauna_session',
      'dietary_session',
    ].includes(data.type)

    const wantsPackageCredit = data.usePackageCredit === true

    if (wantsPackageCredit && !data.packageEnrolmentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['packageEnrolmentId'],
        message: 'Package enrolment is required when using a package credit',
      })
    }

    if (isPackageOnlyType && !wantsPackageCredit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['usePackageCredit'],
        message: 'This session type requires an active wellness package',
      })
    }
  })

// Get available slots request validation
export const getAvailableSlotsSchema = z.object({
  date: dateSchema,
  type: bookingTypeSchema,
})

// Cancel booking request validation
export const cancelBookingSchema = z.object({
  booking_id: z.string().uuid(),
})

// Update booking status (admin only)
export const updateBookingStatusSchema = z.object({
  booking_id: z.string().uuid(),
  status: bookingStatusSchema,
  meeting_link: z.string().url().optional(),
})

// Availability slot validation (admin only)
export const availabilitySlotSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: timeSchema,
  end_time: timeSchema,
  is_active: z.boolean().optional(),
})

// Blocked date validation (admin only)
export const blockedDateSchema = z.object({
  date: dateSchema.refine((date) => {
    const blockedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return blockedDate >= today
  }, {
    message: 'Blocked date must be today or in the future',
  }),
  reason: z.string().max(500).optional(),
})

// Type exports for use in API routes
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>
export type BlockedDateInput = z.infer<typeof blockedDateSchema>
