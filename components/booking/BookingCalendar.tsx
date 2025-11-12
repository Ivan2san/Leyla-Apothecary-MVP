"use client"

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BookingType, TimeSlot } from '@/lib/types/booking.types'
import { format, addDays, startOfToday } from 'date-fns'

interface BookingCalendarProps {
  bookingType: BookingType
  selectedDate: Date | null
  selectedTime: string | null
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
}

export function BookingCalendar({
  bookingType,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: BookingCalendarProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = startOfToday()
  const minDate = format(today, 'yyyy-MM-dd')
  const maxDate = format(addDays(today, 90), 'yyyy-MM-dd') // 90 days in advance

  // Fetch available slots when date or booking type changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const fetchAvailableSlots = async () => {
      setLoading(true)
      setError(null)

      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const response = await fetch(
          `/api/bookings/available-slots?date=${dateStr}&type=${bookingType}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch available slots')
        }

        const data = await response.json()
        setAvailableSlots(data.slots || [])
      } catch (err) {
        console.error('Error fetching available slots:', err)
        setError('Failed to load available time slots')
        setAvailableSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDate, bookingType])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + 'T00:00:00')
    onDateSelect(date)
    onTimeSelect('') // Reset time selection when date changes
  }

  const formatTimeSlot = (time: string) => {
    // Convert from "HH:MM:SS" to "h:mm A"
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <Card className="border-sage/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-forest">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            min={minDate}
            max={maxDate}
            value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
            className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-forest"
          />
          <p className="mt-2 text-sm text-forest/60">
            Book up to 90 days in advance
          </p>
        </CardContent>
      </Card>

      {/* Time Slot Picker */}
      {selectedDate && (
        <Card className="border-sage/20">
          <CardHeader>
            <CardTitle className="text-forest">
              Available Times for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-forest/60">
                Loading available times...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">{error}</div>
            )}

            {!loading && !error && availableSlots.length === 0 && (
              <div className="text-center py-8 text-forest/60">
                No available times for this date. Please select another date.
              </div>
            )}

            {!loading && !error && availableSlots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time_slot}
                    onClick={() => onTimeSelect(slot.time_slot)}
                    disabled={!slot.is_available}
                    variant={selectedTime === slot.time_slot ? 'default' : 'outline'}
                    className={
                      selectedTime === slot.time_slot
                        ? 'bg-terracotta hover:bg-terracotta/90 text-white'
                        : slot.is_available
                        ? 'border-sage/30 text-forest hover:bg-sage/10'
                        : 'opacity-40 cursor-not-allowed'
                    }
                  >
                    {formatTimeSlot(slot.time_slot)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
