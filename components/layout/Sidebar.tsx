'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Kanban, BarChart2, Users, Clock, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/pipeline',     label: 'Pipeline',      icon: Kanban    },
  { href: '/analitica',    label: 'Analítica',     icon: BarChart2 },
  { href: '/propietarios', label: 'Propietarios',  icon: Users     },
  { href: '/actividad',    label: 'Actividad',     icon: Clock     },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'NK'

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ backgroundColor: '#0b2922' }}>

      {/* Logo NOK inline SVG — viewBox recortado al área real del logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <svg viewBox="27 16 192 72" xmlns="http://www.w3.org/2000/svg" style={{ width: '170px', height: 'auto' }} fill="white">
          <g>
            <path d="M123.5,54.41v23.2h-13.1V56.22c0-4.43-1.66-6.62-4.96-6.62c-4.09,0-6.44,2.85-6.44,7.7V77.6h-13.1V39.56h9.19l1.8,3.92c2.83-3.16,7.06-5.05,11.98-5.05C117.69,38.44,123.5,44.71,123.5,54.41z"/>
            <path d="M129.12,58.58c0-11.79,8.93-20.27,21.33-20.27c12.36,0,21.33,8.48,21.33,20.27c0,11.75-8.97,20.27-21.33,20.27C138.04,78.85,129.12,70.33,129.12,58.58z M150.45,67.08c4.78,0,8.2-3.47,8.2-8.5c0-5-3.43-8.5-8.2-8.5s-8.2,3.47-8.2,8.5S145.67,67.08,150.45,67.08z"/>
            <path d="M201.03,77.6l-9.53-16.09V77.6h-13.1V25.82h13.1v28.64l9.06-14.9h14.71l-11.86,18.13l13.06,19.91H201.03z"/>
          </g>
          <path d="M50.19,33.51c0,0,0.01,0,0.01,0c6.85,0.01,12.4,5.43,12.4,12.12c0,4.25-2.25,7.98-5.64,10.14c-0.88,0.56-1.2,1.68-0.84,2.66l6.02,16.11c0.74,1.74-0.64,3.63-2.65,3.63H40.38c-2.08,0-3.46-2-2.6-3.75l6.7-15.92c0.42-1,0.08-2.18-0.84-2.76c-3.89-2.44-6.48-6.86-5.73-11.8C38.8,38.04,44.08,33.51,50.19,33.51 M50.21,26.51h-0.02c-9.54,0-17.79,7.04-19.21,16.38c-0.91,5.99,1.32,11.99,5.65,16.19l-5.25,12.49c-1.33,2.91-1.12,6.25,0.59,8.98c1.8,2.89,4.95,4.62,8.41,4.62h19.11c3.35,0,6.44-1.64,8.27-4.4c1.73-2.61,2.06-5.88,0.91-8.78l-4.79-12.83c3.6-3.53,5.73-8.39,5.73-13.54C69.61,35.1,60.9,26.52,50.21,26.51z"/>
        </svg>
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-1"
          style={{ color: '#d6a700' }}>
          Growth CRM
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150',
                active
                  ? 'text-white font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
              style={active ? { backgroundColor: 'rgba(214,167,0,0.15)', color: '#d6a700' } : {}}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        {userEmail && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-nok-green-dark"
              style={{ backgroundColor: '#d6a700' }}>
              {initials}
            </div>
            <p className="text-[11px] text-white/50 truncate flex-1">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
