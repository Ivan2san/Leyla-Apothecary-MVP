"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { GuidedHerbSuggestion } from '@/types'

interface GuidedBuilderProps {
  assessmentId: string
  recommendations: GuidedHerbSuggestion[]
  context: {
    pregnancy_status?: string
    medications?: string[]
    allergies?: string[]
  }
}

interface BuilderHerbState {
  product_id: string
  name: string
  percentage: number
  min_percentage: number
  max_percentage: number
}

interface PreviewState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  price?: number
  baseCost?: number
  warnings?: { severity: string; message: string }[]
  errorMessage?: string
}

const PREVIEW_DEBOUNCE = 600

export function GuidedBuilder({ assessmentId, recommendations, context }: GuidedBuilderProps) {
  const initialHerbs = useMemo(() => {
    return recommendations
      .filter((herb): herb is GuidedHerbSuggestion & { product_id: string } => Boolean(herb.product_id))
      .map((herb) => ({
        product_id: herb.product_id!,
        name: herb.name,
        percentage: herb.start_percentage,
        min_percentage: herb.min_percentage,
        max_percentage: herb.max_percentage,
      }))
  }, [recommendations])

  const [herbs, setHerbs] = useState<BuilderHerbState[]>(initialHerbs)
  const [compoundName, setCompoundName] = useState('')
  const [notes, setNotes] = useState('')
  const [savedCompoundId, setSavedCompoundId] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewState>({ status: 'idle' })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setHerbs(initialHerbs)
  }, [initialHerbs])

  const totalPercentage = herbs.reduce((sum, herb) => sum + herb.percentage, 0)
  const isTotalValid = Math.abs(totalPercentage - 100) < 0.5

  const updateHerbPercentage = (productId: string, nextValue: number) => {
    setHerbs((current) =>
      current.map((herb) =>
        herb.product_id === productId
          ? {
              ...herb,
              percentage: Math.max(herb.min_percentage, Math.min(herb.max_percentage, nextValue)),
            }
          : herb
      )
    )
  }

  useEffect(() => {
    if (!isTotalValid) {
      setPreview((prev) => ({ ...prev, status: 'error', errorMessage: 'Percentages must total 100.' }))
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setPreview((prev) => ({ ...prev, status: 'loading', errorMessage: undefined }))
      try {
        const response = await fetch('/api/compounds?preview=1', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: 2,
            type: 'guided',
            source_assessment_id: assessmentId,
            formula: herbs.map((herb) => ({
              product_id: herb.product_id,
              percentage: herb.percentage,
            })),
            context,
          }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.error || 'Unable to preview compound')
        }

        const data = await response.json()
        setPreview({
          status: 'ready',
          price: data.price_breakdown?.price,
          baseCost: data.price_breakdown?.baseCost,
          warnings: (data.safety_issues || []).map((issue: any) => ({
            severity: issue.severity,
            message: issue.message,
          })),
        })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Preview error:', error)
        setPreview({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unable to preview compound.',
        })
      }
    }, PREVIEW_DEBOUNCE)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [herbs, isTotalValid, assessmentId, context])

  const handleSave = async () => {
    if (!isTotalValid) {
      toast({ title: 'Adjust ratios', description: 'Percentages must add up to 100% before saving.' })
      return
    }

    try {
      const response = await fetch('/api/compounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 2,
          type: 'guided',
          source_assessment_id: assessmentId,
          name: compoundName,
          notes,
          formula: herbs.map((herb) => ({
            product_id: herb.product_id,
            percentage: herb.percentage,
          })),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Unable to save your compound.')
      }

      const data = await response.json()
      setSavedCompoundId(data.compound?.id ?? null)
      toast({
        title: 'Compound saved',
        description: 'Your guided blend is ready to review in the dashboard.',
      })
      router.refresh()
    } catch (error) {
      console.error('Save compound error:', error)
      toast({
        title: 'Unable to save compound',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (herbs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-terracotta/50 p-6 text-sm text-muted-foreground">
        We couldn&apos;t find matching products for the recommendation set. Please contact support so we can map the catalog.
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-xl border border-cream bg-white/90 p-6 shadow-sm">
      <div>
        <label className="text-sm font-medium text-forest" htmlFor="compound-name">
          Name your blend
        </label>
        <Input
          id="compound-name"
          placeholder="e.g., Calming Evening Ritual"
          value={compoundName}
          onChange={(event) => setCompoundName(event.target.value)}
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        {herbs.map((herb) => (
          <div key={herb.product_id} className="rounded-lg border border-sage/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-forest">{herb.name}</p>
                <p className="text-xs text-muted-foreground">
                  Safe range {herb.min_percentage}% – {herb.max_percentage}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={herb.min_percentage}
                  max={herb.max_percentage}
                  step={1}
                  value={herb.percentage}
                  onChange={(event) =>
                    updateHerbPercentage(herb.product_id, Number(event.target.value))
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-sage/50 bg-sage/10 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-forest font-medium">Total</span>
          <span className={isTotalValid ? 'text-forest font-semibold' : 'text-terracotta font-semibold'}>
            {totalPercentage.toFixed(0)}%
          </span>
        </div>
        {!isTotalValid && (
          <p className="mt-2 text-xs text-terracotta">
            Adjust the sliders so your blend totals 100%.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-forest" htmlFor="notes">
          Notes for the apothecary (optional)
        </label>
        <Textarea
          id="notes"
          value={notes}
          placeholder="Delivery preferences, taste adjustments, or reminders."
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2"
        />
      </div>

      <div className="rounded-lg border border-sage/40 bg-white p-4">
        <p className="text-sm font-medium text-forest">Pricing & safety preview</p>
        <div className="mt-2 text-sm text-muted-foreground">
          {preview.status === 'loading' && <p>Recalculating price…</p>}
          {preview.status === 'error' && <p className="text-terracotta">{preview.errorMessage}</p>}
          {preview.status === 'ready' && (
            <div className="space-y-2">
              <p>
                Estimated price:{' '}
                <span className="font-semibold text-forest">
                  {preview.price ? `$${preview.price.toFixed(2)}` : '—'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Base ingredients cost ~${preview.baseCost?.toFixed(2)} before margin & tier guardrails.
              </p>
              {preview.warnings && preview.warnings.length > 0 && (
                <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-medium">Important notes</p>
                  <ul className="mt-2 space-y-1">
                    {preview.warnings.map((warning, index) => (
                      <li key={`${warning.message}-${index}`}>{warning.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        className="w-full bg-forest text-white hover:bg-forest/90"
        disabled={!compoundName || !isTotalValid || preview.status === 'loading'}
        onClick={handleSave}
      >
        Save guided compound
      </Button>

      {savedCompoundId && (
        <Link href={`/checkout/compound/${savedCompoundId}`} className="block">
          <Button variant="outline" className="w-full border-forest text-forest hover:bg-forest/5">
            Checkout this blend
          </Button>
        </Link>
      )}
    </div>
  )
}
