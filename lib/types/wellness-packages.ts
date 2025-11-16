import type { BookingType } from '@/lib/types/booking.types'

export type PackageEnrolmentStatus = 'active' | 'completed' | 'expired'

export type PackageIncludeCounts = Record<string, number>

export type SessionCreditEntry = {
  included: number
  used: number
}

export type SessionCreditLedger = Record<BookingType | string, SessionCreditEntry>

export interface WellnessPackage {
  id: string
  slug: string
  name: string
  description: string
  price_cents: number
  currency: string
  duration_weeks: number
  includes: PackageIncludeCounts
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WellnessPackageEnrolment {
  id: string
  user_id: string
  package_id: string
  stripe_checkout_id: string | null
  started_at: string | null
  expires_at: string | null
  status: PackageEnrolmentStatus
  session_credits: SessionCreditLedger
  notes: string | null
  created_at: string
  updated_at: string
  wellness_packages?: WellnessPackage
}
