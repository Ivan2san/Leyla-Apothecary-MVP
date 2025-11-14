import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { BookingTypeCard } from "@/components/admin/booking-type-card"
import { AvailabilitySlotForm, AvailabilitySlotToggle } from "@/components/admin/availability-slot-form"
import { BlockedDateForm, BlockedDateDeleteButton } from "@/components/admin/blocked-date-form"

type BookingTypeRecord = {
  type: string
  name: string
  description?: string | null
  duration_minutes: number
  price: number
  is_active: boolean
}

type AvailabilitySlot = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

type BlockedDate = {
  id: string
  date: string
  reason?: string | null
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

async function getAvailabilityData() {
  const client = createServiceRoleClient()

  const [{ data: bookingTypes }, { data: slots }, { data: blocked }] = await Promise.all([
    client
      .from("booking_type_config")
      .select("*")
      .order("duration_minutes", { ascending: true }),
    client
      .from("availability_slots")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }),
    client
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true }),
  ])

  return {
    bookingTypes: (bookingTypes as BookingTypeRecord[]) ?? [],
    slots: (slots as AvailabilitySlot[]) ?? [],
    blockedDates: (blocked as BlockedDate[]) ?? [],
  }
}

export default async function AdminAvailabilityPage() {
  const { bookingTypes, slots, blockedDates } = await getAvailabilityData()

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Booking Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookingTypes.map((type) => (
            <div key={type.type} className="rounded-lg border border-sage/20 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-sage/80">{type.type}</p>
              <BookingTypeCard {...type} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Availability Slots</CardTitle>
          <AvailabilitySlotForm />
        </CardHeader>
        <CardContent className="space-y-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between rounded-lg border border-sage/20 p-4 text-sm"
            >
              <div>
                <p className="font-semibold text-forest">
                  {DAYS[slot.day_of_week]} · {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                </p>
                <p className="text-forest/60">
                  {slot.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <AvailabilitySlotToggle slotId={slot.id} nextActive={!slot.is_active} />
            </div>
          ))}
          {slots.length === 0 && (
            <p className="text-sm text-forest/70">No availability slots configured yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BlockedDateForm />
          {blockedDates.length === 0 && (
            <p className="text-sm text-forest/70">No blocked dates.</p>
          )}
          <div className="space-y-3">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className="flex flex-wrap items-center justify-between rounded-lg border border-sage/20 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-forest">
                    {new Date(blocked.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {blocked.reason && (
                    <p className="text-forest/70">{blocked.reason}</p>
                  )}
                </div>
                <BlockedDateDeleteButton blockedId={blocked.id} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
