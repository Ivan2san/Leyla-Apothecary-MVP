import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatDate, formatPrice } from "@/lib/utils"
import { OrderStatusForm } from "@/components/admin/order-status-form"

type OrderRecord = {
  id: string
  order_number: string
  created_at: string
  total: number
  status: string
  shipping_address: {
    fullName?: string
    city?: string
    state?: string
  } | null
}

async function getOrders() {
  const client = createServiceRoleClient()

  const { data } = await client
    .from("orders")
    .select("id,order_number,created_at,total,status,shipping_address")
    .order("created_at", { ascending: false })

  return (data as OrderRecord[]) ?? []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const pending = orders.filter((order) => order.status === "pending").length
  const processing = orders.filter((order) => order.status === "processing").length
  const shipped = orders.filter((order) => order.status === "shipped").length

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{pending}</p>
            <p className="text-sm text-forest/60">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{processing}</p>
            <p className="text-sm text-forest/60">Being prepared or packed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{shipped}</p>
            <p className="text-sm text-forest/60">On their way</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 && (
            <p className="text-sm text-forest/70">No orders have been placed yet.</p>
          )}
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid gap-4 rounded-lg border border-sage/20 p-4 md:grid-cols-[2fr,1fr]"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sage/80">
                  {order.order_number || order.id.slice(0, 8)}
                </p>
                <p className="text-xl font-semibold text-forest">
                  {formatPrice(Number(order.total ?? 0))}
                </p>
                <p className="text-sm text-forest/70">
                  {formatDate(order.created_at, "long")} ·{" "}
                  {order.shipping_address?.city ?? "Online"}
                </p>
                <p className="text-sm text-forest/70">
                  {order.shipping_address?.fullName || "No recipient info"}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-forest capitalize">
                  {order.status}
                </span>
                <OrderStatusForm orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
