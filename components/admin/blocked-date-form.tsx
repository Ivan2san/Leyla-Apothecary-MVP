"use client"

import { useFormState } from "react-dom"
import {
  createBlockedDateAction,
  removeBlockedDateAction,
  availabilityActionInitialState,
} from "@/app/admin/bookings/availability-actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

export function BlockedDateForm() {
  const { toast } = useToast()
  const [state, formAction] = useFormState(
    createBlockedDateAction,
    availabilityActionInitialState
  )

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Date blocked" : "Unable to block date",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-[200px,1fr,120px]">
      <Input type="date" name="date" required />
      <Textarea name="reason" placeholder="Optional note" />
      <Button type="submit" size="sm">
        Block Date
      </Button>
    </form>
  )
}

export function BlockedDateDeleteButton({ blockedId }: { blockedId: string }) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(
    removeBlockedDateAction,
    availabilityActionInitialState
  )

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Date removed" : "Unable to remove date",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction}>
      <input type="hidden" name="blocked_id" value={blockedId} />
      <Button type="submit" variant="outline" size="sm">
        Remove
      </Button>
    </form>
  )
}
