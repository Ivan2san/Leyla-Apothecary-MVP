import * as React from 'react'

type NewsletterWelcomeEmailProps = {
  name?: string | null
}

export function NewsletterWelcomeEmail({
  name,
}: NewsletterWelcomeEmailProps) {
  const greeting = name ? `Hi ${name.trim()},` : 'Hi there,'

  return (
    <div
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        backgroundColor: '#FDFBF8',
        padding: '32px',
        color: '#344E41',
        lineHeight: 1.5,
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ maxWidth: '640px', margin: '0 auto' }}
      >
        <tbody>
          <tr>
            <td>
              <p style={{ margin: '0 0 16px', color: '#A3B18A' }}>
                Leyla&apos;s Apothecary
              </p>
              <h1 style={{ fontFamily: 'Lora, serif', margin: '0 0 24px' }}>
                Welcome to The Apothecary Journal
              </h1>
              <p style={{ margin: '0 0 16px' }}>{greeting}</p>
              <p style={{ margin: '0 0 16px' }}>
                Thanks for inviting us into your inbox. Twice each month we
                share seasonal rituals, blending notes from the lab, and tips
                from Leyla&apos;s consultations so you can build a more grounded
                wellness practice.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                While you wait for the next issue, explore our herbal library or
                book a consultation to craft a formula made for your body.
              </p>
              <div
                style={{
                  margin: '32px 0',
                  textAlign: 'center',
                }}
              >
                <a
                  href="https://leylas-apothecary.com/products"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#D98C4A',
                    color: '#FDFBF8',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Browse Herbal Tinctures
                </a>
              </div>
              <p style={{ margin: '0 0 8px', color: '#A3B18A' }}>
                — Leyla &amp; the Apothecary team
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#6B7280' }}>
                You&apos;re receiving this email because you subscribed on
                leylas-apothecary.com. If this wasn&apos;t you, simply ignore
                this welcome message.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
