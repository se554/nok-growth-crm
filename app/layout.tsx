import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import ChatPanel from '@/components/layout/ChatPanel'

export const metadata: Metadata = {
  title: 'NOK Growth CRM',
  description: 'CRM interno de NOK Property Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
          <ChatPanel />
        </div>
      </body>
    </html>
  )
}
