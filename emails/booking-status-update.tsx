import * as React from 'react'

type BookingStatusUpdateEmailProps = {
  name?: string | null
  type: string
  date: string
  time: string
  status: string
}

export function BookingStatusUpdateEmail({
  name,
  type,
  date,
  time,
  status,
}: BookingStatusUpdateEmailProps) {
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
                Booking status update
              </h1>
              <p style={{ margin: '0 0 16px' }}>{friendlyName}</p>
              <p style={{ margin: '0 0 16px' }}>
                Your {type} consultation on {formattedDate} at {time} is now{' '}
                <strong style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</strong>.
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                If you have any questions, just reply to this email and we’ll take care of it.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
