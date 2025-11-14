import * as React from 'react'

type BookingConfirmationEmailProps = {
  name?: string | null
  type: string
  date: string
  time: string
  duration: number
  notes?: string | null
}

export function BookingConfirmationEmail({
  name,
  type,
  date,
  time,
  duration,
  notes,
}: BookingConfirmationEmailProps) {
  const friendlyName = name ? `Hi ${name},` : 'Hi there,'
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', padding: '32px', backgroundColor: '#FDFBF8' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '600px', margin: '0 auto', color: '#344E41' }}>
        <tbody>
          <tr>
            <td>
              <p style={{ color: '#A3B18A', letterSpacing: '0.3em', fontSize: '12px', textTransform: 'uppercase' }}>
                Leyla's Apothecary
              </p>
              <h1 style={{ fontFamily: 'Lora, serif', margin: '8px 0 16px' }}>
                Booking confirmed
              </h1>
              <p style={{ margin: '0 0 16px' }}>{friendlyName}</p>
              <p style={{ margin: '0 0 16px' }}>
                Your {type} consultation is confirmed for {formattedDate} at {time} ({duration} minutes).
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
                <p style={{ margin: 0, fontSize: '14px', color: '#4B5563' }}>
                  Please join a few minutes early and have any relevant health notes handy. If you need to make changes,
                  reply to this email at least 24 hours in advance.
                </p>
              </div>
              {notes && (
                <div
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Notes</p>
                  <p style={{ margin: 0, color: '#4B5563' }}>{notes}</p>
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
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
