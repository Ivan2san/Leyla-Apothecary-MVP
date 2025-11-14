"use client"

import { useFormState, useFormStatus } from "react-dom"
import {
  updateBookingStatusAction,
  bookingActionInitialState,
} from "@/app/admin/bookings/actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

const STATUS_OPTIONS = ["scheduled", "confirmed", "completed", "cancelled", "no_show"]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Updating..." : "Update"}
    </Button>
  )
}

export function BookingStatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: string
}) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(updateBookingStatusAction, bookingActionInitialState)

  useEffect(() => {
    if (!state.status) return

    toast({
      title: state.status === "success" ? "Booking updated" : "Unable to update booking",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="booking_id" value={bookingId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="h-8 rounded-md border border-sage/40 bg-white px-2 text-xs text-forest focus:outline-none focus:ring-2 focus:ring-sage"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status.replace('_', ' ')}
          </option>
        ))}
      </select>
      <SubmitButton />
    </form>
  )
}
