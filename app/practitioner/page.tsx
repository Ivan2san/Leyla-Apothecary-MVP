import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/auth/guards'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { formatDate } from '@/lib/utils'

interface PractitionerBooking {
  id: string
  booking_type?: string
  type?: string
  start_time?: string
  end_time?: string
  date?: string
  time?: string
  status: string
  price: number
  user_id: string
  notes: string | null
  metadata?: Record<string, any> | null
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

export default async function PractitionerDashboardPage() {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)

  if ('error' in session) {
    redirect('/login')
  }

  const practitionerId = session.user.id
  const serviceClient = createServiceRoleClient()

  const { data: rawBookings } = await serviceClient
    .from('bookings')
    .select('*, profiles:user_id(full_name, email)')
    .eq('practitioner_id', practitionerId)
    .order('start_time', { ascending: false })
    .limit(20)

  const bookings: PractitionerBooking[] = (rawBookings ?? []).map((booking: any) => {
    const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles
    return { ...booking, profiles: profile }
  })

  const upcoming = bookings.filter(
    (booking) => booking.status !== 'completed' && booking.status !== 'cancelled'
  )
  const completed = bookings.filter((booking) => booking.status === 'completed')

  const oligoscanBookings = bookings.filter(
    (booking) => (booking.booking_type ?? booking.type) === 'oligoscan_assessment'
  )
  const oligoscanIds = oligoscanBookings.map((booking) => booking.id)

  const oligoscanAssessmentMap = new Map<string, string>()

  if (oligoscanIds.length > 0) {
    const { data: oligoscanAssessments } = await serviceClient
      .from('assessments')
      .select('id, booking_id')
      .eq('type', 'oligoscan_v1')
      .in('booking_id', oligoscanIds)

    oligoscanAssessments?.forEach((assessment) => {
      if (assessment.booking_id) {
        oligoscanAssessmentMap.set(assessment.booking_id, assessment.id)
      }
    })
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta">Today&apos;s caseload</p>
          <h2 className="font-serif text-3xl text-forest">Consults & bespoke blends</h2>
        </div>
        <Button asChild className="bg-forest text-white hover:bg-forest/90">
          <Link href="/booking">Open scheduling</Link>
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-sage/30">
          <CardHeader>
            <CardTitle className="text-forest">Upcoming consultations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming bookings assigned.</p>}
            {upcoming.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-sage/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest">{booking.profiles?.full_name ?? 'Client'}</p>
                    <p className="text-xs uppercase tracking-wide text-terracotta">{booking.booking_type}</p>
                  </div>
                  <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-forest capitalize">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {booking.start_time
                    ? format(new Date(booking.start_time), 'MMM d, h:mm a')
                    : booking.date
                    ? `${formatDate(booking.date, 'long')} · ${booking.time?.slice(0, 5) ?? ''}`
                    : 'Scheduled'}{' '}
                  · ${Number(booking.price ?? 0).toFixed(2)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="text-forest">
                    <Link href={`/practitioner/compounds/${booking.id}`}>Create compound</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/bookings/${booking.id}`}>View notes</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-sage/30">
          <CardHeader>
            <CardTitle className="text-forest">Latest custom compounds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.length === 0 && (
              <p className="text-sm text-muted-foreground">Finish a consult to unlock practitioner blending.</p>
            )}
            {completed.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-sage/20 p-4">
                <p className="font-semibold text-forest">{booking.profiles?.full_name ?? 'Client'}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.start_time
                    ? format(new Date(booking.start_time), 'MMM d, yyyy')
                    : booking.date
                    ? formatDate(booking.date, 'long')
                    : 'Completed'}{' '}
                  · {booking.booking_type ?? booking.type}
                </p>
                <Button asChild size="sm" className="mt-3 bg-terracotta text-white hover:bg-terracotta/90">
                  <Link href={`/practitioner/compounds/${booking.id}`}>Document blend</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-sage/30">
        <CardHeader>
          <CardTitle className="text-forest">Oligoscan consultations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {oligoscanBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No Oligoscan assessments scheduled yet.
            </p>
          )}
          {oligoscanBookings.length > 0 && (
            <div className="space-y-4">
              {oligoscanBookings.map((booking) => {
                const hasAssessment = oligoscanAssessmentMap.has(booking.id)
                const appointment = booking.start_time
                  ? format(new Date(booking.start_time), "MMM d, yyyy 'at' h:mm a")
                  : booking.date
                  ? `${formatDate(booking.date, 'long')} · ${booking.time?.slice(0, 5) ?? ''}`
                  : 'Scheduled'

                return (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sage/30 p-4"
                  >
                    <div>
                      <p className="font-semibold text-forest">
                        {booking.profiles?.full_name ?? 'Client'}
                      </p>
                      <p className="text-sm text-muted-foreground">{appointment}</p>
                      {hasAssessment ? (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Assessment recorded
                        </p>
                      ) : (
                        <p className="text-xs text-terracotta font-medium mt-1">
                          Awaiting assessment
                        </p>
                      )}
                    </div>
                    <Button
                      asChild
                      variant={hasAssessment ? 'outline' : 'default'}
                      className={hasAssessment ? 'text-forest' : 'bg-terracotta text-white'}
                    >
                      <Link href={`/practitioner/oligoscan/${booking.id}`}>
                        {hasAssessment ? 'View assessment' : 'Record assessment'}
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
