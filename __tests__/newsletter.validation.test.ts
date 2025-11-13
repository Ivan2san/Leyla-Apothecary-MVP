import { newsletterSubscribeSchema } from '@/lib/validations/newsletter'

describe('UNIT: newsletterSubscribeSchema', () => {
  it('accepts valid email and optional name', () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: 'herbalist@example.com',
      name: 'Leyla',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: 'not-an-email',
    })

    expect(result.success).toBe(false)
  })

  it('trims empty optional name values', () => {
    const result = newsletterSubscribeSchema.parse({
      email: 'guest@example.com',
      name: '',
    })

    expect(result.name).toBeUndefined()
  })
})
