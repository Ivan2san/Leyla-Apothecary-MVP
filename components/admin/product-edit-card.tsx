"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateProductAction, productActionInitialState } from "@/app/admin/products/actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"

const CATEGORY_OPTIONS = [
  { value: "digestive", label: "Digestive" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "immune", label: "Immune" },
  { value: "nervous", label: "Nervous" },
  { value: "respiratory", label: "Respiratory" },
  { value: "musculoskeletal", label: "Musculoskeletal" },
  { value: "endocrine", label: "Endocrine" },
  { value: "skin", label: "Skin" },
  { value: "reproductive", label: "Reproductive" },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

function listToTextareaValue(value?: string[] | null) {
  return value && value.length > 0 ? value.join("\n") : ""
}

export function ProductEditCard({ product }: { product: Product }) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(updateProductAction, productActionInitialState)

  useEffect(() => {
    if (!state.status) return
    toast({
      title: state.status === "success" ? "Product updated" : "Unable to update",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={product.id} />
      <div className="space-y-2">
        <Label htmlFor={`name-${product.id}`}>Name</Label>
        <Input id={`name-${product.id}`} name="name" defaultValue={product.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`slug-${product.id}`}>Slug</Label>
        <Input id={`slug-${product.id}`} name="slug" defaultValue={product.slug} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`category-${product.id}`}>Category</Label>
        <select
          id={`category-${product.id}`}
          name="category"
          defaultValue={product.category}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`price-${product.id}`}>Price</Label>
        <Input
          id={`price-${product.id}`}
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product.price}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`volume-${product.id}`}>Volume (ml)</Label>
        <Input
          id={`volume-${product.id}`}
          name="volume_ml"
          type="number"
          min="10"
          defaultValue={product.volume_ml}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`stock-${product.id}`}>Stock Quantity</Label>
        <Input
          id={`stock-${product.id}`}
          name="stock_quantity"
          type="number"
          min="0"
          defaultValue={product.stock_quantity}
          required
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`description-${product.id}`}>Description</Label>
        <Textarea
          id={`description-${product.id}`}
          name="description"
          defaultValue={product.description}
          required
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`dosage-${product.id}`}>Dosage Instructions</Label>
        <Textarea
          id={`dosage-${product.id}`}
          name="dosage_instructions"
          defaultValue={product.dosage_instructions}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`benefits-${product.id}`}>Benefits</Label>
        <Textarea
          id={`benefits-${product.id}`}
          name="benefits"
          defaultValue={listToTextareaValue(product.benefits)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`ingredients-${product.id}`}>Ingredients</Label>
        <Textarea
          id={`ingredients-${product.id}`}
          name="ingredients"
          defaultValue={listToTextareaValue(product.ingredients)}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`contra-${product.id}`}>Contraindications</Label>
        <Textarea
          id={`contra-${product.id}`}
          name="contraindications"
          defaultValue={listToTextareaValue(product.contraindications)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`status-${product.id}`}>Status</Label>
        <select
          id={`status-${product.id}`}
          name="is_active"
          defaultValue={product.is_active === false ? "false" : "true"}
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          <option value="true">Active</option>
          <option value="false">Archived</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <SubmitButton />
      </div>
    </form>
  )
}
