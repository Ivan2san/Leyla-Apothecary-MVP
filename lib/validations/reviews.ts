import { z } from 'zod'

// Create review schema
export const createReviewSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be at most 1000 characters')
    .trim(),
})

// Update review schema (all fields optional)
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim()
    .optional(),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be at most 1000 characters')
    .trim()
    .optional(),
})

// Vote schema
export const voteSchema = z.object({
  is_helpful: z.boolean(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type VoteInput = z.infer<typeof voteSchema>
