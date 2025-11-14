"use client"

import { useFormState } from "react-dom"
import { mediaUploadInitialState, uploadMediaAssetAction } from "@/app/admin/visual-system/actions"
import { useTransition } from "react"

const FOLDER_OPTIONS = [
  { label: "products/tinctures", value: "products/tinctures" },
  { label: "products/lifestyle", value: "products/lifestyle" },
  { label: "heroes/homepage", value: "heroes/homepage" },
  { label: "heroes/products", value: "heroes/products" },
  { label: "heroes/booking", value: "heroes/booking" },
]

export function MediaUploadForm() {
  const [state, formAction] = useFormState(uploadMediaAssetAction, mediaUploadInitialState)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(formData: FormData) => startTransition(() => formAction(formData))}
      className="grid gap-3 rounded-xl border border-sage/40 bg-sage/5 p-4 md:grid-cols-4"
    >
      <div className="space-y-1 md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/70">
          Upload File (WebP/JPEG/PNG)
        </label>
        <input
          type="file"
          name="file"
          accept=".webp,.jpg,.jpeg,.png"
          required
          className="w-full rounded-md border border-sage/40 bg-white px-3 py-2 text-sm text-forest"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/70">
          Folder
        </label>
        <select
          name="folder"
          className="h-10 w-full rounded-md border border-sage/40 bg-white px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage"
        >
          {FOLDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-forest/70">
          Filename (optional override)
        </label>
        <input
          type="text"
          name="filename"
          placeholder="2025-02-10_product_tincture_lavender-calm_primary_v1.webp"
          className="w-full rounded-md border border-sage/40 bg-white px-3 py-2 text-xs text-forest"
        />
      </div>
      <div className="md:col-span-4 flex items-center justify-between text-xs text-forest/70">
        <p>
          Follow the MediHerb naming convention: <span className="font-mono">YYYY-MM-DD_category_subcategory_description_variant_v1.webp</span>
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-3 py-2 text-sm font-semibold text-white hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Uploading..." : "Upload"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p
          className={`md:col-span-4 text-sm ${
            state.status === "error" ? "text-terracotta" : "text-forest"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
