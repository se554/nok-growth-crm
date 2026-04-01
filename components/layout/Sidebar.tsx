'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Kanban, BarChart2, Users, Clock, LogOut, CheckSquare } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/pipeline',     label: 'Pipeline',      icon: Kanban      },
  { href: '/tareas',       label: 'Tareas',         icon: CheckSquare },
  { href: '/analitica',    label: 'Analítica',      icon: BarChart2   },
  { href: '/propietarios', label: 'Propietarios',   icon: Users       },
  { href: '/actividad',    label: 'Actividad',      icon: Clock       },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [tareasUrgentes, setTareasUrgentes] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const cargarTareas = () => {
    fetch('/api/tareas/pendientes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTareasUrgentes(data.length) })
      .catch(() => {})
  }

  useEffect(() => {
    cargarTareas()
    const interval = setInterval(cargarTareas, 30000)
    return () => clearInterval(interval)
  }, [pathname])

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

      {/* Logo NOK */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nok_negro.png" alt="NOK" style={{ width: '160px', height: 'auto' }} />
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-2"
          style={{ color: '#d6a700' }}>
          Growth CRM
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const esTareas = href === '/tareas'
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
              <span className="flex-1">{label}</span>
              {esTareas && tareasUrgentes > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {tareasUrgentes}
                </span>
              )}
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
