import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { WellnessPackageService } from '@/lib/services/wellness-packages'
import { EmailService } from '@/lib/services/email'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe =
  stripeSecretKey && stripeSecretKey.startsWith('sk_')
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
      })
    : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.id !== sessionId) {
      return NextResponse.json(
        { error: 'Invalid checkout session' },
        { status: 400 }
      )
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment is not completed yet' },
        { status: 400 }
      )
    }

    if (!session.metadata) {
      return NextResponse.json(
        { error: 'Missing session metadata' },
        { status: 400 }
      )
    }

    if (session.metadata.user_id !== user.id) {
      return NextResponse.json(
        { error: 'This checkout session belongs to another user' },
        { status: 403 }
      )
    }

    const packageId = session.metadata.package_id
    if (!packageId) {
      return NextResponse.json(
        { error: 'Checkout session missing package metadata' },
        { status: 400 }
      )
    }

    const existing = await WellnessPackageService.getEnrolmentByCheckoutId(
      session.id
    )
    if (existing) {
      return NextResponse.json(
        { enrolment: existing, alreadyExists: true },
        { status: 200 }
      )
    }

    const enrolment = await WellnessPackageService.createEnrolment({
      userId: user.id,
      packageId,
      stripeCheckoutId: session.id,
    })

    if (user.email) {
      try {
        await EmailService.sendWellnessPackageWelcome({
          email: user.email,
          name: user.user_metadata?.full_name,
          packageName:
            enrolment.wellness_packages?.name || 'Wellness Package',
          durationWeeks:
            enrolment.wellness_packages?.duration_weeks || undefined,
          credits: enrolment.session_credits,
        })
      } catch (emailError) {
        console.error('Failed to send wellness package welcome email:', emailError)
      }
    }

    return NextResponse.json({ enrolment }, { status: 200 })
  } catch (error: any) {
    console.error('Error confirming wellness package checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm wellness package purchase' },
      { status: 500 }
    )
  }
}
