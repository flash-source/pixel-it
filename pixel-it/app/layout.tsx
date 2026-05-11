import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'pixel.it — pixel art, your way',
  description: 'Draw it. Convert it. Become it. Real pixel art tools that actually work.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#08080f] antialiased">{children}</body>
    </html>
  )
}