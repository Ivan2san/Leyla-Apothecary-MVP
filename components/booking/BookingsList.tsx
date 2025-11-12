"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BookingWithDetails } from '@/lib/types/booking.types'
import { format, parseISO, isPast } from 'date-fns'
import { Calendar, Clock, DollarSign, X, Video } from 'lucide-react'

export function BookingsList() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    setCancelling(bookingId)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel booking')
      }

      // Refresh bookings list
      await fetchBookings()
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      alert(err.message || 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50'
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'completed':
        return 'text-gray-600 bg-gray-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      case 'no_show':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === 'scheduled' || b.status === 'confirmed') &&
      !isPast(parseISO(b.date + 'T' + b.time))
  )

  const pastBookings = bookings.filter(
    (b) =>
      b.status === 'completed' ||
      b.status === 'cancelled' ||
      b.status === 'no_show' ||
      isPast(parseISO(b.date + 'T' + b.time))
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-forest/60">Loading your bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-sage/20">
        <CardContent className="pt-8 pb-8 text-center">
          <Calendar className="h-16 w-16 text-sage mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-forest mb-2">
            No bookings yet
          </h3>
          <p className="text-forest/60 mb-4">
            Book your first consultation to get started
          </p>
          <Button
            onClick={() => (window.location.href = '/booking')}
            className="bg-terracotta hover:bg-terracotta/90 text-white"
          >
            Book Consultation
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-lora font-bold text-forest mb-4">
            Upcoming Consultations
          </h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border-sage/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-forest">
                        {booking.type_config?.name}
                      </CardTitle>
                      <CardDescription className="text-forest/60">
                        {booking.type_config?.description}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        {format(parseISO(booking.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        {booking.time.substring(0, 5)} ({booking.duration_minutes}{' '}
                        min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        ${booking.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-sage/5 rounded-lg">
                      <p className="text-sm text-forest/70 font-medium mb-1">
                        Your Notes:
                      </p>
                      <p className="text-sm text-forest">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {booking.meeting_link && (
                      <Button
                        onClick={() => window.open(booking.meeting_link!, '_blank')}
                        className="bg-terracotta hover:bg-terracotta/90 text-white"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}

                    {booking.status !== 'cancelled' && (
                      <Button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-lora font-bold text-forest mb-4">
            Past Consultations
          </h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="border-sage/20 opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-forest">
                        {booking.type_config?.name}
                      </CardTitle>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        {format(parseISO(booking.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        {booking.time.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-sage" />
                      <span className="text-sm text-forest">
                        ${booking.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
