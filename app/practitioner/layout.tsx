import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile, isPractitionerRole } from '@/lib/auth/guards'

export default async function PractitionerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)

  if ('error' in session || !isPractitionerRole(session.profile.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="border-b border-sage/20 bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-terracotta">Practitioner workspace</p>
            <h1 className="font-serif text-2xl text-forest">Leyla&apos;s Clinical Dashboard</h1>
          </div>
          <div className="text-right text-sm text-forest/70">
            Signed in as <span className="font-semibold text-forest">{session.profile.full_name ?? session.user.email}</span>
            <p className="text-xs text-muted-foreground">Role: {session.profile.role}</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
