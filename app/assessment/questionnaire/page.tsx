'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProgressBar } from '@/components/assessment/ProgressBar'
import { QuestionCard } from '@/components/assessment/QuestionCard'
import { bestPracticeQuestionsConfig, qualifyingQuestions, notesQuestion } from '@/lib/assessment/questions'
import { wellnessAssessmentSchema } from '@/lib/validations/wellness-assessment'
import type { WellnessAssessmentInput } from '@/lib/validations/wellness-assessment'

export const dynamic = 'force-dynamic'

const bestPracticeGroups = [
  bestPracticeQuestionsConfig.slice(0, 5),
  bestPracticeQuestionsConfig.slice(5, 10),
]

const progressPercentages = [25, 50, 75, 90]
const progressLabels = [
  'Step 1 of 4 · Contact Information',
  'Questions 1-5 of 15',
  'Questions 6-10 of 15',
  'Questions 11-15 of 15',
]

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'Sometimes', value: 'sometimes' },
  { label: 'No', value: 'no' },
] as const

const defaultValues: WellnessAssessmentInput = {
  name: '',
  email: '',
  phone: undefined,
  location: undefined,
  ip_address: undefined,
  q1_digestive_issues: 'no',
  q2_sleep_quality: 'no',
  q3_medications: 'no',
  q4_processed_foods: 'no',
  q5_energy_crashes: 'no',
  q6_water_intake: 'no',
  q7_toxic_exposure: 'no',
  q8_symptoms: 'no',
  q9_supplements: 'no',
  q10_unresolved_issues: 'no',
  current_situation: 'just_beginning',
  primary_goal: 'resolve_digestive',
  biggest_obstacle: 'dont_know_where_to_start',
  preferred_support: 'self_guided',
  additional_notes: undefined,
  utm_source: undefined,
  utm_medium: undefined,
  utm_campaign: undefined,
}

