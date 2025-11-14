"use client"

import { useMemo, useState } from "react"
import { ImageInventoryItem } from "@/lib/visual/inventory"
import { cn } from "@/lib/utils"

interface AssetTableProps {
  inventory: ImageInventoryItem[]
}

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Needs Optimization", value: "needs-optimization" },
  { label: "Pending License", value: "pending-license" },
]

export function AssetTable({ inventory }: AssetTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const haystack = `${item.filename} ${item.tags.join(" ")} ${item.usage}`.toLowerCase()
      const matchesSearch = haystack.includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [inventory, statusFilter, search])

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                statusFilter === filter.value
                  ? "border-forest bg-forest text-white"
                  : "border-sage/60 text-forest hover:bg-sage/10"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search filename, tags, usage..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border border-sage/40 bg-white px-3 py-2 text-sm text-forest placeholder:text-forest/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30 md:w-72"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-sage/30">
        <table className="min-w-full text-sm text-forest/80">
          <thead className="bg-sage/10 text-left text-forest/60">
            <tr>
              <th className="px-4 py-2 font-semibold">Filename</th>
              <th className="px-4 py-2 font-semibold">Category</th>
              <th className="px-4 py-2 font-semibold">Usage</th>
              <th className="px-4 py-2 font-semibold">Tags</th>
              <th className="px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/20">
            {filtered.map((item) => (
              <tr key={item.id} className="bg-white">
                <td className="px-4 py-3 font-mono text-xs">{item.filename}</td>
                <td className="px-4 py-3 capitalize">
                  {item.category} / {item.subcategory}
                </td>
                <td className="px-4 py-3">{item.usage}</td>
                <td className="px-4 py-3 text-xs text-forest/60">{item.tags.join(", ")}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCopy(item.filename, item.id)}
                      className="rounded-md border border-sage/40 px-2 py-1 text-xs font-semibold text-forest hover:bg-sage/10"
                    >
                      {copiedId === item.id ? "Copied!" : "Copy filename"}
                    </button>
                    <button
                      onClick={() => handleCopy(`/public/images/${item.category}/${item.subcategory}`, `${item.id}-path`)}
                      className="rounded-md border border-sage/40 px-2 py-1 text-xs font-semibold text-forest hover:bg-sage/10"
                    >
                      Copy path
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-forest/60">
                  No assets match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
