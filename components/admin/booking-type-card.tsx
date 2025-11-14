"use client"

import { useFormState } from "react-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  updateBookingTypeAction,
  availabilityActionInitialState,
} from "@/app/admin/bookings/availability-actions"

type Props = {
  type: string
  name: string
  description?: string | null
  duration_minutes: number
  price: number
  is_active: boolean
}

export function BookingTypeCard(props: Props) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(updateBookingTypeAction, availabilityActionInitialState)

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Booking type updated" : "Update failed",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="type" value={props.type} />
      <div className="space-y-1">
        <Label>Name</Label>
        <Input name="name" defaultValue={props.name} required />
      </div>
      <div className="space-y-1">
        <Label>Duration (minutes)</Label>
        <Input
          name="duration_minutes"
          type="number"
          min="10"
          defaultValue={props.duration_minutes}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Price (USD)</Label>
        <Input name="price" type="number" step="0.01" defaultValue={props.price} required />
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <select
          name="is_active"
          defaultValue={props.is_active ? "true" : "false"}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={props.description ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" size="sm">
          Save Booking Type
        </Button>
      </div>
    </form>
  )
}
