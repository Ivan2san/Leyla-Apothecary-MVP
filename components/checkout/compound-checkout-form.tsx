"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Loader2, Lock } from 'lucide-react'

interface CompoundCheckoutFormProps {
  user: { id: string; email?: string | null; user_metadata?: Record<string, any> }
  compound: {
    id: string
    name: string
    price: number
    tier: number
    type: string
  }
}

export function CompoundCheckoutForm({ user, compound }: CompoundCheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState(user.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [phone, setPhone] = useState(user.user_metadata?.phone ?? '')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('United States')

  const subtotal = Number(compound.price ?? 0)
  const shippingCost = subtotal >= 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              type: 'compound',
              compoundId: compound.id,
              quantity: 1,
              price: subtotal,
            },
          ],
          shippingAddress: {
            fullName,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            country,
            phone,
          },
          subtotal,
          shippingCost,
          tax,
          totalAmount: total,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Unable to create order')
      }

      const { order } = await response.json()
      router.push(`/checkout/success?order_id=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address line 1</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address line 2</Label>
              <Input id="addressLine2" value={addressLine2} onChange={(event) => setAddressLine2(event.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(event) => setState(event.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Postal code</Label>
                <Input id="zipCode" value={zipCode} onChange={(event) => setZipCode(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(event) => setCountry(event.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{compound.name}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium">
                {shippingCost === 0 ? <span className="text-green-700">FREE</span> : formatPrice(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-3 text-base font-semibold flex justify-between">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {loading ? 'Processing...' : 'Place order securely'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
