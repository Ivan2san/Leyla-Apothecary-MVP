import { z } from 'zod'
import { slugify } from '@/lib/utils'

const PRODUCT_CATEGORIES = [
  'digestive',
  'cardiovascular',
  'immune',
  'nervous',
  'respiratory',
  'musculoskeletal',
  'endocrine',
  'skin',
  'reproductive',
] as const

const textArray = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : []
  )

const baseProductSchema = z.object({
  name: z.string().min(3).max(120),
  slug: z
    .string()
    .min(3)
    .transform((value) => slugify(value)),
  description: z.string().min(20),
  dosage_instructions: z.string().min(10),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce.number().min(0),
  volume_ml: z.coerce.number().int().positive(),
  stock_quantity: z.coerce.number().int().min(0),
  is_active: z.coerce.boolean().optional().default(true),
  benefits: textArray,
  ingredients: textArray,
  contraindications: textArray,
})

export const adminProductCreateSchema = baseProductSchema

export const adminProductUpdateSchema = baseProductSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })

export type AdminProductInput = z.infer<typeof adminProductCreateSchema>
