/**
 * Booking System Types
 * Types for consultation bookings, availability management, and scheduling
 */

export type BookingType =
  | 'initial'
  | 'followup'
  | 'quick'
  | 'oligoscan_assessment'
  | 'wellness_package_initial'
  | 'meditation_session'
  | 'sauna_session'
  | 'dietary_session'

export type OligoscanGender = 'female' | 'male' | 'other' | 'prefer_not_to_say'
export type OligoscanBloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'unknown'

export interface OligoscanBiometrics {
  dateOfBirth: string
  gender: OligoscanGender
  bloodType: OligoscanBloodType
  heightCm: number
  weightKg: number
}

export interface BookingMetadata {
  biometrics?: OligoscanBiometrics
}

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface BookingTypeConfig {
  type: BookingType
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_package_only: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  type: BookingType
  date: string // ISO date format (YYYY-MM-DD)
  time: string // Time format (HH:MM:SS)
  duration_minutes: number
  price: number
  status: BookingStatus
  notes: string | null
  meeting_link: string | null
  payment_intent_id: string | null
  reminder_sent: boolean
  metadata: BookingMetadata | null
  package_enrolment_id: string | null
  is_package_booking: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilitySlot {
  id: string
  day_of_week: number // 0-6, where 0 is Sunday
  start_time: string // Time format (HH:MM:SS)
  end_time: string // Time format (HH:MM:SS)
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlockedDate {
  id: string
  date: string // ISO date format (YYYY-MM-DD)
  reason: string | null
  created_at: string
}

export interface TimeSlot {
  time_slot: string // Time format (HH:MM:SS)
  is_available: boolean
}

// Request/Response types for API

export interface CreateBookingRequest {
  type: BookingType
  date: string // ISO date format (YYYY-MM-DD)
  time: string // Time format (HH:MM:SS)
  notes?: string
}

export interface CreateBookingResponse {
  booking: Booking
  payment_client_secret: string | null
}

export interface GetAvailableSlotsRequest {
  date: string // ISO date format (YYYY-MM-DD)
  type: BookingType
}

export interface GetAvailableSlotsResponse {
  date: string
  type: BookingType
  slots: TimeSlot[]
}

export interface CancelBookingRequest {
  booking_id: string
}

// Client-side types for UI

export interface BookingFormData {
  type: BookingType
  date: Date | null
  time: string | null
  notes: string
}

export interface BookingWithDetails extends Booking {
  type_config?: BookingTypeConfig
  user_name?: string
  user_email?: string
}
