"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OligoscanBiometrics } from '@/lib/types/booking.types'
import {
  oligoscanHeavyMetalStatusSchema,
  oligoscanMineralStatusSchema,
  oligoscanVitaminStatusSchema,
} from '@/lib/validations/assessments'

type CategoryState = {
  status: string
  notes: string
}

function createDefaultCategory(status: string): CategoryState {
  return {
    status,
    notes: '',
  }
}

const mineralStatuses = oligoscanMineralStatusSchema.options
const heavyMetalStatuses = oligoscanHeavyMetalStatusSchema.options
const vitaminStatuses = oligoscanVitaminStatusSchema.options

interface OligoscanAssessmentFormProps {
  bookingId: string
  userId: string
  clientName: string
  appointmentLabel: string
  biometrics?: OligoscanBiometrics | null
  bookingNotes?: string | null
}

export function OligoscanAssessmentForm({
  bookingId,
  userId,
  clientName,
  appointmentLabel,
  biometrics,
  bookingNotes,
}: OligoscanAssessmentFormProps) {
  const router = useRouter()
  const [score, setScore] = useState(5)
  const [summary, setSummary] = useState('')
  const [keyFindings, setKeyFindings] = useState(['', '', ''])
  const [minerals, setMinerals] = useState<CategoryState>(() =>
    createDefaultCategory('borderline')
  )
  const [heavyMetals, setHeavyMetals] = useState<CategoryState>(() =>
    createDefaultCategory('moderate_burden')
  )
  const [vitamins, setVitamins] = useState<CategoryState>(() =>
    createDefaultCategory('borderline')
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const filledFindings = keyFindings.map((finding) => finding.trim()).filter(Boolean)
  const canSubmit =
    !submitting &&
    summary.trim().length >= 20 &&
    filledFindings.length >= 3 &&
    filledFindings.length <= 6

  const updateKeyFinding = (index: number, value: string) => {
    setKeyFindings((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const addKeyFinding = () => {
    if (keyFindings.length >= 6) return
    setKeyFindings((prev) => [...prev, ''])
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/assessments/oligoscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          userId,
          score,
          summary: summary.trim(),
          keyFindings: filledFindings,
          categories: {
            minerals: {
              status: minerals.status,
              notes: minerals.notes || undefined,
            },
            heavyMetals: {
              status: heavyMetals.status,
              notes: heavyMetals.notes || undefined,
            },
            vitamins: {
              status: vitamins.status,
              notes: vitamins.notes || undefined,
            },
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment')
      }

      setSuccess(true)
      setTimeout(() => router.push('/practitioner'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save assessment'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-sage/30">
        <CardHeader>
          <CardTitle className="text-forest">Assessment saved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-forest/80">
            Oligoscan notes for {clientName} have been recorded. Redirecting you back
            to the practitioner dashboard.
          </p>
          <Button onClick={() => router.push('/practitioner')} className="bg-forest text-white">
            Return to dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderBiometrics = () => {
    if (!biometrics) {
      return <p className="text-sm text-muted-foreground">No biometrics captured.</p>
    }

    return (
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Date of birth</dt>
          <dd className="font-medium">{biometrics.dateOfBirth}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Gender</dt>
          <dd className="font-medium capitalize">{biometrics.gender.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Blood type</dt>
          <dd className="font-medium">{biometrics.bloodType}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Height</dt>
          <dd className="font-medium">{biometrics.heightCm} cm</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Weight</dt>
          <dd className="font-medium">{biometrics.weightKg} kg</dd>
        </div>
      </dl>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-sage/30">
        <CardHeader>
          <CardTitle className="text-forest">Session details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-semibold text-forest">{clientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Appointment</p>
              <p className="font-semibold text-forest">{appointmentLabel}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Biometrics</p>
            {renderBiometrics()}
          </div>
          {bookingNotes && (
            <div>
              <p className="text-muted-foreground mb-1">Client notes</p>
              <p className="rounded-md border border-sage/30 bg-muted/40 p-3 text-forest/80">
                {bookingNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-sage/30">
        <CardHeader>
          <CardTitle className="text-forest">Assessment summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Overall concern score</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={score}
                onChange={(event) => setScore(Number(event.target.value))}
                className="flex-1 accent-terracotta"
              />
              <div className="w-12 text-center text-lg font-semibold text-forest">{score}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              0–3 mild · 4–6 moderate · 7–10 high concern
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="oligoscan-summary">Practitioner summary</Label>
            <textarea
              id="oligoscan-summary"
              rows={5}
              className="w-full rounded-md border border-sage/40 bg-white px-3 py-2 text-sm"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Share the overall pattern, priorities, and therapeutic framing given during the consult."
              maxLength={1200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {summary.length}/1200 characters
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Key findings</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyFinding}
                disabled={keyFindings.length >= 6}
              >
                Add finding
              </Button>
            </div>
            <div className="space-y-3">
              {keyFindings.map((finding, index) => (
                <Input
                  key={`finding-${index}`}
                  value={finding}
                  onChange={(event) => updateKeyFinding(index, event.target.value)}
                  placeholder={`Finding ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Provide 3–6 short statements your client can understand at a glance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sage/30">
        <CardHeader>
          <CardTitle className="text-forest">Category statuses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Minerals</Label>
              <Select
                value={minerals.status}
                onValueChange={(value) => setMinerals((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {mineralStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Notes (optional)"
                value={minerals.notes}
                onChange={(event) => setMinerals((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Heavy metals</Label>
              <Select
                value={heavyMetals.status}
                onValueChange={(value) => setHeavyMetals((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {heavyMetalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Notes (optional)"
                value={heavyMetals.notes}
                onChange={(event) =>
                  setHeavyMetals((prev) => ({ ...prev, notes: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vitamins</Label>
            <Select
              value={vitamins.status}
              onValueChange={(value) => setVitamins((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {vitaminStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Notes (optional)"
              value={vitamins.notes}
              onChange={(event) => setVitamins((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full bg-terracotta text-white hover:bg-terracotta/90"
      >
        {submitting ? 'Saving assessment...' : 'Save assessment'}
      </Button>
    </div>
  )
}
