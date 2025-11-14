"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogIn, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function AuthNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    )
  }

  const isAdmin =
    user?.user_metadata?.role?.toLowerCase() === "admin" ||
    (process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      user?.email?.toLowerCase() ===
        process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase())

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link href="/admin" className="hidden sm:block">
            <Button variant="ghost" size="icon">
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Admin Console</span>
            </Button>
          </Link>
        )}
        <Link href="/account">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button variant="ghost" size="sm">
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    </Link>
  )
}
