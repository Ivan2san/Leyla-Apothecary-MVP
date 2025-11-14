import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatDate, formatPrice } from "@/lib/utils"

type OrderRecord = {
  id: string
  total: number
  status: string
  created_at: string
  shipping_address: {
    fullName?: string
    city?: string
    state?: string
  } | null
}

type ProductRecord = {
  id: string
  name: string
  price: number
  stock_quantity: number
  is_active: boolean
}

type OrderItemRecord = {
  quantity: number
  price: number
  product_snapshot: {
    name?: string
  } | null
}

async function getDashboardData() {
  const client = createServiceRoleClient()

  const [{ data: orders }, { data: products }, { data: orderItems }] =
    await Promise.all([
      client
        .from("orders")
        .select("id,total,status,created_at,shipping_address")
        .order("created_at", { ascending: false }),
      client
        .from("products")
        .select("id,name,price,stock_quantity,is_active")
        .order("stock_quantity", { ascending: true }),
      client
        .from("order_items")
        .select("quantity,price,product_snapshot")
        .order("created_at", { ascending: false }),
    ])

  return {
    orders: (orders as OrderRecord[]) ?? [],
    products: (products as ProductRecord[]) ?? [],
    orderItems: (orderItems as OrderItemRecord[]) ?? [],
  }
}

export default async function AdminDashboardPage() {
  const { orders, products, orderItems } = await getDashboardData()

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const openOrders = orders.filter((order) => order.status !== "delivered").length

  const lowStock = products.filter((product) => product.stock_quantity <= 10).slice(0, 5)

  const topProductsMap = new Map<string, { name: string; revenue: number; quantity: number }>()
  orderItems.forEach((item) => {
    const name = item.product_snapshot?.name ?? "Untitled"
    const existing = topProductsMap.get(name) ?? { name, revenue: 0, quantity: 0 }
    existing.revenue += Number(item.price ?? 0) * item.quantity
    existing.quantity += item.quantity
    topProductsMap.set(name, existing)
  })
  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 6)

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-forest/60">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{totalOrders}</p>
            <p className="text-sm text-forest/60">{openOrders} open orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">
              {formatPrice(averageOrderValue || 0)}
            </p>
            <p className="text-sm text-forest/60">Past {orders.length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{lowStock.length}</p>
            <p className="text-sm text-forest/60">Products below 10 units</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 && (
              <p className="text-sm text-forest/70">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-sage/20 p-4"
              >
                <div>
                  <p className="font-semibold text-forest">{formatPrice(Number(order.total ?? 0))}</p>
                  <p className="text-sm text-forest/60">
                    {formatDate(order.created_at, "short")} · {order.shipping_address?.city ?? "Online"}
                  </p>
                </div>
                <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-forest capitalize">
                  {order.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStock.length === 0 && (
              <p className="text-sm text-forest/70">All products have healthy inventory.</p>
            )}
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-sage/20 p-4"
              >
                <div>
                  <p className="font-semibold text-forest">{product.name}</p>
                  <p className="text-sm text-forest/60">
                    {formatPrice(product.price)} · {product.is_active ? "Active" : "Archived"}
                  </p>
                </div>
                <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
                  {product.stock_quantity} in stock
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topProducts.length === 0 && (
            <p className="text-sm text-forest/70">No sales data yet.</p>
          )}
          {topProducts.map((product) => (
            <div
              key={product.name}
              className="flex items-center justify-between rounded-lg border border-sage/20 p-3"
            >
              <div>
                <p className="font-semibold text-forest">{product.name}</p>
                <p className="text-xs text-forest/60">{product.quantity} units sold</p>
              </div>
              <p className="text-sm font-semibold text-forest">
                {formatPrice(product.revenue)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
