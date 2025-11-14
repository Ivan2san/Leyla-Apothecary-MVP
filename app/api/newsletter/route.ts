import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/lib/services/newsletter'
import { EmailService } from '@/lib/services/email'
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from '@/lib/validations/newsletter'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NewsletterSubscribeInput
    const payload = newsletterSubscribeSchema.parse(body)

    const subscription = await NewsletterService.subscribe(payload)

    EmailService.sendNewsletterWelcome({
      email: subscription.email,
      name: subscription.name,
    }).catch((error) => {
      console.error('Failed to send newsletter welcome email:', error)
    })

    return NextResponse.json(
      {
        message: 'Thanks for subscribing! Check your inbox for wellness tips soon.',
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.flatten(),
        },
        { status: 400 }
      )
    }

    const message =
      error instanceof Error ? error.message : 'Failed to subscribe'

    // Treat duplicate email attempts as success for UX parity
    if (message.includes('duplicate key')) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      )
    }

    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Unable to subscribe right now. Please try again later.' },
      { status: 500 }
    )
  }
}
