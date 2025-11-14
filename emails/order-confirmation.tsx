import * as React from 'react'

type OrderItem = {
  name: string
  quantity: number
  unitPrice: number
}

type Address = {
  fullName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

type OrderConfirmationEmailProps = {
  orderNumber: string
  createdAt: string
  items: OrderItem[]
  totals: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  shippingAddress?: Address | null
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

export function OrderConfirmationEmail({
  orderNumber,
  createdAt,
  items,
  totals,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        backgroundColor: '#FDFBF8',
        padding: '32px',
        color: '#344E41',
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
              <p style={{ margin: '0 0 12px', color: '#A3B18A' }}>
                Order Confirmation
              </p>
              <h1 style={{ fontFamily: 'Lora, serif', margin: '0 0 16px' }}>
                Thank you for your order
              </h1>
              <p style={{ margin: '0 0 8px' }}>
                Order <strong>#{orderNumber}</strong>
              </p>
              <p style={{ margin: '0 0 24px', color: '#6B7280' }}>
                Placed on{' '}
                {new Date(createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ marginBottom: '24px', borderCollapse: 'collapse' }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#E3E8E0', color: '#344E41' }}>
                    <th
                      align="left"
                      style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}
                    >
                      Item
                    </th>
                    <th
                      style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}
                      align="center"
                    >
                      Qty
                    </th>
                    <th
                      style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}
                      align="right"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={`${item.name}-${index}`}
                      style={{
                        borderBottom: '1px solid #E5E7EB',
                      }}
                    >
                      <td style={{ padding: '12px 0' }}>{item.name}</td>
                      <td style={{ padding: '12px 0' }} align="center">
                        {item.quantity}
                      </td>
                      <td style={{ padding: '12px 0' }} align="right">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  marginBottom: '24px',
                }}
              >
                <table width="100%" style={{ fontSize: 14 }}>
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td align="right">{formatCurrency(totals.subtotal)}</td>
                    </tr>
                    <tr>
                      <td>Shipping</td>
                      <td align="right">
                        {totals.shipping === 0
                          ? 'Free'
                          : formatCurrency(totals.shipping)}
                      </td>
                    </tr>
                    <tr>
                      <td>Tax</td>
                      <td align="right">{formatCurrency(totals.tax)}</td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: '12px',
                          fontWeight: 600,
                          borderTop: '1px solid #E5E7EB',
                        }}
                      >
                        Total
                      </td>
                      <td
                        align="right"
                        style={{
                          paddingTop: '12px',
                          fontWeight: 700,
                          borderTop: '1px solid #E5E7EB',
                        }}
                      >
                        {formatCurrency(totals.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {shippingAddress && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
                    Shipping to
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: '#4B5563' }}>
                    {shippingAddress.fullName}
                    <br />
                    {shippingAddress.addressLine1}
                    <br />
                    {shippingAddress.addressLine2 && (
                      <>
                        {shippingAddress.addressLine2}
                        <br />
                      </>
                    )}
                    {shippingAddress.city}, {shippingAddress.state}{' '}
                    {shippingAddress.zipCode}
                    <br />
                    {shippingAddress.country}
                  </p>
                </div>
              )}

              <p style={{ margin: '24px 0 0', fontSize: 12, color: '#6B7280' }}>
                Need help? Reply to this email or visit our support center for
                order updates.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
