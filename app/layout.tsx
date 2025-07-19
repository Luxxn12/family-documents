import type { Metadata } from 'next'
import { Lato } from 'next/font/google' // Import Lato font
import "./globals.css"

// Configure Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Specify weights to load
  variable: "--font-lato", // Optional: use as CSS variable if needed
})

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
      <body className={`${lato.className}`}>{children}</body>
    </html>
  )
}
