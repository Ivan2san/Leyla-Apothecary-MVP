import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { WellnessPackageService } from '@/lib/services/wellness-packages'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe =
  stripeSecretKey && stripeSecretKey.startsWith('sk_')
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
      })
    : null

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const { slug } = params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pkg = await WellnessPackageService.getPackageBySlug(slug)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const existing = await WellnessPackageService.getActiveEnrolment(user.id)
    if (existing?.status === 'active') {
      return NextResponse.json(
        { error: 'You already have an active wellness package' },
        { status: 400 }
      )
    }

    const siteUrl = getSiteUrl()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        package_slug: pkg.slug,
      },
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pkg.currency.toLowerCase(),
            unit_amount: pkg.price_cents,
            product_data: {
              name: pkg.name,
              description: pkg.description,
            },
          },
        },
      ],
      success_url: `${siteUrl}/wellness/${pkg.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/wellness/${pkg.slug}`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { checkoutUrl: session.url, sessionId: session.id },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating wellness package checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start checkout' },
      { status: 500 }
    )
  }
}
