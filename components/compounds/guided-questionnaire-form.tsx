"use client"

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const GOAL_OPTIONS = [
  { value: 'sleep', label: 'Sleep & Calm' },
  { value: 'stress', label: 'Stress Resilience' },
  { value: 'digestion', label: 'Digestion' },
  { value: 'immunity', label: 'Immune Support' },
  { value: 'energy', label: 'Sustainable Energy' },
  { value: 'detox', label: 'Detox / Skin' },
] as const

const PREGNANCY_OPTIONS = [
  { value: 'not_pregnant', label: 'Not pregnant' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'unsure', label: 'Prefer to discuss' },
] as const

const SENSITIVITY_OPTIONS = [
  { value: 'avoid_bitter', label: 'Bitter flavors upset me' },
  { value: 'avoid_alcohol', label: 'Need glycerite / alcohol-free' },
  { value: 'sensitive_stimulants', label: 'Sensitive to stimulants' },
  { value: 'sensitive_digestive', label: 'Sensitive digestion' },
] as const

const TASTE_OPTIONS = [
  { value: 'sweet', label: 'Sweet' },
  { value: 'bitter', label: 'Bitter' },
  { value: 'floral', label: 'Floral' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'earthy', label: 'Earthy' },
] as const

const STIMULANT_OPTIONS = [
  { value: 'low', label: 'Keep me calm' },
  { value: 'medium', label: 'Balanced' },
  { value: 'high', label: 'I tolerate lift' },
] as const

const SLEEP_OPTIONS = [
  { value: 'rested', label: 'Rested' },
  { value: 'tired', label: 'Tired but sleepy' },
  { value: 'wired', label: 'Tired and wired' },
] as const

const MAX_GOALS = 3

export interface GuidedQuestionnaireFormProps {
  existingResponses?: Record<string, any> | null
  lastCompletedAt?: string | null
  redirectPath: string
}

interface GuidedQuestionnaireFormValues {
  primaryConcern: string
  goals: string[]
  medicationsText: string
  allergiesText: string
  pregnancyStatus: string
  sensitivities: string[]
  tastePreferences: string[]
  stimulantSensitivity: string
  sleepQuality: string
  notes: string
}

function buildDefaults(responses?: Record<string, any> | null): GuidedQuestionnaireFormValues {
  const medications = Array.isArray(responses?.medications) ? (responses!.medications as string[]) : []
  const allergies = Array.isArray(responses?.allergies) ? (responses!.allergies as string[]) : []
  const goals = Array.isArray(responses?.goals) ? (responses!.goals as string[]) : []
  const sensitivities = Array.isArray(responses?.sensitivities)
    ? (responses!.sensitivities as string[])
    : []
  const tastePreferences = Array.isArray(responses?.taste_preferences)
    ? (responses!.taste_preferences as string[])
    : []

  return {
    primaryConcern: responses?.primary_concern ?? '',
    goals,
    medicationsText: medications.join('\n'),
    allergiesText: allergies.join('\n'),
    pregnancyStatus: responses?.pregnancy_status ?? 'not_pregnant',
    sensitivities,
    tastePreferences,
    stimulantSensitivity: responses?.stimulant_sensitivity ?? 'medium',
    sleepQuality: responses?.sleep_quality ?? 'tired',
    notes: responses?.notes ?? '',
  }
}

