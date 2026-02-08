import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NCCart - Enterprise Multivendor E-commerce Platform',
  description: 'Zero Commission | Smart Delivery | Indian Compliance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
