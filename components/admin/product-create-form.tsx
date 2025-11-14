"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createProductAction, productActionInitialState } from "@/app/admin/products/actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  )
}

export function ProductCreateForm() {
  const { toast } = useToast()
  const [state, formAction] = useFormState(createProductAction, productActionInitialState)

  useEffect(() => {
    if (!state.status) return

    toast({
      title: state.status === "success" ? "Product saved" : "Something went wrong",
      description: state.message,
      variant: state.status === "success" ? "default" : "destructive",
    })
  }, [state, toast])

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Calm Digest Tonic" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="calm-digest-tonic" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          required
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input id="price" name="price" type="number" min="0" step="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="volume_ml">Volume (ml)</Label>
        <Input id="volume_ml" name="volume_ml" type="number" min="10" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stock_quantity">Stock Quantity</Label>
        <Input id="stock_quantity" name="stock_quantity" type="number" min="0" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Describe the product benefits and formulation..."
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="dosage_instructions">Dosage Instructions</Label>
        <Textarea
          id="dosage_instructions"
          name="dosage_instructions"
          required
          placeholder="Take 2 dropperfuls daily..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits (one per line)</Label>
        <Textarea id="benefits" name="benefits" placeholder="Supports digestion" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients (one per line)</Label>
        <Textarea id="ingredients" name="ingredients" placeholder="Ginger root" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="contraindications">Contraindications (one per line)</Label>
        <Textarea
          id="contraindications"
          name="contraindications"
          placeholder="Not for use during pregnancy"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="is_active">Status</Label>
        <select
          id="is_active"
          name="is_active"
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          <option value="true">Active</option>
          <option value="false">Archived</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <SubmitButton label="Create Product" />
      </div>
    </form>
  )
}