function textareaToArray(value: string) {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function GuidedQuestionnaireForm({
  existingResponses,
  lastCompletedAt,
  redirectPath,
}: GuidedQuestionnaireFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const defaults = useMemo(() => buildDefaults(existingResponses), [existingResponses])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GuidedQuestionnaireFormValues>({
    defaultValues: defaults,
  })

  useEffect(() => {
    register('goals')
    register('sensitivities')
    register('tastePreferences')
    register('pregnancyStatus')
  }, [register])

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const selectedGoals = watch('goals') || []
  const selectedSensitivities = watch('sensitivities') || []
  const selectedTastes = watch('tastePreferences') || []

  const toggleArrayValue = (field: keyof GuidedQuestionnaireFormValues, value: string, limit?: number) => {
    const current = watch(field as any) as string[] | undefined
    const next = new Set(current ?? [])
    if (next.has(value)) {
      next.delete(value)
    } else {
      if (limit && next.size >= limit) {
        toast({
          title: `Pick up to ${limit}`,
          description: 'Focus on the most important options so we can make strong recommendations.',
        })
        return
      }
      next.add(value)
    }
    setValue(field as any, Array.from(next))
  }

  const onSubmit = async (values: GuidedQuestionnaireFormValues) => {
    if (values.goals.length === 0) {
      toast({
        title: 'Choose at least one goal',
        description: 'We need a health focus to run the recommendation engine.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        primary_concern: values.primaryConcern.trim(),
        goals: values.goals,
        medications: textareaToArray(values.medicationsText),
        allergies: textareaToArray(values.allergiesText),
        pregnancy_status: values.pregnancyStatus,
        sensitivities: values.sensitivities,
        taste_preferences: values.tastePreferences,
        stimulant_sensitivity: values.stimulantSensitivity,
        sleep_quality: values.sleepQuality,
        notes: values.notes?.trim() || undefined,
      }

      const response = await fetch('/api/assessments/guided-compound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Unable to save assessment')
      }

      const data = await response.json()
      toast({
        title: 'Assessment saved',
        description: 'We generated a guided blend starting point for you.',
      })
      router.push(`${redirectPath}?assessmentId=${data.assessment.id}`)
    } catch (error) {
      console.error('Guided assessment submit error:', error)
      toast({
        title: 'Unable to save assessment',
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {lastCompletedAt && (
        <div className="rounded-lg border border-sage bg-sage/10 p-4 text-sm text-forest">
          Last completed {new Date(lastCompletedAt).toLocaleDateString()}. Update your answers anytime to refresh your guided formula suggestions.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="primaryConcern">What brings you here?</Label>
        <Textarea
          id="primaryConcern"
          rows={4}
          placeholder="Describe your main symptoms, timeline, or goals so we know where to focus."
          {...register('primaryConcern', { required: true, minLength: 10 })}
        />
        {errors.primaryConcern && (
          <p className="text-sm text-terracotta">Please add a bit more detail.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Top goals (choose up to 3)</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {GOAL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                selectedGoals.includes(option.value)
                  ? 'border-terracotta bg-terracotta/5 text-forest'
                  : 'border-border hover:border-terracotta/40'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedGoals.includes(option.value)}
                onChange={() => toggleArrayValue('goals', option.value, MAX_GOALS)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected {selectedGoals.length} / {MAX_GOALS}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="medications">Current medications / supplements</Label>
          <Textarea
            id="medications"
            rows={4}
            placeholder="One item per line (e.g., Zoloft 50mg, Iron supplement)"
            {...register('medicationsText')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies or sensitivities</Label>
          <Textarea
            id="allergies"
            rows={4}
            placeholder="List anything your practitioner should avoid"
            {...register('allergiesText')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pregnancy / lactation status</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {PREGNANCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                watch('pregnancyStatus') === option.value
                  ? 'border-terracotta bg-terracotta/5 text-forest'
                  : 'border-border hover:border-terracotta/40'
              }`}
            >
              <input
                type="radio"
                className="hidden"
                value={option.value}
                checked={watch('pregnancyStatus') === option.value}
                onChange={() => setValue('pregnancyStatus', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Body sensitivities</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {SENSITIVITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                  selectedSensitivities.includes(option.value)
                    ? 'border-terracotta bg-terracotta/5 text-forest'
                    : 'border-border hover:border-terracotta/40'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedSensitivities.includes(option.value)}
                  onChange={() => toggleArrayValue('sensitivities', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Taste preferences</Label>
          <div className="flex flex-wrap gap-2">
            {TASTE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleArrayValue('tastePreferences', option.value)}
                className={`rounded-full border px-4 py-1 text-sm ${
                  selectedTastes.includes(option.value)
                    ? 'border-terracotta bg-terracotta/10 text-terracotta'
                    : 'border-border text-muted-foreground hover:border-terracotta/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Stimulant tolerance</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('stimulantSensitivity')}
            >
              {STIMULANT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Sleep quality</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('sleepQuality')}
            >
              {SLEEP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anything else?</Label>
        <Input
          id="notes"
          placeholder="E.g., “Please avoid alcohol-based extracts.”"
          {...register('notes')}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-terracotta text-white hover:bg-terracotta/90"
      >
        {isSubmitting ? 'Generating recommendations...' : 'Save assessment & continue'}
      </Button>
    </form>
  )
}
