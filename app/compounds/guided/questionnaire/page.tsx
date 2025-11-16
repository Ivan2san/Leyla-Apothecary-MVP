import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GuidedQuestionnaireForm } from '@/components/compounds/guided-questionnaire-form'

interface GuidedQuestionnairePageProps {
  searchParams?: {
    redirect?: string
  }
}

export default async function GuidedQuestionnairePage({ searchParams }: GuidedQuestionnairePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const targetRedirect = (() => {
    const requested = searchParams?.redirect || '/compounds/guided'
    return requested.startsWith('/') ? requested : '/compounds/guided'
  })()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/compounds/guided/questionnaire')}`)
  }

  const { data: existingAssessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'guided_compound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wider text-terracotta">Tier 2 • Guided Blend</p>
        <h1 className="font-serif text-3xl text-forest">Tell us how you&apos;re feeling</h1>
        <p className="text-muted-foreground">
          This 5-minute intake captures your goals, medications, and sensitivities so we can suggest a safe starting blend. You&apos;ll get 3–5 curated herbs with safe ratio ranges.
        </p>
      </div>

      <GuidedQuestionnaireForm
        existingResponses={existingAssessment?.responses as Record<string, any>}
        lastCompletedAt={existingAssessment?.created_at}
        redirectPath={targetRedirect}
      />
    </div>
  )
}
