"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type JoinPackageCTAProps = {
  slug: string
  className?: string
}

export function JoinPackageCTA({ slug, className }: JoinPackageCTAProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/wellness/packages/${slug}/checkout`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = `/login?redirect=/wellness/${slug}`
          return
        }
        throw new Error(data.error || 'Unable to start checkout')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('Missing checkout URL')
      }
    } catch (err: any) {
      console.error('Failed to start wellness package checkout:', err)
      setError(err.message || 'Unable to start checkout right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        className={`bg-terracotta hover:bg-terracotta/90 text-white ${className ?? ''}`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to checkout...
          </span>
        ) : (
          'Join the package'
        )}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
