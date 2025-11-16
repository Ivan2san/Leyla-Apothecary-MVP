import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/auth/guards'
import { PractitionerBuilder } from '@/components/compounds/practitioner-builder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BookingDetails {
  id: string
  status: string
  booking_type: string
  start_time: string
  end_time: string
  price: number
  user_id: string
  notes: string | null
  assessments: { id: string; type: string }[] | null
  profiles: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export default async function PractitionerBookingCompoundPage({
  params,
}: {
  params: { bookingId: string }
}) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)

  if ('error' in session) {
    redirect('/login')
  }

  const { data: rawBooking, error } = await supabase
    .from('bookings')
    .select(
      'id, status, booking_type, start_time, end_time, price, user_id, notes, assessments:id(type), profiles:user_id(id, full_name, email)'
    )
    .eq('id', params.bookingId)
    .eq('practitioner_id', session.user.id)
    .single()

  if (error || !rawBooking) {
    notFound()
  }

  const booking = {
    ...rawBooking,
    profiles: Array.isArray(rawBooking.profiles) ? rawBooking.profiles[0] : rawBooking.profiles,
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, volume_ml')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const { data: latestCompound } = await supabase
    .from('compounds')
    .select('*')
    .eq('source_booking_id', booking.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const clientProfile = booking.profiles
  const defaultFormula =
    latestCompound?.formula?.map((herb: any) => ({
      product_id: herb.product_id,
      percentage: herb.percentage,
    })) ?? []

  return (
    <div className="space-y-8">
      <Card className="border-sage/30">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-forest">Consultation context</CardTitle>
            <p className="text-sm text-muted-foreground">
              {clientProfile?.full_name ?? 'Client'} · {booking.booking_type} ·{' '}
              {new Date(booking.start_time).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Status: {booking.status} · ${booking.price?.toFixed(2)}
            </p>
          </div>
          <Button asChild variant="outline" className="text-forest">
            <Link href="/practitioner">Back to dashboard</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {booking.notes ? (
            <p>
              <span className="font-semibold text-forest">Client notes:</span> {booking.notes}
            </p>
          ) : (
            <p>No client notes recorded.</p>
          )}
          {latestCompound ? (
            <p>
              <span className="font-semibold text-forest">Last blend:</span> {latestCompound.name} (
              {new Date(latestCompound.created_at).toLocaleDateString()})
            </p>
          ) : (
            <p>This consult has no saved practitioner compounds yet.</p>
          )}
        </CardContent>
      </Card>

      <PractitionerBuilder
        bookingId={booking.id}
        clientName={clientProfile?.full_name ?? 'Client'}
        clientEmail={clientProfile?.email ?? ''}
        products={products ?? []}
        defaultFormula={defaultFormula}
        defaultName={latestCompound?.name}
        defaultNotes={latestCompound?.notes ?? ''}
        existingCompoundId={latestCompound?.id ?? null}
      />
    </div>
  )
}
