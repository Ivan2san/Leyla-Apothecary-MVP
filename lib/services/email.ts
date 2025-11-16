import { Resend } from 'resend'
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'
import { OrderStatusUpdateEmail } from '@/emails/order-status-update'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation'
import { BookingStatusUpdateEmail } from '@/emails/booking-status-update'
import { WellnessPackageWelcomeEmail } from '@/emails/wellness-package-welcome'
import { OligoscanPreConsultEmail } from '@/emails/oligoscan-pre-consult'
import type { SessionCreditLedger } from '@/lib/types/wellness-packages'

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

type WellnessPackageWelcomeParams = {
  email: string
  name?: string | null
  packageName: string
  durationWeeks?: number
  credits: SessionCreditLedger
}

type OligoscanPreConsultParams = {
  email: string
  name?: string | null
  appointmentDate: string
  appointmentTime: string
}

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

  static async sendOrderStatusUpdate(payload: {
    email: string
    orderNumber: string
    status: string
    total: number
  }): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping order status email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Order ${payload.orderNumber} is now ${payload.status}`,
      react: OrderStatusUpdateEmail({
        orderNumber: payload.orderNumber,
        status: payload.status,
        total: payload.total,
      }),
    })

    if (error) throw new Error(error.message)
    return { status: 'sent', id: data?.id ?? null }
  }

  static async sendBookingConfirmation(payload: {
    email: string
    name?: string | null
    type: string
    date: string
    time: string
    duration: number
    notes?: string | null
  }): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping booking confirmation email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Booking confirmed for ${payload.type}`,
      react: BookingConfirmationEmail(payload),
    })

    if (error) throw new Error(error.message)
    return { status: 'sent', id: data?.id ?? null }
  }

  static async sendBookingStatusUpdate(payload: {
    email: string
    name?: string | null
    type: string
    date: string
    time: string
    status: string
  }): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping booking status email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Booking updated (${payload.type})`,
      react: BookingStatusUpdateEmail(payload),
    })

    if (error) throw new Error(error.message)
    return { status: 'sent', id: data?.id ?? null }
  }

  static async sendOligoscanPreConsult(
    payload: OligoscanPreConsultParams
  ): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping Oligoscan pre-consult email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: 'Your upcoming Oligoscan session',
      react: OligoscanPreConsultEmail({
        name: payload.name,
        appointmentDate: payload.appointmentDate,
        appointmentTime: payload.appointmentTime,
      }),
    })

    if (error) throw new Error(error.message)
    return { status: 'sent', id: data?.id ?? null }
  }

  static async sendWellnessPackageWelcome(
    payload: WellnessPackageWelcomeParams
  ): Promise<SendResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('Resend API key missing, skipping package welcome email')
      return { status: 'skipped', reason: 'missing-api-key' }
    }

    const fromAddress =
      process.env.RESEND_FROM_ADDRESS?.trim() || DEFAULT_FROM

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Welcome to ${payload.packageName}`,
      react: WellnessPackageWelcomeEmail(payload),
    })

    if (error) throw new Error(error.message)
    return { status: 'sent', id: data?.id ?? null }
  }
}
