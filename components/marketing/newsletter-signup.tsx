"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { newsletterSubscribeSchema } from '@/lib/validations/newsletter'

type StatusState = {
  type: 'idle' | 'success' | 'error'
  message: string
}

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<StatusState>({
    type: 'idle',
    message: '',
  })
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus({ type: 'idle', message: '' })

    startTransition(async () => {
      try {
        const payload = newsletterSubscribeSchema.parse({
          email,
          name,
        })

        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to subscribe right now')
        }

        setStatus({
          type: 'success',
          message: data.message || 'Thanks for subscribing!',
        })
        setEmail('')
        setName('')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong'
        setStatus({ type: 'error', message })
      }
    })
  }

  return (
    <section className="rounded-3xl bg-forest px-6 py-10 text-warm-white shadow-xl lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sage/80">
            Join The Apothecary Journal
          </p>
          <h2 className="mt-3 font-lora text-3xl font-semibold">
            Sip slow wellness notes straight to your inbox
          </h2>
          <p className="mt-3 text-sm text-warm-white/80">
            Receive seasonal rituals, new formula launches, and practitioner
            insights twice a month. No spam, just grounded herbal guidance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-warm-white/10 p-4 backdrop-blur"
        >
          <div className="space-y-2">
            <Label htmlFor="newsletter-name" className="text-warm-white/80">
              First name (optional)
            </Label>
            <Input
              id="newsletter-name"
              value={name}
              placeholder="Leyla"
              autoComplete="given-name"
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              className="border-white/20 bg-white/95 text-forest placeholder:text-forest/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-email" className="text-warm-white/80">
              Email address *
            </Label>
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              placeholder="you@email.com"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isPending}
              className="border-white/20 bg-white/95 text-forest placeholder:text-forest/40"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-sage text-forest hover:bg-sage/90"
            disabled={isPending}
          >
            {isPending ? 'Adding you...' : 'Subscribe'}
          </Button>

          {status.message && (
            <p
              className={`text-sm ${
                status.type === 'error' ? 'text-red-200' : 'text-sage'
              }`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
