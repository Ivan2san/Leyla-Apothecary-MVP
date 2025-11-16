"use client"

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { CompoundHerbComponent } from '@/types'

interface PractitionerBuilderProps {
  bookingId: string
  clientName: string
  clientEmail: string
  products: { id: string; name: string; price: number; volume_ml: number }[]
  defaultFormula?: { product_id: string; percentage: number }[]
  defaultName?: string
  defaultNotes?: string
  existingCompoundId?: string | null
}

interface HerbState {
  product_id: string
  percentage: number
}

interface PreviewData {
  status: 'idle' | 'loading' | 'ready' | 'error'
  price?: number
  baseCost?: number
  safety?: { severity: string; message: string }[]
  message?: string
}

export function PractitionerBuilder({
  bookingId,
  clientName,
  clientEmail,
  products,
  defaultFormula = [],
  defaultName = '',
  defaultNotes = '',
  existingCompoundId,
}: PractitionerBuilderProps) {
  const [herbs, setHerbs] = useState<HerbState[]>(defaultFormula)
  const [compoundName, setCompoundName] = useState(defaultName)
  const [notes, setNotes] = useState(defaultNotes)
  const [preview, setPreview] = useState<PreviewData>({ status: 'idle' })
  const [batchForm, setBatchForm] = useState({
    batch_code: '',
    total_volume_ml: 100,
    expiry_date: '',
    notes: '',
  })
  const [savedCompoundId, setSavedCompoundId] = useState<string | null>(existingCompoundId ?? null)
  const { toast } = useToast()

  useEffect(() => {
    if (defaultFormula.length > 0) {
      setHerbs(defaultFormula)
    }
  }, [defaultFormula])

  const updateHerb = (index: number, data: Partial<HerbState>) => {
    setHerbs((current) => {
      const clone = [...current]
      clone[index] = { ...clone[index], ...data }
      return clone
    })
  }

  const addHerb = (productId?: string) => {
    if (!productId && products.length === 0) return
    if (herbs.length >= 7) {
      toast({ title: 'Limit reached', description: 'Practitioner formulas support up to 7 herbs.' })
      return
    }
    const selected = productId ?? products[0]?.id
    if (!selected) return
    setHerbs((current) => [...current, { product_id: selected, percentage: Math.floor(100 / (current.length + 1)) }])
  }

  const removeHerb = (index: number) => {
    setHerbs((current) => current.filter((_, idx) => idx !== index))
  }

  const totalPercentage = herbs.reduce((sum, herb) => sum + (Number(herb.percentage) || 0), 0)
  const isFormulaValid = Math.abs(totalPercentage - 100) < 0.5 && herbs.length > 0

  useEffect(() => {
    if (!isFormulaValid) {
      setPreview((prev) => ({ ...prev, status: 'error', message: 'Formula must total 100%.' }))
      return
    }

    const controller = new AbortController()
    async function runPreview() {
      setPreview((prev) => ({ ...prev, status: 'loading', message: undefined }))
      try {
        const response = await fetch('/api/compounds?preview=1', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: 3,
            type: 'practitioner',
            source_booking_id: bookingId,
            formula: herbs,
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
          safety: (data.safety_issues || []).map((issue: any) => ({
            severity: issue.severity,
            message: issue.message,
          })),
        })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Practitioner preview error:', error)
        setPreview({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to preview compound',
        })
      }
    }

    const timer = setTimeout(runPreview, 400)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [herbs, bookingId, isFormulaValid])

  const handleSaveCompound = async () => {
    if (!isFormulaValid) {
      toast({ title: 'Formula incomplete', description: 'Ensure the blend totals 100%.' })
      return
    }
    if (compoundName.trim().length < 3) {
      toast({ title: 'Name required', description: 'Enter a descriptive compound name.' })
      return
    }

    try {
      const response = await fetch('/api/compounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 3,
          type: 'practitioner',
          source_booking_id: bookingId,
          name: compoundName.trim(),
          notes,
          formula: herbs,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Unable to save compound')
      }

      const payload = await response.json()
      setSavedCompoundId(payload.compound?.id ?? null)
      toast({
        title: 'Compound saved',
        description: 'Batch tracking is now available below.',
      })
    } catch (error) {
      console.error('Save practitioner compound error:', error)
      toast({
        title: 'Unable to save compound',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateBatch = async () => {
    if (!savedCompoundId) {
      toast({ title: 'Save compound first', description: 'Save the practitioner compound before logging batches.' })
      return
    }

    if (!batchForm.batch_code || batchForm.total_volume_ml <= 0) {
      toast({ title: 'Incomplete batch details', description: 'Batch code and volume are required.' })
      return
    }

    try {
      const response = await fetch('/api/compound-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compound_id: savedCompoundId,
          batch_code: batchForm.batch_code,
          total_volume_ml: Number(batchForm.total_volume_ml),
          expiry_date: batchForm.expiry_date || null,
          notes: batchForm.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Unable to create batch')
      }

      toast({
        title: 'Batch recorded',
        description: `Batch ${batchForm.batch_code} is ready for dispensing.`,
      })
      setBatchForm({ batch_code: '', total_volume_ml: 100, expiry_date: '', notes: '' })
    } catch (error) {
      console.error('Batch creation error:', error)
      toast({
        title: 'Unable to create batch',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) => !herbs.some((herb) => herb.product_id === product.id)
      ),
    [products, herbs]
  )

  return (
    <div className="space-y-8 rounded-xl border border-sage/30 bg-white/95 p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Tier 3 · Practitioner blend</p>
        <h2 className="font-serif text-2xl text-forest">Custom formulation for {clientName}</h2>
        <p className="text-sm text-muted-foreground">{clientEmail}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-forest">Blend name</label>
          <Input
            className="mt-2"
            placeholder="e.g., Cardiovascular Circulation Support"
            value={compoundName}
            onChange={(event) => setCompoundName(event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-forest">Clinical notes</label>
          <Textarea
            className="mt-2"
            rows={3}
            placeholder="Document rationale, dosage, or adjustments"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-forest">Formula components</p>
          <Button
            size="sm"
            type="button"
            onClick={() => addHerb(availableProducts[0]?.id)}
            disabled={availableProducts.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add herb
          </Button>
        </div>

        {herbs.length === 0 && (
          <p className="rounded-md border border-dashed border-sage/50 p-4 text-sm text-muted-foreground">
            Add herbs to start composing this formula. Up to seven ingredients are supported.
          </p>
        )}

        {herbs.map((herb, index) => (
          <div key={`${herb.product_id}-${index}`} className="grid gap-3 rounded-lg border border-sage/30 p-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Herb</label>
              <Select
                value={herb.product_id}
                onValueChange={(value) => updateHerb(index, { product_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select herb" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Percentage</label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={herb.percentage}
                  onChange={(event) =>
                    updateHerb(index, { percentage: Number(event.target.value) })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHerb(index)}
                >
                  <Trash2 className="h-4 w-4 text-terracotta" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <p className={`text-sm font-semibold ${isFormulaValid ? 'text-forest' : 'text-terracotta'}`}>
          Total: {totalPercentage.toFixed(0)}%
        </p>
      </section>

      <section className="rounded-lg border border-sage/30 bg-sage/10 p-4 text-sm">
        <p className="font-semibold text-forest">Pricing & safety</p>
        {preview.status === 'loading' && <p className="text-muted-foreground">Calculating price and safety checks…</p>}
        {preview.status === 'error' && <p className="text-terracotta">{preview.message}</p>}
        {preview.status === 'ready' && (
          <div className="space-y-2">
            <p>
              Estimated price:{' '}
              <span className="font-semibold text-forest">
                {preview.price ? `$${preview.price.toFixed(2)}` : '—'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Base cost: ${preview.baseCost?.toFixed(2)} before practitioner margin & tier guardrails.
            </p>
            {preview.safety && preview.safety.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-xs text-terracotta">
                {preview.safety.map((item, index) => (
                  <li key={`${item.message}-${index}`}>{item.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <Button
        className="w-full bg-forest text-white hover:bg-forest/90"
        onClick={handleSaveCompound}
        disabled={!isFormulaValid}
      >
        Save practitioner compound
      </Button>

      <section className="space-y-4 rounded-lg border border-sage/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-forest">Batch tracking</p>
            <p className="text-sm text-muted-foreground">
              Generate a batch code and label info once the formula is finalized.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleCreateBatch}
            disabled={!savedCompoundId}
          >
            Log batch
          </Button>
        </div>
        {!savedCompoundId && (
          <p className="text-sm text-muted-foreground">
            Save the compound before recording a batch. Batches link to a specific formulation version.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Batch code</label>
            <Input
              className="mt-1"
              placeholder="e.g., LG-2025-01-15A"
              value={batchForm.batch_code}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, batch_code: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Total volume (ml)
            </label>
            <Input
              type="number"
              className="mt-1"
              value={batchForm.total_volume_ml}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, total_volume_ml: Number(event.target.value) }))}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Expiry date</label>
            <Input
              type="date"
              className="mt-1"
              value={batchForm.expiry_date}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, expiry_date: event.target.value }))}
            />
          </div>
        </div>
        <Textarea
          placeholder="Batch notes (optional)"
          value={batchForm.notes}
          onChange={(event) => setBatchForm((prev) => ({ ...prev, notes: event.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Label includes batch code, prepared date, dosage, and practitioner signature. Dispensing logs will attach to this batch automatically.
        </p>
      </section>
    </div>
  )
}
