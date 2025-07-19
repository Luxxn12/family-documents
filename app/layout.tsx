import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Family Documents',
  description: 'Sistem pengelolaan dokumen keluarga',
  generator: 'CodeWithAlif',
  icons: {
    icon: "/logo-doc.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
