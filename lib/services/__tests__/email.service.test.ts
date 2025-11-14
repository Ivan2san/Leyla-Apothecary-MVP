import { EmailService } from '@/lib/services/email'

describe('UNIT: EmailService', () => {
  const originalKey = process.env.RESEND_API_KEY

  afterEach(() => {
    process.env.RESEND_API_KEY = originalKey
  })

  it('skips welcome email when API key is missing', async () => {
    delete process.env.RESEND_API_KEY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await EmailService.sendNewsletterWelcome({
      email: 'test@example.com',
    })

    expect(result.status).toBe('skipped')
    warnSpy.mockRestore()
  })

  it('skips order confirmation when API key is missing', async () => {
    delete process.env.RESEND_API_KEY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await EmailService.sendOrderConfirmation({
      email: 'test@example.com',
      orderNumber: 'LA-1234',
      createdAt: new Date().toISOString(),
      items: [],
      totals: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      },
      shippingAddress: null,
    })

    expect(result.status).toBe('skipped')
    warnSpy.mockRestore()
  })
})
