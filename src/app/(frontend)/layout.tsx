import React from 'react'
import './styles.css'
import { Providers } from '@/components/providers'
import { Geist_Mono, Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata = {
  description: 'Rent, generator, diesel and expense overview for your buildings',
  title: 'Building dashboard',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${geistMono.variable} min-h-dvh bg-background font-sans antialiased`}>
        <Providers>
          <main className="min-h-dvh">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
