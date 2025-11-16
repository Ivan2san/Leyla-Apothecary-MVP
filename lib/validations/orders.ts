import { z } from 'zod'

// Shipping address schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(50),
  zipCode: z.string().min(1, 'ZIP code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
})

const productOrderItemSchema = z.object({
  type: z.literal('product').optional(),
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
})

const compoundOrderItemSchema = z.object({
  type: z.literal('compound'),
  compoundId: z.string().uuid('Invalid compound ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
})

export const orderItemSchema = z.union([
  productOrderItemSchema,
  compoundOrderItemSchema,
])

// Create order request schema
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot contain more than 50 items'),
  shippingAddress: shippingAddressSchema,
  subtotal: z.number().nonnegative(), // Will be recalculated server-side
  shippingCost: z.number().nonnegative(), // Will be recalculated server-side
  tax: z.number().nonnegative(), // Will be recalculated server-side
  totalAmount: z.number().positive(), // Will be recalculated server-side
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type ProductOrderItemInput = z.infer<typeof productOrderItemSchema>
export type CompoundOrderItemInput = z.infer<typeof compoundOrderItemSchema>
