import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatPrice } from "@/lib/utils"

type Order = {
  id: string
  total: number
  status: string
  created_at: string
}

type OrderItem = {
  quantity: number
}

async function getAnalyticsData() {
  const client = createServiceRoleClient()

  const [{ data: orders }, { data: orderItems }] = await Promise.all([
    client
      .from("orders")
      .select("id,total,status,created_at")
      .order("created_at", { ascending: false }),
    client.from("order_items").select("quantity"),
  ])

  return {
    orders: (orders as Order[]) ?? [],
    orderItems: (orderItems as OrderItem[]) ?? [],
  }
}

function buildMonthlySeries(orders: Order[]) {
  const now = new Date()
  const series: { label: string; key: string; value: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const label = date.toLocaleDateString("en-US", { month: "short" })
    series.push({ label, key, value: 0 })
  }

  const map = new Map(series.map((entry) => [entry.key, entry]))

  orders.forEach((order) => {
    const date = new Date(order.created_at)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const entry = map.get(key)
    if (entry) {
      entry.value += Number(order.total ?? 0)
    }
  })

  return series
}

export default async function AdminAnalyticsPage() {
  const { orders, orderItems } = await getAnalyticsData()

  const monthlySeries = buildMonthlySeries(orders)
  const currentMonthRevenue = monthlySeries[monthlySeries.length - 1]?.value ?? 0
  const lastMonthRevenue = monthlySeries[monthlySeries.length - 2]?.value ?? 0
  const growth =
    lastMonthRevenue === 0
      ? currentMonthRevenue > 0
        ? 100
        : 0
      : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  const statusBreakdown = orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.status || "unknown"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  const avgItems = orders.length ? totalItems / orders.length : 0

  const maxValue = Math.max(...monthlySeries.map((entry) => entry.value), 1)

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">
              {formatPrice(currentMonthRevenue)}
            </p>
            <p className="text-sm text-forest/60">
              {growth >= 0 ? "+" : "-"}
              {Math.abs(growth).toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Items / Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{avgItems.toFixed(1)}</p>
            <p className="text-sm text-forest/60">Based on {orders.length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">
              {statusBreakdown["pending"] ?? 0}
            </p>
            <p className="text-sm text-forest/60">Awaiting fulfillment</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            {monthlySeries.map((entry) => (
              <div key={entry.key} className="flex-1 text-center text-sm text-forest/70">
                <div className="mx-auto flex h-32 w-10 items-end">
                  <div
                    className="w-full rounded-t-md bg-sage"
                    style={{
                      height: `${(entry.value / maxValue) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-2 font-medium text-forest">{entry.label}</div>
                <div className="text-xs">{formatPrice(entry.value)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-sage/20 bg-white p-4 text-center"
            >
              <p className="text-2xl font-bold text-forest">{count}</p>
              <p className="text-sm font-semibold capitalize text-forest/70">{status}</p>
            </div>
          ))}
          {Object.keys(statusBreakdown).length === 0 && (
            <p className="text-sm text-forest/70">No order activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
