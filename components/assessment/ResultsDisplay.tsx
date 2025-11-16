'use client'

import { Button } from '@/components/ui/button'
import { scoreCategoryLabels } from '@/lib/assessment/scoring'
import type { AssessmentResultPayload } from '@/lib/assessment/types'

interface ResultsDisplayProps {
  data: AssessmentResultPayload
  onTrack: (action: 'cta' | 'secondary') => void
}

const gaugeColors = {
  strong: 'bg-sage',
  moderate: 'bg-terracotta',
  needs_attention: 'bg-forest',
}

export function ResultsDisplay({ data, onTrack }: ResultsDisplayProps) {
  const { title, subtitle } = scoreCategoryLabels[data.category]
  const gaugeRotation = Math.min(180, (data.score / 100) * 180)

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-forest/10 bg-white p-6 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-forest/70">Your Wellness Baseline Score</p>
        <div className="mx-auto mt-6 flex w-full max-w-sm flex-col items-center gap-4">
          <div className="relative h-48 w-48">
            <div className="absolute inset-0 rounded-full border-8 border-forest/10" />
            <div
              className={`absolute inset-6 rounded-full border-4 ${gaugeColors[data.category]} border-transparent`}
              style={{ transform: `rotate(${gaugeRotation}deg)` }}
              aria-hidden
            />
            <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white">
              <span className="font-lora text-4xl text-forest">{data.score}%</span>
              <span className="px-2 text-center text-xs uppercase leading-tight tracking-wider text-forest/60">{title}</span>
            </div>
          </div>
          <p className="text-forest/80">{subtitle}</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {data.insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-forest/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-forest/60">{insight.status === 'attention' ? 'Needs Support' : 'Stable'}</p>
            <p className="mt-2 font-lora text-xl text-forest">{insight.title}</p>
            <p className="mt-3 text-sm text-forest/80">{insight.summary}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-forest/10 bg-forest text-warm-white">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-2">
          <div>
            <p className="font-lora text-3xl">{data.recommendedNextStep.title}</p>
            <p className="mt-3 text-warm-white/80">{data.recommendedNextStep.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-warm-white/90">
              {data.recommendedNextStep.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span aria-hidden>→</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="bg-sage text-forest hover:bg-warm-white"
              onClick={() => onTrack('cta')}
            >
              {data.recommendedNextStep.primaryCta.label}
            </Button>
            {data.recommendedNextStep.secondaryCta && (
              <Button
                variant="outline"
                className="border-white/40 text-warm-white hover:bg-white/10"
                onClick={() => onTrack('secondary')}
              >
                {data.recommendedNextStep.secondaryCta.label}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
