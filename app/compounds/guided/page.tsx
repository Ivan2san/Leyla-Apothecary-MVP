import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { resolveGuidedAssessmentForBuilder } from '@/lib/compounds/gating'
import type { GuidedRecommendation } from '@/types'
import { GuidedBuilder } from '@/components/compounds/guided-builder'
import { Button } from '@/components/ui/button'

interface GuidedBuilderPageProps {
  searchParams?: {
    assessmentId?: string
  }
}

const BUILDER_PATH = '/compounds/guided'

export default async function GuidedBuilderPage({ searchParams }: GuidedBuilderPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(BUILDER_PATH)}`)
  }

  const gate = await resolveGuidedAssessmentForBuilder(supabase, user.id, {
    assessmentId: searchParams?.assessmentId,
  })

  if (!gate.assessment || gate.isExpired) {
    redirect(`/compounds/guided/questionnaire?redirect=${encodeURIComponent(BUILDER_PATH)}`)
  }

  const recommendations = gate.assessment.recommendations as GuidedRecommendation | null
  const herbSuggestions = recommendations?.suggested_herbs ?? []
  const responses = (gate.assessment.responses || {}) as Record<string, any>
  const supportingGoals =
    recommendations && Array.isArray((recommendations.metadata as any)?.goals)
      ? ((recommendations.metadata as any).goals as string[])
      : []

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-terracotta">Guided mode unlocked</p>
        <h1 className="font-serif text-3xl text-forest">Your suggested herb foundation</h1>
        <p className="text-muted-foreground">
          Based on your latest questionnaire ({formatDistanceToNow(new Date(gate.assessment.created_at), { addSuffix: true })}), we recommend starting with the herbs below. You&apos;ll be able to fine-tune the ratios inside the builder while staying inside safe ranges.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-sage bg-white/90 p-6 shadow-sm">
        {recommendations ? (
          <>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide text-terracotta">
                Primary goal: {recommendations.primary_goal}
              </p>
              <p className="text-sm text-muted-foreground">
                Supporting goals:{' '}
                {supportingGoals.filter((goal) => goal !== recommendations.primary_goal).join(', ') ||
                  'None'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {herbSuggestions.map((herb) => (
                <div key={herb.slug ?? herb.name} className="rounded-lg border border-cream bg-sage/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-forest">{herb.name}</p>
                    <span className="text-sm text-muted-foreground">
                      Start at {herb.start_percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Safe ratio range: {herb.min_percentage}% – {herb.max_percentage}%
                  </p>
                  {herb.notes && (
                    <p className="mt-2 text-sm text-forest/80">{herb.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {recommendations.warnings && recommendations.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-medium">Safety alerts</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {recommendations.warnings.map((warning) => (
                    <li key={warning.code}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">We couldn&apos;t find recommendations for this assessment.</p>
        )}
      </div>

      <GuidedBuilder
        assessmentId={gate.assessment.id}
        recommendations={herbSuggestions}
        context={{
          pregnancy_status: responses?.pregnancy_status,
          medications: responses?.medications ?? [],
          allergies: responses?.allergies ?? [],
        }}
      />

      <div className="rounded-xl border border-dashed border-terracotta/40 p-6 text-sm text-muted-foreground">
        <p>Need to update your answers or book a practitioner review?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/compounds/guided/questionnaire?redirect=/compounds/guided">
              Update questionnaire
            </Link>
          </Button>
          <Button asChild className="bg-forest text-white hover:bg-forest/90">
            <Link href="/booking">
              Book a consult
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
