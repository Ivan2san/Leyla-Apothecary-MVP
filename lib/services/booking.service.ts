/**
 * Booking Service
 * Handles all booking-related business logic and database operations
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Booking,
  BookingType,
  BookingTypeConfig,
  BookingWithDetails,
  TimeSlot,
  BlockedDate,
  AvailabilitySlot,
} from '@/lib/types/booking.types'

export class BookingService {
  /**
   * Get all booking type configurations
   */
  static async getBookingTypes(): Promise<BookingTypeConfig[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('booking_type_config')
      .select('*')
      .eq('is_active', true)
      .order('duration_minutes', { ascending: true })

    if (error) {
      console.error('Error fetching booking types:', error)
      throw new Error('Failed to fetch booking types')
    }

    return data || []
  }

  /**
   * Get a specific booking type configuration
   */
  static async getBookingType(type: BookingType): Promise<BookingTypeConfig | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('booking_type_config')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching booking type:', error)
      return null
    }

    return data
  }

  /**
   * Get available time slots for a specific date and booking type
   */
  static async getAvailableSlots(
    date: string,
    bookingType: BookingType
  ): Promise<TimeSlot[]> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_available_slots', {
      p_date: date,
      p_booking_type: bookingType,
    })

    if (error) {
      console.error('Error fetching available slots:', error)
      throw new Error('Failed to fetch available slots')
    }

    return data || []
  }

  /**
   * Check if a specific time slot is available
   */
  static async isSlotAvailable(
    date: string,
    time: string,
    durationMinutes: number
  ): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('is_slot_available', {
      p_date: date,
      p_time: time,
      p_duration_minutes: durationMinutes,
    })

    if (error) {
      console.error('Error checking slot availability:', error)
      return false
    }

    return data === true
  }

  /**
   * Create a new booking
   */
  static async createBooking(
    userId: string,
    type: BookingType,
    date: string,
    time: string,
    notes?: string
  ): Promise<Booking> {
    const supabase = await createClient()

    // Get booking type config for price and duration
    const typeConfig = await this.getBookingType(type)
    if (!typeConfig) {
      throw new Error('Invalid booking type')
    }

    // Verify slot is available
    const isAvailable = await this.isSlotAvailable(
      date,
      time,
      typeConfig.duration_minutes
    )
    if (!isAvailable) {
      throw new Error('Selected time slot is not available')
    }

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        type,
        date,
        time,
        duration_minutes: typeConfig.duration_minutes,
        price: typeConfig.price,
        status: 'scheduled',
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      throw new Error('Failed to create booking')
    }

    return data
  }

  /**
   * Get all bookings for a user
   */
  static async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error('Failed to fetch bookings')
    }

    // Fetch booking type configs
    const bookingTypes = await this.getBookingTypes()
    const typeConfigMap = new Map(bookingTypes.map((t) => [t.type, t]))

    return (data || []).map((booking: any) => ({
      ...booking,
      type_config: typeConfigMap.get(booking.type),
      user_name: booking.profiles?.full_name,
      user_email: booking.profiles?.email,
    }))
  }

  /**
   * Get a specific booking by ID
   */
  static async getBooking(bookingId: string): Promise<BookingWithDetails | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return null
    }

    const typeConfig = await this.getBookingType(data.type)

    return {
      ...data,
      type_config: typeConfig || undefined,
      user_name: data.profiles?.full_name,
      user_email: data.profiles?.email,
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
    const supabase = await createClient()

    // Verify booking belongs to user
    const booking = await this.getBooking(bookingId)
    if (!booking || booking.user_id !== userId) {
      throw new Error('Booking not found or unauthorized')
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled')
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel a completed booking')
    }

    // Cancel the booking
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      console.error('Error cancelling booking:', error)
      throw new Error('Failed to cancel booking')
    }

    return true
  }

  /**
   * Get upcoming bookings for a user
   */
  static async getUpcomingBookings(userId: string): Promise<BookingWithDetails[]> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('user_id', userId)
      .gte('date', today)
      .in('status', ['scheduled', 'confirmed'])
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching upcoming bookings:', error)
      throw new Error('Failed to fetch upcoming bookings')
    }

    const bookingTypes = await this.getBookingTypes()
    const typeConfigMap = new Map(bookingTypes.map((t) => [t.type, t]))

    return (data || []).map((booking: any) => ({
      ...booking,
      type_config: typeConfigMap.get(booking.type),
      user_name: booking.profiles?.full_name,
      user_email: booking.profiles?.email,
    }))
  }

  /**
   * Get blocked dates (for calendar display)
   */
  static async getBlockedDates(
    startDate: string,
    endDate: string
  ): Promise<BlockedDate[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching blocked dates:', error)
      return []
    }

    return data || []
  }

  /**
   * Get availability slots for a specific day of week
   */
  static async getAvailabilitySlots(dayOfWeek?: number): Promise<AvailabilitySlot[]> {
    const supabase = await createClient()

    let query = supabase
      .from('availability_slots')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (dayOfWeek !== undefined) {
      query = query.eq('day_of_week', dayOfWeek)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching availability slots:', error)
      return []
    }

    return data || []
  }
}
