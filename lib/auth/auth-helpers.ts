import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export async function getUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export function isAdminUser(user: User | null) {
  if (!user) return false

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (adminEmail && user.email?.toLowerCase() === adminEmail) {
    return true
  }

  const role = user.user_metadata?.role?.toString().toLowerCase()
  return role === 'admin' || role === 'superadmin'
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (!isAdminUser(user)) {
    redirect('/')
  }

  return user
}
