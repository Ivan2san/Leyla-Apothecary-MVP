import { Resend } from 'resend'
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'

type NewsletterWelcomeParams = {
  email: string
  name?: string | null
}

type OrderItemSummary = {
  name: string
  quantity: number
  unitPrice: number
}

type OrderConfirmationParams = {
  email: string
  orderNumber: string
  createdAt: string
  items: OrderItemSummary[]
  totals: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  shippingAddress?: {
    fullName?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  } | null
}

type SendResult =
  | { status: 'sent'; id?: string | null }
  | { status: 'skipped'; reason: string }

const DEFAULT_FROM = "Leyla's Apothecary <hello@leylas-apothecary.com>"

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

export class EmailService {
  static async sendNewsletterWelcome(
    payload: NewsletterWelcomeParams
  ): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping welcome email send')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: "Welcome to Leyla's Apothecary",
      react: NewsletterWelcomeEmail({ name: payload.name }),
    })

    if (error) {
      throw new Error(error.message)
    }

    return { status: 'sent', id: data?.id ?? null }
  }

  static async sendOrderConfirmation(
    payload: OrderConfirmationParams
  ): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping order confirmation email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Order ${payload.orderNumber} confirmed`,
      react: OrderConfirmationEmail({
        orderNumber: payload.orderNumber,
        createdAt: payload.createdAt,
        items: payload.items,
        totals: payload.totals,
        shippingAddress: payload.shippingAddress,
      }),
    })

    if (error) {
      throw new Error(error.message)
    }

    return { status: 'sent', id: data?.id ?? null }
  }
}
