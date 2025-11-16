import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

type AnySupabase = SupabaseClient<any, 'public', any>

export interface SessionProfile {
  user: User
  profile: Profile
}

interface GuardError {
  error: string
  status: number
}

const PRACTITIONER_ROLES = ['practitioner', 'admin']

export async function getSessionProfile(
  supabase: AnySupabase
): Promise<SessionProfile | GuardError> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profile not found', status: 403 }
  }

  return { user, profile: profile as Profile }
}

export function isPractitionerRole(role?: string | null) {
  if (!role) return false
  return PRACTITIONER_ROLES.includes(role)
}

export async function requirePractitionerProfile(
  supabase: AnySupabase
): Promise<SessionProfile | GuardError> {
  const result = await getSessionProfile(supabase)
  if ('error' in result) {
    return result
  }

  if (!isPractitionerRole(result.profile.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return result
}
