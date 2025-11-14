import * as React from 'react'
import { formatPrice } from '@/lib/utils'

type OrderStatusUpdateEmailProps = {
  orderNumber: string
  status: string
  total: number
}

export function OrderStatusUpdateEmail({
  orderNumber,
  status,
  total,
}: OrderStatusUpdateEmailProps) {
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
                Order update
              </h1>
              <p style={{ margin: '0 0 16px' }}>
                Order <strong>{orderNumber}</strong> is now{' '}
                <strong style={{ textTransform: 'capitalize' }}>{status}</strong>.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Current total: {formatPrice(total)}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                You’ll receive another email once there are further changes. Thank you for shopping with us!
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
