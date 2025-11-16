'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResultsDisplay } from '@/components/assessment/ResultsDisplay'
import type { AssessmentResultPayload } from '@/lib/assessment/types'

interface ResultsClientProps {
  data: AssessmentResultPayload
}

export function ResultsClient({ data }: ResultsClientProps) {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/assessment/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.id, action: 'view' }),
    }).catch(() => null)
  }, [data.id])

  const handleTrack = async (action: 'cta' | 'secondary') => {
    const target = action === 'cta' ? data.recommendedNextStep.primaryCta.href : data.recommendedNextStep.secondaryCta?.href
    fetch('/api/assessment/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.id, action }),
    }).catch(() => null)

    if (target) {
      router.push(target)
    }
  }

  return <ResultsDisplay data={data} onTrack={handleTrack} />
}
