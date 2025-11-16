"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type PackageCheckoutConfirmationProps = {
  sessionId: string
  packageSlug: string
}

export function PackageCheckoutConfirmation({
  sessionId,
  packageSlug,
}: PackageCheckoutConfirmationProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const confirm = async () => {
      try {
        const response = await fetch('/api/wellness/packages/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Unable to confirm checkout')
        }

        setStatus('success')
      } catch (err: any) {
        console.error('Failed to confirm wellness package purchase:', err)
        setErrorMessage(err.message || 'Something went wrong while confirming your purchase.')
        setStatus('error')
      }
    }

    confirm()
  }, [sessionId])

  if (status === 'pending') {
    return (
      <div className="rounded-xl border border-sage/20 bg-white px-6 py-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
          <p className="font-medium text-forest">Finalising your enrolment…</p>
          <p className="text-sm text-forest/70">
            We&apos;re confirming the payment with Stripe and seeding your session credits.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-semibold text-red-700">We hit a snag</p>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <p className="mt-2 text-xs text-red-500">
          Your payment is safe. Reach out to hello@leylas-apothecary.com if you need help.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-sage/20 bg-white px-6 py-8 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
        <p className="text-lg font-semibold text-forest">Welcome aboard</p>
        <p className="text-sm text-forest/70">
          Credits are live inside your dashboard. Check your email for the welcome pack and book the
          initial consult to kick things off.
        </p>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Link href="/booking" className="w-full sm:w-auto">
            <Button className="w-full bg-terracotta hover:bg-terracotta/90 text-white">
              Book initial consult
            </Button>
          </Link>
          <Link href="/account" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              View dashboard
            </Button>
          </Link>
        </div>
        <Link
          href={`/wellness/${packageSlug}`}
          className="text-xs text-forest/60 underline-offset-2 hover:underline"
        >
          Return to program details
        </Link>
      </div>
    </div>
  )
}
