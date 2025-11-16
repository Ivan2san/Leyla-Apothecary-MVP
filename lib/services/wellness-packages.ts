import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { BookingType } from '@/lib/types/booking.types'
import type {
  SessionCreditEntry,
  SessionCreditLedger,
  WellnessPackage,
  WellnessPackageEnrolment,
} from '@/lib/types/wellness-packages'

const PACKAGE_BUFFER_WEEKS = 6

function createSessionLedgerFromIncludes(
  includes: Record<string, number>
): SessionCreditLedger {
  return Object.entries(includes || {}).reduce<SessionCreditLedger>((acc, [sessionType, count]) => {
    acc[sessionType] = {
      included: count,
      used: 0,
    }
    return acc
  }, {})
}

function isCreditExhausted(entry?: SessionCreditEntry) {
  if (!entry) return true
  return entry.used >= entry.included
}

function isEnrolmentExpired(enrolment: WellnessPackageEnrolment) {
  if (!enrolment.expires_at) return false
  const expiry = new Date(enrolment.expires_at)
  return expiry.getTime() < Date.now()
}

export class WellnessPackageService {
  /**
   * Public listing of active packages
   */
  static async getActivePackages(): Promise<WellnessPackage[]> {
    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('wellness_packages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching wellness packages:', error)
      throw new Error('Failed to load wellness packages')
    }

    return (data as WellnessPackage[]) || []
  }

  static async getPackageBySlug(slug: string): Promise<WellnessPackage | null> {
    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('wellness_packages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching package by slug:', error)
      throw new Error('Failed to load wellness package')
    }

    return (data as WellnessPackage) || null
  }

  static async getActiveEnrolment(userId: string): Promise<WellnessPackageEnrolment | null> {
    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('wellness_package_enrolments')
      .select('*, wellness_packages(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active enrolment:', error)
      throw new Error('Failed to load wellness package enrolment')
    }

    return (data as WellnessPackageEnrolment) || null
  }

  static async getEnrolmentsForUser(userId: string): Promise<WellnessPackageEnrolment[]> {
    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('wellness_package_enrolments')
      .select('*, wellness_packages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching enrolments:', error)
      throw new Error('Failed to load package enrolments')
    }

    return (data as WellnessPackageEnrolment[]) || []
  }

  static async getEnrolmentByCheckoutId(
    checkoutId: string
  ): Promise<WellnessPackageEnrolment | null> {
    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('wellness_package_enrolments')
      .select('*, wellness_packages(*)')
      .eq('stripe_checkout_id', checkoutId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error looking up enrolment by checkout ID:', error)
      throw new Error('Failed to resolve package enrolment by checkout')
    }

    return (data as WellnessPackageEnrolment) || null
  }

  static async createEnrolment(options: {
    userId: string
    packageId?: string
    packageSlug?: string
    stripeCheckoutId?: string
    expiresAt?: Date
    notes?: string
  }): Promise<WellnessPackageEnrolment> {
    const client = createServiceRoleClient()

    let packageRecord: WellnessPackage | null = null

    if (options.packageId) {
      const { data, error } = await client
        .from('wellness_packages')
        .select('*')
        .eq('id', options.packageId)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to lookup wellness package: ${error.message}`)
      }

      packageRecord = data as WellnessPackage
    } else if (options.packageSlug) {
      packageRecord = await this.getPackageBySlug(options.packageSlug)
    }

    if (!packageRecord) {
      throw new Error('Wellness package not found')
    }

    const ledger = createSessionLedgerFromIncludes(packageRecord.includes)
    const expiresAt =
      options.expiresAt ??
      (() => {
        const expiry = new Date()
        const totalWeeks = packageRecord.duration_weeks + PACKAGE_BUFFER_WEEKS
        expiry.setDate(expiry.getDate() + totalWeeks * 7)
        return expiry
      })()

    const { data, error } = await client
      .from('wellness_package_enrolments')
      .insert({
        user_id: options.userId,
        package_id: packageRecord.id,
        stripe_checkout_id: options.stripeCheckoutId || null,
        session_credits: ledger,
        expires_at: expiresAt.toISOString(),
        notes: options.notes || null,
      })
      .select('*, wellness_packages(*)')
      .single()

    if (error) {
      console.error('Error creating package enrolment:', error)
      throw new Error('Failed to create wellness package enrolment')
    }

    return data as WellnessPackageEnrolment
  }

  static async consumeSessionCredit(params: {
    enrolmentId: string
    bookingType: BookingType
    userId?: string
  }): Promise<WellnessPackageEnrolment> {
    const client = createServiceRoleClient()

    const { data, error } = await client
      .from('wellness_package_enrolments')
      .select('*')
      .eq('id', params.enrolmentId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to load package enrolment: ${error.message}`)
    }

    if (!data) {
      throw new Error('Package enrolment not found')
    }

    const enrolment = data as WellnessPackageEnrolment

    if (params.userId && enrolment.user_id !== params.userId) {
      throw new Error('Package enrolment does not belong to user')
    }

    if (enrolment.status !== 'active') {
      throw new Error('Package enrolment is no longer active')
    }

    if (isEnrolmentExpired(enrolment)) {
      throw new Error('Package enrolment has expired')
    }

    const ledger = enrolment.session_credits || {}
    const entry = ledger[params.bookingType]

    if (!entry || isCreditExhausted(entry)) {
      throw new Error('No credits remaining for this session type')
    }

    ledger[params.bookingType] = {
      ...entry,
      used: entry.used + 1,
    }

    const { data: updated, error: updateError } = await client
      .from('wellness_package_enrolments')
      .update({
        session_credits: ledger,
      })
      .eq('id', params.enrolmentId)
      .select('*')
      .single()

    if (updateError) {
      throw new Error(`Failed to update session credits: ${updateError.message}`)
    }

    return updated as WellnessPackageEnrolment
  }

  static async releaseSessionCredit(params: {
    enrolmentId: string
    bookingType: BookingType
  }) {
    const client = createServiceRoleClient()

    const { data, error } = await client
      .from('wellness_package_enrolments')
      .select('*')
      .eq('id', params.enrolmentId)
      .maybeSingle()

    if (error || !data) {
      console.error('Failed to load enrolment for release:', error)
      return
    }

    const enrolment = data as WellnessPackageEnrolment
    const ledger = enrolment.session_credits || {}
    const entry = ledger[params.bookingType]

    if (!entry || entry.used <= 0) {
      return
    }

    ledger[params.bookingType] = {
      ...entry,
      used: Math.max(0, entry.used - 1),
    }

    const { error: updateError } = await client
      .from('wellness_package_enrolments')
      .update({ session_credits: ledger })
      .eq('id', params.enrolmentId)

    if (updateError) {
      console.error('Failed to release session credit:', updateError)
    }
  }

  /**
   * Lightweight helper for client-rendered dashboard to fetch enrolments
   */
  static async getUserFacingEnrolments() {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    return this.getEnrolmentsForUser(user.id)
  }
}
