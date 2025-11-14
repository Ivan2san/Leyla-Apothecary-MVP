import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatPrice } from "@/lib/utils"
import { ProductCreateForm } from "@/components/admin/product-create-form"
import { ProductEditCard } from "@/components/admin/product-edit-card"
import type { Product } from "@/types"

export const metadata = {
  title: "Admin · Products",
}

export const dynamic = "force-dynamic"

async function getProducts() {
  const client = createServiceRoleClient()

  const { data } = await client
    .from("products")
    .select(
      "id,name,slug,description,category,price,volume_ml,stock_quantity,is_active,benefits,ingredients,contraindications,dosage_instructions"
    )
    .order("created_at", { ascending: false })

  return (data as Product[]) ?? []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  const activeProducts = products.filter((product) => product.is_active !== false).length
  const totalSkus = products.length
  const lowStockCount = products.filter((product) => product.stock_quantity <= 10).length

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{activeProducts}</p>
            <p className="text-sm text-forest/60">{totalSkus} total SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">{lowStockCount}</p>
            <p className="text-sm text-forest/60">Below 10 units remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest">
              {products.length
                ? formatPrice(
                    products.reduce((sum, product) => sum + Number(product.price ?? 0), 0) /
                      products.length
                  )
                : formatPrice(0)}
            </p>
            <p className="text-sm text-forest/60">Across all active products</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductCreateForm />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-lora text-forest">Existing Products</h2>
        {products.length === 0 && (
          <p className="text-sm text-forest/70">No products yet. Create your first product above.</p>
        )}
        <div className="space-y-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="flex flex-col gap-2 text-base font-semibold text-forest md:flex-row md:items-center md:justify-between">
                  <span>{product.name}</span>
                  <span className="text-sm font-normal text-forest/70">
                    {formatPrice(Number(product.price ?? 0))} · {product.stock_quantity} in stock ·{" "}
                    {product.is_active === false ? "Archived" : "Active"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductEditCard product={product} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
