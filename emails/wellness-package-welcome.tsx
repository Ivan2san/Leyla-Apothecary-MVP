import * as React from 'react'
import type { SessionCreditLedger } from '@/lib/types/wellness-packages'

type WellnessPackageWelcomeProps = {
  name?: string | null
  packageName: string
  durationWeeks?: number
  credits: SessionCreditLedger
}

export function WellnessPackageWelcomeEmail({
  name,
  packageName,
  durationWeeks,
  credits,
}: WellnessPackageWelcomeProps) {
  const friendlyName = name ? `Hi ${name},` : 'Hi there,'

  return (
    <div
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        padding: '32px',
        backgroundColor: '#FDFBF8',
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ maxWidth: '640px', margin: '0 auto', color: '#344E41' }}
      >
        <tbody>
          <tr>
            <td>
              <p
                style={{
                  color: '#A3B18A',
                  letterSpacing: '0.3em',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Leyla&apos;s Apothecary
              </p>
              <h1 style={{ fontFamily: 'Lora, serif', margin: '8px 0 16px' }}>
                Welcome to {packageName}
              </h1>
              <p style={{ margin: '0 0 16px' }}>{friendlyName}</p>
              <p style={{ margin: '0 0 16px' }}>
                Your wellness package enrolment is confirmed. Over the next{' '}
                {durationWeeks ?? 6} weeks we&apos;ll guide you through a
                structured reset including consults, guided nervous system resets,
                sauna sessions, and dietary support.
              </p>
              <div
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#1F2933',
                  }}
                >
                  Included sessions
                </p>
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ fontSize: '14px', color: '#4B5563' }}
                >
                  <tbody>
                    {Object.entries(credits).map(([session, entry]) => (
                      <tr key={session}>
                        <td style={{ padding: '4px 0', textTransform: 'capitalize' }}>
                          {session.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>
                          {entry.included} included
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '12px' }}>
                Next steps:
              </p>
              <ol
                style={{
                  margin: '0 0 16px 20px',
                  padding: 0,
                  fontSize: '14px',
                  color: '#4B5563',
                }}
              >
                <li>Book your package initial consult to kick things off</li>
                <li>Schedule the first meditation + sauna sessions</li>
                <li>Save this email for a quick overview of what&apos;s included</li>
              </ol>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                We&apos;ll send a gentle reminder halfway through the program if any
                credits remain unused. Reply to this email anytime if you need help
                booking your sessions.
              </p>
              <p style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280' }}>
                Warmly,<br />
                Leyla &amp; the Apothecary team
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
