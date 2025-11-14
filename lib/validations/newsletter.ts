import { z } from 'zod'

/**
 * Validation schema for newsletter subscriptions.
 * Keeps email requirements strict and allows optional name/tags fields.
 */
export const newsletterSubscribeSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please enter a valid email address')
    .max(190, 'Email is too long'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or less')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  tags: z.array(z.string().trim().min(1)).max(10).optional(),
})

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>
