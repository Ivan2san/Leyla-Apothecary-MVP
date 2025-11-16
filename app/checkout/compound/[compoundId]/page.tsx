import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompoundCheckoutForm } from '@/components/checkout/compound-checkout-form'

interface CompoundRecord {
  id: string
  owner_user_id: string
  name: string
  price: number
  tier: number
  type: string
  formula: any[]
  notes?: string | null
  source_booking_id?: string | null
  source_assessment_id?: string | null
}

export default async function CompoundCheckoutPage({
  params,
}: {
  params: { compoundId: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/checkout/compound/${params.compoundId}`)
  }

  const { data: compound, error } = await supabase
    .from('compounds')
    .select('*')
    .eq('id', params.compoundId)
    .eq('owner_user_id', user.id)
    .single()

  if (error || !compound) {
    notFound()
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Checkout</p>
          <h1 className="font-serif text-4xl text-forest">Complete your custom blend</h1>
          <p className="text-muted-foreground mt-2">
            {compound.name} · Tier {compound.tier} · ${Number(compound.price ?? 0).toFixed(2)}
          </p>
        </div>
        <CompoundCheckoutForm user={user} compound={compound as CompoundRecord} />
      </div>
    </div>
  )
}
