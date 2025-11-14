"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Analytics", href: "/admin/analytics" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === item.href
            : pathname?.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              "border border-sage/40",
              isActive
                ? "bg-sage text-forest shadow-sm"
                : "bg-white text-forest hover:bg-sage/10"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
