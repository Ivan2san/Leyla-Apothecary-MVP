"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingCalendar } from './BookingCalendar'
import type {
  BookingType,
  BookingTypeConfig,
  OligoscanBloodType,
  OligoscanGender,
} from '@/lib/types/booking.types'
import type { WellnessPackageEnrolment } from '@/lib/types/wellness-packages'
import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OligoscanInfoPanel } from '@/components/consultations/oligoscan/OligoscanInfoPanel'
import { OligoscanQuickFacts } from '@/components/consultations/oligoscan/OligoscanQuickFacts'

type BiometricsFormState = {
  dateOfBirth: string
  gender: OligoscanGender | ''
  bloodType: OligoscanBloodType | ''
  heightCm: string
  weightKg: string
}

const createEmptyBiometrics = (): BiometricsFormState => ({
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
})

const formatSessionLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export function BookingForm() {
  const router = useRouter()

  const [bookingTypes, setBookingTypes] = useState<BookingTypeConfig[]>([])
  const [selectedType, setSelectedType] = useState<BookingType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [biometrics, setBiometrics] = useState<BiometricsFormState>(() => createEmptyBiometrics())
  const [prefillAttempted, setPrefillAttempted] = useState(false)
  const [biometricsError, setBiometricsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [packageEnrolment, setPackageEnrolment] = useState<WellnessPackageEnrolment | null>(null)
  const [packageLoading, setPackageLoading] = useState(true)
  const [usePackageCredit, setUsePackageCredit] = useState(false)

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

  useEffect(() => {
    const fetchPackageEnrolment = async () => {
      try {
        const response = await fetch('/api/wellness/enrolment')
        if (!response.ok) {
          throw new Error('Failed to fetch package status')
        }

        const data = await response.json()
        setPackageEnrolment(data.enrolment || null)
      } catch (err) {
        console.warn('Unable to fetch wellness package enrolment:', err)
        setPackageEnrolment(null)
      } finally {
        setPackageLoading(false)
      }
    }

    fetchPackageEnrolment()
  }, [])

  const selectedTypeConfig = bookingTypes.find((t) => t.type === selectedType)
  const creditsLedger = useMemo(
    () =>
      (packageEnrolment?.session_credits || {}) as Record<
        string,
        { included: number; used: number }
      >,
    [packageEnrolment]
  )
  const standardBookingTypes = useMemo(
    () => bookingTypes.filter((t) => !t.is_package_only),
    [bookingTypes]
  )
  const packageEligibleTypes = useMemo(
    () =>
      bookingTypes.filter((t) => {
        const entry = creditsLedger[t.type]
        return entry && entry.used < entry.included
      }),
    [bookingTypes, creditsLedger]
  )
  const displayedBookingTypes = useMemo(
    () => (usePackageCredit ? packageEligibleTypes : standardBookingTypes),
    [usePackageCredit, packageEligibleTypes, standardBookingTypes]
  )
  const hasActivePackage = Boolean(packageEnrolment && packageEnrolment.status === 'active')
  const hasPackageCredits = packageEligibleTypes.length > 0
  const selectedCreditEntry = selectedType ? creditsLedger[selectedType] : undefined
  const packageName = packageEnrolment?.wellness_packages?.name ?? 'Wellness Package'
  const packageExpiry = packageEnrolment?.expires_at
    ? format(new Date(packageEnrolment.expires_at), 'MMMM d, yyyy')
    : null
  const requiresBiometrics = selectedType === 'oligoscan_assessment'
  const heightValue = parseFloat(biometrics.heightCm)
  const weightValue = parseFloat(biometrics.weightKg)
  const heightValid = !Number.isNaN(heightValue) && heightValue >= 50 && heightValue <= 250
  const weightValid = !Number.isNaN(weightValue) && weightValue >= 20 && weightValue <= 250
  const biometricsComplete =
    !requiresBiometrics ||
    (Boolean(biometrics.dateOfBirth && biometrics.gender && biometrics.bloodType) &&
      heightValid &&
      weightValid)

  const canSubmit = Boolean(
    selectedType &&
      selectedDate &&
      selectedTime &&
      (!requiresBiometrics || biometricsComplete) &&
      (!usePackageCredit || (packageEnrolment && selectedCreditEntry))
  )

  useEffect(() => {
    if (!requiresBiometrics) {
      setBiometricsError(null)
      return
    }
    if (biometricsComplete) {
      setBiometricsError(null)
    }
  }, [requiresBiometrics, biometricsComplete])

  useEffect(() => {
    if (!requiresBiometrics || prefillAttempted) {
      return
    }

    const controller = new AbortController()
    setPrefillAttempted(true)

    const fetchProfileBasics = async () => {
      try {
        const response = await fetch('/api/profile/basic', { signal: controller.signal })
        if (!response.ok) {
          return
        }
        const data = await response.json()
        if (data?.profile?.dateOfBirth) {
          setBiometrics((prev) => {
            if (prev.dateOfBirth) return prev
            return {
              ...prev,
              dateOfBirth: data.profile.dateOfBirth as string,
            }
          })
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error('Error pre-filling profile biometrics:', err)
      }
    }

    fetchProfileBasics()

    return () => {
      controller.abort()
    }
  }, [requiresBiometrics, prefillAttempted])

  useEffect(() => {
    if (!hasActivePackage || !hasPackageCredits) {
      setUsePackageCredit(false)
    }
  }, [hasActivePackage, hasPackageCredits])

  useEffect(() => {
    if (displayedBookingTypes.length === 0) {
      setSelectedType(null)
      return
    }
    if (!selectedType || !displayedBookingTypes.some((t) => t.type === selectedType)) {
      setSelectedType(displayedBookingTypes[0]?.type ?? null)
    }
  }, [displayedBookingTypes, selectedType])

  const updateBiometrics = (field: keyof BiometricsFormState, value: string) => {
    setBiometrics((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTypeSelect = (type: BookingType) => {
    setSelectedType(type)
    setSelectedDate(null)
    setSelectedTime(null)
    if (type !== 'oligoscan_assessment') {
      setBiometrics(createEmptyBiometrics())
      setPrefillAttempted(false)
      setBiometricsError(null)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (requiresBiometrics && !biometricsComplete) {
      setBiometricsError('Please complete the biometrics fields before booking.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dateStr = format(selectedDate as Date, 'yyyy-MM-dd')
      const payload: Record<string, any> = {
        type: selectedType,
        date: dateStr,
        time: selectedTime,
      }

      if (notes) {
        payload.notes = notes
      }

      if (requiresBiometrics) {
        payload.biometrics = {
          dateOfBirth: biometrics.dateOfBirth,
          gender: biometrics.gender as OligoscanGender,
          bloodType: biometrics.bloodType as OligoscanBloodType,
          heightCm: heightValue,
          weightKg: weightValue,
        }
      }

      if (usePackageCredit && packageEnrolment) {
        payload.usePackageCredit = true
        payload.packageEnrolmentId = packageEnrolment.id
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSuccess(true)
      setBiometricsError(null)

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
      {!packageLoading && packageEnrolment && (
        <Card className="border-terracotta/30 bg-terracotta/5">
          <CardHeader>
            <CardTitle className="text-forest">{packageName}</CardTitle>
            <CardDescription className="text-forest/70">
              Track your included sessions and apply credits when booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-forest/80">
                  {packageExpiry ? `Use credits by ${packageExpiry}` : 'Active enrolment'}
                </p>
                <p className="text-xs text-forest/60">
                  Remaining credits update automatically after each booking.
                </p>
              </div>
              <Button
                type="button"
                variant={usePackageCredit ? 'default' : 'outline'}
                onClick={() => setUsePackageCredit((prev) => !prev)}
                disabled={!hasPackageCredits}
                className={
                  usePackageCredit
                    ? 'bg-terracotta hover:bg-terracotta/90 text-white'
                    : 'border-terracotta text-terracotta hover:bg-terracotta/5'
                }
              >
                {usePackageCredit ? 'Using package credits' : 'Use package credits'}
              </Button>
            </div>
            {!hasPackageCredits && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                All credits have been used. Reach out if you need assistance booking additional sessions.
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(creditsLedger).map(([sessionType, entry]) => {
                const remaining = Math.max(0, entry.included - entry.used)
                return (
                  <div
                    key={sessionType}
                    className="rounded-lg border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm"
                  >
                    <div className="flex items-center justify-between font-semibold text-forest">
                      <span>{formatSessionLabel(sessionType)}</span>
                      <span>
                        {remaining}/{entry.included}
                      </span>
                    </div>
                    <p className="text-xs text-forest/60">Remaining / total</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Type Selection */}
      <Card className="border-sage/20">
        <CardHeader>
          <CardTitle className="text-forest">Select Consultation Type</CardTitle>
          <CardDescription className="text-forest/60">
            {usePackageCredit
              ? 'Choose a session to book using your package credits'
              : 'Choose the type of consultation that best fits your needs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayedBookingTypes.length === 0 ? (
            <p className="text-sm text-forest/70">
              {usePackageCredit
                ? 'No credits remain for any session type. Book another package or switch to standard booking.'
                : 'No booking types are available right now.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {displayedBookingTypes.map((type) => {
                const credit = creditsLedger[type.type]
                const remainingCredits =
                  credit && credit.included > credit.used
                    ? credit.included - credit.used
                    : 0

                return (
                  <button
                    key={type.type}
                    onClick={() => handleTypeSelect(type.type)}
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
                        {usePackageCredit ? 'Included' : `$${type.price.toFixed(2)}`}
                      </span>
                    </div>
                    {usePackageCredit && credit && (
                      <p className="mt-2 text-xs text-forest/70">
                        {remainingCredits} credit{remainingCredits === 1 ? '' : 's'} remaining
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oligoscan context */}
      {requiresBiometrics && (
        <div className="grid gap-4 md:grid-cols-2">
          <OligoscanInfoPanel />
          <OligoscanQuickFacts />
        </div>
      )}

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

      {/* Oligoscan biometrics */}
      {requiresBiometrics && selectedDate && selectedTime && (
        <Card className="border-terracotta/20">
          <CardHeader>
            <CardTitle className="text-forest">Oligoscan Biometrics</CardTitle>
            <CardDescription className="text-forest/70">
              These details make sure your intracellular scan is tied to the correct profile and
              help Leyla prepare personalised guidance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="oligo-dob">Date of birth</Label>
                <Input
                  id="oligo-dob"
                  type="date"
                  value={biometrics.dateOfBirth}
                  onChange={(event) => updateBiometrics('dateOfBirth', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oligo-gender">Gender</Label>
                <Select
                  value={biometrics.gender || undefined}
                  onValueChange={(value) =>
                    updateBiometrics('gender', value as BiometricsFormState['gender'])
                  }
                >
                  <SelectTrigger id="oligo-gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="oligo-blood-type">Blood type</Label>
                <Select
                  value={biometrics.bloodType || undefined}
                  onValueChange={(value) =>
                    updateBiometrics('bloodType', value as BiometricsFormState['bloodType'])
                  }
                >
                  <SelectTrigger id="oligo-blood-type">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oligo-height">Height (cm)</Label>
                  <Input
                    id="oligo-height"
                    type="number"
                    min={50}
                    max={250}
                    inputMode="decimal"
                    value={biometrics.heightCm}
                    onChange={(event) => updateBiometrics('heightCm', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oligo-weight">Weight (kg)</Label>
                  <Input
                    id="oligo-weight"
                    type="number"
                    min={20}
                    max={250}
                    inputMode="decimal"
                    value={biometrics.weightKg}
                    onChange={(event) => updateBiometrics('weightKg', event.target.value)}
                  />
                </div>
              </div>
            </div>
            {biometricsError && <p className="text-sm text-red-600">{biometricsError}</p>}
            <p className="text-xs text-forest/60">
              Biometrics are encrypted, only used for Oligoscan interpretation, and follow the same
              privacy controls as your consultation records.
            </p>
          </CardContent>
        </Card>
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
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/70">Time:</span>
                <span className="font-medium text-forest">
                  {selectedTime
                    ? format(new Date(`1970-01-01T${selectedTime}`), 'h:mm a')
                    : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/70">Duration:</span>
                <span className="font-medium text-forest">
                  {selectedTypeConfig?.duration_minutes} minutes
                </span>
              </div>
              {requiresBiometrics && (
                <div className="flex justify-between">
                  <span className="text-forest/70">Biometrics:</span>
                  <span className="font-medium text-forest">
                    {biometricsComplete ? 'Captured' : 'Pending details'}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-sage/30">
                <span className="font-semibold text-forest">Total:</span>
                <span className="font-bold text-terracotta text-lg">
                  {usePackageCredit ? 'Included with package' : `$${selectedTypeConfig?.price.toFixed(2)}`}
                </span>
              </div>
              {usePackageCredit && (
                <p className="text-xs text-forest/70">
                  Using 1 credit from {packageName}
                </p>
              )}
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
              {usePackageCredit
                ? 'This session is covered by your wellness package.'
                : 'Payment will be processed after your consultation.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
