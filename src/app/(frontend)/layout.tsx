import React from 'react'
import './styles.css'
import { Providers } from '@/components/providers'

export const metadata = {
  description: 'A building management system',
  title: 'Building management system',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
