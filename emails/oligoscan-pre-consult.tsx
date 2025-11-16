import * as React from 'react'

type OligoscanPreConsultEmailProps = {
  name?: string | null
  appointmentDate: string
  appointmentTime: string
}

export function OligoscanPreConsultEmail({
  name,
  appointmentDate,
  appointmentTime,
}: OligoscanPreConsultEmailProps) {
  const friendlyGreeting = name ? `Hi ${name},` : 'Hi there,'
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        backgroundColor: '#FDFBF8',
        padding: '32px',
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ maxWidth: '600px', margin: '0 auto', color: '#1F2933' }}
      >
        <tbody>
          <tr>
            <td>
              <p
                style={{
                  color: '#C0755A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  fontSize: '11px',
                  marginBottom: '12px',
                }}
              >
                Leyla&apos;s Apothecary
              </p>
              <h1 style={{ fontFamily: 'Lora, serif', margin: '0 0 16px' }}>
                Your Oligoscan session
              </h1>
              <p style={{ margin: '0 0 12px' }}>{friendlyGreeting}</p>
              <p style={{ margin: '0 0 16px' }}>
                Looking forward to seeing you on <strong>{formattedDate}</strong> at{' '}
                <strong>{appointmentTime}</strong> for your Oligoscan assessment.
              </p>
              <div
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  marginBottom: '16px',
                }}
              >
                <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1F2933' }}>
                  Before you arrive
                </p>
                <ul style={{ paddingLeft: '18px', margin: 0, color: '#4B5563', fontSize: '14px' }}>
                  <li>Skip hand creams or oils on scan day so the sensor can read clearly.</li>
                  <li>Hydrate well — we&apos;re mapping intracellular minerals and hydration matters.</li>
                  <li>Bring any supplements or lab notes you want to discuss.</li>
                </ul>
              </div>
              <div
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  marginBottom: '16px',
                }}
              >
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>What to expect</p>
                <p style={{ margin: 0, color: '#4B5563', fontSize: '14px' }}>
                  The scan itself takes less than ten minutes. We interpret the intracellular mineral, vitamin,
                  and heavy metal readings together in-session, and I log your key findings plus next steps inside
                  your client dashboard within a few days — no PDFs required.
                </p>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '24px' }}>
                If you need to reschedule, reply to this email at least 24 hours ahead. Excited to dive in with
                you.
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                Warmly,<br />
                Leyla
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