export default function AssessmentQuestionnairePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<WellnessAssessmentInput>({
    resolver: zodResolver(wellnessAssessmentSchema),
    mode: 'onBlur',
    defaultValues,
  })

  const { control, handleSubmit, trigger, setValue, formState } = form
  const { errors } = formState

  useEffect(() => {
    const source = params.get('utm_source')
    const medium = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    if (source) setValue('utm_source', source)
    if (medium) setValue('utm_medium', medium)
    if (campaign) setValue('utm_campaign', campaign)
  }, [params, setValue])

  useEffect(() => {
    async function detectLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/')
        if (!response.ok) return
        const data = await response.json()
        const locality = [data.city, data.region_code, data.country_code].filter(Boolean).join(', ')
        if (locality) setValue('location', locality)
        if (data.ip) setValue('ip_address', data.ip)
      } catch (err) {
        console.error('Location lookup failed', err)
      }
    }
    detectLocation()
  }, [setValue])

  const steps = useMemo(
    () => [
      ['name', 'email', 'phone', 'location'],
      bestPracticeGroups[0].map((q) => q.id),
      bestPracticeGroups[1].map((q) => q.id),
      ['current_situation', 'primary_goal', 'biggest_obstacle', 'preferred_support', 'additional_notes'],
    ],
    []
  )

  const currentLabel = progressLabels[step]

  const goNext = async () => {
    const fields = steps[step]
    const valid = await trigger(fields as (keyof WellnessAssessmentInput)[])
    if (!valid) return
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1)
    }
  }

  const goBack = () => {
    if (step === 0) return
    setStep((prev) => prev - 1)
  }

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Unable to save your assessment. Please try again.')
      }

      const result = await response.json()
      router.push(`/assessment/results/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  })

  const renderContactStep = () => (
    <QuestionCard title="Let’s get started" description="Your details help Leyla customize your roadmap.">
      <label className="block text-sm font-medium text-forest" htmlFor="name">
        What should we call you?*
      </label>
      <Controller
        control={control}
        name="name"
        render={({ field }) => <Input id="name" placeholder="Your name" {...field} value={field.value ?? ''} />}
      />
      {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      <label className="block text-sm font-medium text-forest" htmlFor="email">
        Email address*
      </label>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input id="email" type="email" placeholder="you@email.com" {...field} value={field.value ?? ''} />
        )}
      />
      {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
      <label className="block text-sm font-medium text-forest" htmlFor="phone">
        Phone (optional)
      </label>
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Input id="phone" type="tel" placeholder="e.g., 0412 345 678" {...field} value={field.value ?? ''} />
        )}
      />
      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message as string}</p>}
      <label className="block text-sm font-medium text-forest" htmlFor="location">
        Location (auto-detected)
      </label>
      <Controller
        control={control}
        name="location"
        render={({ field }) => (
          <Input id="location" placeholder="Southern Highlands, NSW" {...field} value={field.value ?? ''} />
        )}
      />
      {errors.location && <p className="text-sm text-destructive">{errors.location.message as string}</p>}
      <p className="text-xs text-forest/60">
        We respect your privacy. Your information is secure and never shared.
      </p>
    </QuestionCard>
  )

  const renderBestPracticeGroup = (index: number) => (
    <div className="space-y-6">
      {bestPracticeGroups[index].map((question, qIndex) => (
        <QuestionCard key={question.id} title={`Question ${index * 5 + qIndex + 1}`} description={question.prompt}>
          <div className="flex flex-wrap gap-3">
            {yesNoOptions.map((option) => (
              <Controller
                key={option.value}
                control={control}
                name={question.id}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`rounded-full border px-6 py-2 text-sm font-semibold transition ${
                      field.value === option.value
                        ? 'border-forest bg-sage text-forest'
                        : 'border-forest/20 bg-white text-forest/70'
                    }`}
                    aria-pressed={field.value === option.value}
                  >
                    {option.label}
                  </button>
                )}
              />
            ))}
          </div>
        </QuestionCard>
      ))}
    </div>
  )

  const renderQualifyingStep = () => (
    <div className="space-y-6">
      {qualifyingQuestions.map((question) => (
        <QuestionCard key={question.name} title={question.prompt}>
          <div className="space-y-3">
            {question.options.map((option) => (
              <Controller
                key={option.value}
                control={control}
                name={question.name as keyof WellnessAssessmentInput}
                render={({ field }) => (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm ${
                    field.value === option.value
                      ? 'border-sage bg-sage/20'
                      : 'border-forest/10 bg-white'
                  }`}>
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4"
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                    />
                    <span className="text-forest">{option.label}</span>
                  </label>
                )}
              />
            ))}
          </div>
        </QuestionCard>
      ))}
      <QuestionCard title={notesQuestion.prompt}>
        <Controller
          control={control}
          name="additional_notes"
          render={({ field }) => (
            <Textarea rows={4} placeholder={notesQuestion.placeholder} {...field} value={field.value ?? ''} />
          )}
        />
      </QuestionCard>
    </div>
  )

  const renderStepContent = () => {
    if (step === 0) return renderContactStep()
    if (step === 1) return renderBestPracticeGroup(0)
    if (step === 2) return renderBestPracticeGroup(1)
    return renderQualifyingStep()
  }

  return (
    <div className="bg-warm-white py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-6">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-terracotta">Leyla&apos;s Wellness Assessment</p>
          <h1 className="font-lora text-4xl text-forest">Discover what your body is asking for</h1>
          <p className="text-forest/70">Answer honestly—there are no wrong answers, only insights.</p>
        </div>
        <ProgressBar currentStep={1} totalSteps={1} label={currentLabel} percentOverride={progressPercentages[step]} />
        <form className="space-y-8" onSubmit={onSubmit}>
          {renderStepContent()}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-between gap-4">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || isSubmitting}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={goNext} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-sage text-forest hover:bg-forest hover:text-warm-white">
                {isSubmitting ? 'Calculating your results…' : 'See My Personalized Results'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
