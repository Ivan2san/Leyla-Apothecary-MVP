import { ReactNode } from "react"
import { requireAdmin } from "@/lib/auth/auth-helpers"
import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/actions"

async function handleAdminSignOut(_formData: FormData) {
  "use server"
  await signOut()
}

export const metadata = {
  title: "Admin Console | Leyla's Apothecary",
  description:
    "Manage products, inventory, and analytics for Leyla's Apothecary.",
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="border-b border-sage/30 bg-white/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sage/80">
              Leyla&apos;s Apothecary
            </p>
            <h1 className="text-3xl font-lora text-forest">
              Admin Console
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-forest">
                {user.user_metadata?.full_name || "Administrator"}
              </p>
              <p className="text-xs text-forest/70">{user.email}</p>
            </div>
            <form action={handleAdminSignOut}>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container space-y-8 py-10">
        <AdminNav />
        {children}
      </main>
    </div>
  )
}
