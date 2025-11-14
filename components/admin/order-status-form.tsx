"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateOrderStatusAction, orderActionInitialState } from "@/app/admin/orders/actions"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Updating..." : "Update"}
    </Button>
  )
}

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(updateOrderStatusAction, orderActionInitialState)

  useEffect(() => {
    if (!state.status) return

    toast({
      title: state.status === "success" ? "Order updated" : "Unable to update order",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="h-8 rounded-md border border-sage/40 bg-white px-2 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <SubmitButton />
    </form>
  )
}
