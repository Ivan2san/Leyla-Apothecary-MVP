import { notFound } from 'next/navigation'
import { ResultsClient } from '@/components/assessment/ResultsClient'
import type { AssessmentResultPayload } from '@/lib/assessment/types'
import { getBaseUrl } from '@/lib/utils'

async function fetchResult(id: string): Promise<AssessmentResultPayload | null> {
  const response = await fetch(`${getBaseUrl()}/api/assessment/results/${id}`, {
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to load assessment results')
  }

  return response.json()
}

interface ResultPageProps {
  params: { id: string }
}

export default async function AssessmentResultPage({ params }: ResultPageProps) {
  const data = await fetchResult(params.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="bg-warm-white py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-terracotta">Your Personalized Baseline</p>
          <h1 className="font-lora text-4xl text-forest">Here are your tailored insights, {data.name}</h1>
          <p className="mt-2 text-forest/70">Review your score, personalized insights, and Leyla&apos;s recommended next step.</p>
        </div>
        <div className="mt-10">
          <ResultsClient data={data} />
        </div>
        <div className="mt-12 rounded-3xl border border-forest/10 bg-white p-6 text-sm text-forest/80">
          <p className="font-semibold text-forest">Questions about your results?</p>
          <p className="mt-2">Email: hello@leylasapothecary.com.au · Phone: (02) 5550 9876 · Southern Highlands, NSW</p>
          <p className="mt-4 text-xs text-forest/60">
            Disclaimer: This assessment provides educational insights and is not a substitute for medical diagnosis. Always consult qualified healthcare practitioners for specific concerns.
          </p>
        </div>
      </div>
    </div>
  )
}
