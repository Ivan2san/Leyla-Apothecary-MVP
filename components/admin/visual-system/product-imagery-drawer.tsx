"use client"

import { useFormState } from "react-dom"
import {
  productImageryInitialState,
  updateProductImagesAction,
} from "@/app/admin/visual-system/product-imagery-actions"
import { ProductImageSummary } from "@/types/admin-visual"
import { IMAGE_INVENTORY } from "@/lib/visual/inventory"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

const PRODUCT_ASSETS = IMAGE_INVENTORY.filter((item) => item.category === "products")

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Imagery"}
    </Button>
  )
}

export function ProductImageryDrawer({ product }: { product: ProductImageSummary }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateProductImagesAction, productImageryInitialState)

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false)
    }
  }, [state.status])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Manage Imagery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Attach MediHerb-style bottle photos from the inventory. This updates the product&apos;s
            primary and lifestyle images instantly.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="productId" value={product.id} />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-forest">Primary Bottle Image</label>
            <select
              name="primaryImageId"
              defaultValue=""
              className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
            >
              <option value="">Keep current</option>
              {PRODUCT_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-forest">Lifestyle Image (Optional)</label>
            <select
              name="lifestyleImageId"
              defaultValue=""
              className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
            >
              <option value="">Keep current</option>
              {PRODUCT_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-xs text-forest/70">
            <p>
              Need a new asset? Upload it in the media library, then refresh this list to assign it.
            </p>
            <SubmitButton />
          </div>
          {state.status === "error" && (
            <p className="text-sm text-terracotta">{state.message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
