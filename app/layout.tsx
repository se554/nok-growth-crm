import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import ChatPanel from '@/components/layout/ChatPanel'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NOK Growth CRM',
  description: 'CRM interno de NOK Property Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} antialiased`}>
        <div className="flex h-screen overflow-hidden bg-nok-bg">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <ChatPanel />
        </div>
      </body>
    </html>
  )
}
