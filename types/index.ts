// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export type ProductImageType = 'primary' | 'lifestyle' | 'detail' | 'scale'

export interface ProductImage {
  id: string
  url: string
  alt: string
  type: ProductImageType
  position: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: ProductCategory
  price: number
  volume_ml: number
  stock_quantity: number
  image_url?: string // Deprecated: use images array instead
  images?: ProductImage[]
  ingredients: string[]
  benefits: string[]
  dosage_instructions: string
  contraindications?: string[]
  is_active?: boolean
  created_at: string
  updated_at: string
}

export type ProductCategory =
  | "digestive"
  | "cardiovascular"
  | "immune"
  | "nervous"
  | "respiratory"
  | "musculoskeletal"
  | "endocrine"
  | "skin"
  | "reproductive"

export interface Compound {
  id: string
  name: string
  user_id: string
  tier: 1 | 2 | 3
  ingredients: CompoundIngredient[]
  total_price: number
  status: "draft" | "active" | "archived"
  notes?: string
  created_at: string
  updated_at: string
}

export interface CompoundIngredient {
  product_id: string
  percentage: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shipping_address: Address
  payment_intent_id?: string
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  compound_id?: string
  quantity: number
  price: number
  product?: Product
  compound?: Compound
}

export interface Booking {
  id: string
  user_id: string
  type: BookingType
  date: string
  time: string
  duration_minutes: number
  price: number
  status: BookingStatus
  notes?: string
  meeting_link?: string
  created_at: string
  updated_at: string
}

export type BookingType = "initial" | "followup" | "quick"

export type BookingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

// Cart types
export interface CartItem {
  type: "product" | "compound"
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface BookingFormData {
  type: BookingType
  date: string
  time: string
  notes?: string
}

export interface CheckoutFormData {
  email: string
  shipping_address: Address
  billing_same_as_shipping: boolean
  billing_address?: Address
}

// Review types
export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name?: string // Joined from profiles
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  comment: string
  verified_purchase: boolean
  helpful_count: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface CreateReviewInput {
  product_id: string
  rating: number
  title: string
  comment: string
}

export interface UpdateReviewInput {
  rating?: number
  title?: string
  comment?: string
}

export interface ReviewVote {
  id: string
  review_id: string
  user_id: string
  is_helpful: boolean
  created_at: string
}
