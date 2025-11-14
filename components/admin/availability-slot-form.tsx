"use client"

import { useFormState } from "react-dom"
import {
  createAvailabilitySlotAction,
  toggleAvailabilitySlotAction,
  availabilityActionInitialState,
} from "@/app/admin/bookings/availability-actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AvailabilitySlotForm() {
  const { toast } = useToast()
  const [state, formAction] = useFormState(
    createAvailabilitySlotAction,
    availabilityActionInitialState
  )

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Slot added" : "Unable to add slot",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-semibold uppercase text-forest/70">Day</label>
        <select
          name="day_of_week"
          className="h-10 rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          {DAYS.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-forest/70">Start</label>
        <input type="time" name="start_time" className="rounded-md border border-sage/40 px-3 text-sm" required />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-forest/70">End</label>
        <input type="time" name="end_time" className="rounded-md border border-sage/40 px-3 text-sm" required />
      </div>
      <Button type="submit" size="sm">
        Add Slot
      </Button>
    </form>
  )
}

export function AvailabilitySlotToggle({
  slotId,
  nextActive,
}: {
  slotId: string
  nextActive: boolean
}) {
  const [state, formAction] = useFormState(
    toggleAvailabilitySlotAction,
    availabilityActionInitialState
  )
  const { toast } = useToast()

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Availability updated" : "Update failed",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction}>
      <input type="hidden" name="slot_id" value={slotId} />
      <input type="hidden" name="next_active" value={nextActive ? "true" : "false"} />
      <Button type="submit" size="sm" variant={nextActive ? "default" : "outline"}>
        {nextActive ? "Enable" : "Disable"}
      </Button>
    </form>
  )
}
