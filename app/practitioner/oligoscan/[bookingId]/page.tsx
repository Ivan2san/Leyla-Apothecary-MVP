import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePractitionerProfile } from '@/lib/auth/guards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { OligoscanAssessmentForm } from '@/components/practitioner/OligoscanAssessmentForm'
import type { OligoscanBiometrics } from '@/lib/types/booking.types'

function formatAppointment(booking: any) {
  if (booking.start_time) {
    return format(new Date(booking.start_time), "MMM d, yyyy 'at' h:mm a")
  }

  if (booking.date && booking.time) {
    const iso = `${booking.date}T${booking.time}`
    return format(new Date(iso), "MMM d, yyyy 'at' h:mm a")
  }

  return booking.created_at ? format(new Date(booking.created_at), "MMM d, yyyy") : 'Scheduled'
}

export default async function PractitionerOligoscanAssessmentPage({
  params,
}: {
  params: { bookingId: string }
}) {
  const supabase = await createClient()
  const session = await requirePractitionerProfile(supabase)

  if ('error' in session) {
    redirect('/login')
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, profiles:user_id ( full_name, email )')
    .eq('id', params.bookingId)
    .maybeSingle()

  if (error || !booking) {
    notFound()
  }

  const bookingType = booking.booking_type ?? booking.type
  if (bookingType !== 'oligoscan_assessment') {
    notFound()
  }

  if (booking.practitioner_id && booking.practitioner_id !== session.user.id) {
    return redirect('/practitioner')
  }

  const { data: existingAssessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('type', 'oligoscan_v1')
    .eq('booking_id', booking.id)
    .maybeSingle()

  const appointmentLabel = formatAppointment(booking)
  const biometrics = (booking.metadata?.biometrics ?? null) as OligoscanBiometrics | null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta">Oligoscan</p>
          <h1 className="text-3xl font-serif text-forest">Record assessment</h1>
          <p className="text-sm text-muted-foreground">
            {booking.profiles?.full_name ?? 'Client'} · {appointmentLabel}
          </p>
        </div>
        <Button asChild variant="outline" className="text-forest">
          <Link href="/practitioner">Back to dashboard</Link>
        </Button>
      </div>

      {existingAssessment ? (
        <Card className="border-sage/30">
          <CardHeader>
            <CardTitle className="text-forest">Assessment already recorded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This booking already has an Oligoscan assessment on file. Please return to the
              dashboard if you need to review the notes.
            </p>
            <Button asChild>
              <Link href="/practitioner">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <OligoscanAssessmentForm
          bookingId={booking.id}
          userId={booking.user_id}
          clientName={booking.profiles?.full_name ?? 'Client'}
          appointmentLabel={appointmentLabel}
          biometrics={biometrics}
          bookingNotes={booking.notes}
        />
      )}
    </div>
  )
}
