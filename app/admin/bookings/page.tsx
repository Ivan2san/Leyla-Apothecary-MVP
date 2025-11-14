import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatDate } from "@/lib/utils"
import { BookingStatusForm } from "@/components/admin/booking-status-form"
import { Button } from "@/components/ui/button"

type BookingRecord = {
  id: string
  user_id: string
  type: string
  date: string
  time: string
  status: string
  price: number
  notes: string | null
  duration_minutes: number
  profiles: {
    full_name?: string
    email?: string
  } | null
}

async function getBookings() {
  const client = createServiceRoleClient()

  const { data } = await client
    .from("bookings")
    .select(
      `
      id,
      user_id,
      type,
      date,
      time,
      status,
      duration_minutes,
      price,
      notes,
      profiles:user_id (
        full_name,
        email
      )
    `
    )
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  return (data as BookingRecord[]) ?? []
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings()

  const scheduled = bookings.filter((booking) => booking.status === "scheduled").length
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length
  const completed = bookings.filter((booking) => booking.status === "completed").length

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{scheduled}</p>
            <p className="text-sm text-forest/60">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{confirmed}</p>
            <p className="text-sm text-forest/60">Ready for sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{completed}</p>
            <p className="text-sm text-forest/60">Consultations delivered</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Bookings</CardTitle>
          <Link href="/admin/bookings/availability">
            <Button variant="outline" size="sm">
              Manage Availability
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.length === 0 && (
            <p className="text-sm text-forest/70">No bookings scheduled.</p>
          )}

          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="grid gap-4 rounded-lg border border-sage/20 p-4 md:grid-cols-[2fr,1fr]"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-sage/80">
                    {booking.type}
                  </p>
                  <p className="text-xl font-semibold text-forest">
                    {formatDate(booking.date, "long")} · {booking.time.slice(0, 5)}
                  </p>
                  <p className="text-sm text-forest/70">
                    {booking.profiles?.full_name || "Unknown client"} ·{" "}
                    {booking.profiles?.email || "No email"}
                  </p>
                  <p className="text-sm text-forest/70">
                    {booking.duration_minutes} min · ${Number(booking.price ?? 0).toFixed(2)}
                  </p>
                  {booking.notes && (
                    <p className="mt-2 text-sm text-forest/80">Notes: {booking.notes}</p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-forest capitalize">
                    {booking.status.replace("_", " ")}
                  </span>
                  <BookingStatusForm
                    bookingId={booking.id}
                    currentStatus={booking.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
