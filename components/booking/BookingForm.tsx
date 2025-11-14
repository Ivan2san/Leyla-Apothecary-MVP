"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingCalendar } from './BookingCalendar'
import type { BookingType, BookingTypeConfig } from '@/lib/types/booking.types'
import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'

export function BookingForm() {
  const router = useRouter()

  const [bookingTypes, setBookingTypes] = useState<BookingTypeConfig[]>([])
  const [selectedType, setSelectedType] = useState<BookingType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch booking types on mount
  useEffect(() => {
    const fetchBookingTypes = async () => {
      try {
        const response = await fetch('/api/bookings/types')
        if (!response.ok) throw new Error('Failed to fetch booking types')
        const data = await response.json()
        setBookingTypes(data.bookingTypes || [])

        // Auto-select first type
        if (data.bookingTypes && data.bookingTypes.length > 0) {
          setSelectedType(data.bookingTypes[0].type)
        }
      } catch (err) {
        console.error('Error fetching booking types:', err)
        setError('Failed to load booking options')
      }
    }

    fetchBookingTypes()
  }, [])

  const selectedTypeConfig = bookingTypes.find((t) => t.type === selectedType)

  const canSubmit = selectedType && selectedDate && selectedTime

  const handleSubmit = async () => {
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          date: dateStr,
          time: selectedTime,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSuccess(true)

      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        router.push('/account/bookings')
      }, 2000)
    } catch (err: any) {
      console.error('Error creating booking:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-sage/20 max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-forest mb-2">Booking Confirmed!</h2>
          <p className="text-forest/70 mb-4">
            Your consultation has been scheduled successfully.
          </p>
          <p className="text-sm text-forest/60">
            Redirecting to your bookings...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Booking Type Selection */}
      <Card className="border-sage/20">
        <CardHeader>
          <CardTitle className="text-forest">Select Consultation Type</CardTitle>
          <CardDescription className="text-forest/60">
            Choose the type of consultation that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookingTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => {
                  setSelectedType(type.type)
                  // Reset date/time when changing type
                  setSelectedDate(null)
                  setSelectedTime(null)
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedType === type.type
                    ? 'border-terracotta bg-terracotta/5'
                    : 'border-sage/30 hover:border-sage/50'
                }`}
              >
                <h3 className="font-semibold text-forest mb-1">{type.name}</h3>
                <p className="text-sm text-forest/60 mb-2">{type.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-forest">
                    {type.duration_minutes} min
                  </span>
                  <span className="text-lg font-bold text-terracotta">
                    ${type.price.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Selection */}
      {selectedType && (
        <BookingCalendar
          bookingType={selectedType}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateSelect={setSelectedDate}
          onTimeSelect={setSelectedTime}
        />
      )}

      {/* Notes */}
      {selectedType && selectedDate && selectedTime && (
        <Card className="border-sage/20">
          <CardHeader>
            <CardTitle className="text-forest">Additional Notes (Optional)</CardTitle>
            <CardDescription className="text-forest/60">
              Share any specific concerns or topics you&apos;d like to discuss
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Tell us about your health goals or concerns..."
              className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-forest resize-none"
            />
            <p className="mt-2 text-sm text-forest/60 text-right">
              {notes.length}/1000 characters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary and Submit */}
      {canSubmit && (
        <Card className="border-sage/20 bg-sage/5">
          <CardHeader>
            <CardTitle className="text-forest">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-forest/70">Type:</span>
                <span className="font-medium text-forest">{selectedTypeConfig?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/70">Date:</span>
                <span className="font-medium text-forest">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/70">Time:</span>
                <span className="font-medium text-forest">
                  {selectedTime && selectedTime.substring(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/70">Duration:</span>
                <span className="font-medium text-forest">
                  {selectedTypeConfig?.duration_minutes} minutes
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sage/30">
                <span className="font-semibold text-forest">Total:</span>
                <span className="font-bold text-terracotta text-lg">
                  ${selectedTypeConfig?.price.toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold py-6 text-lg"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>

            <p className="text-xs text-forest/60 text-center">
              Payment will be processed after your consultation
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
