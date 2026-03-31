'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Kanban, BarChart2, Users, Clock, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'
import { format, isToday, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

const nav = [
  { href: '/pipeline',     label: 'Pipeline',      icon: Kanban    },
  { href: '/analitica',    label: 'Analítica',     icon: BarChart2 },
  { href: '/propietarios', label: 'Propietarios',  icon: Users     },
  { href: '/actividad',    label: 'Actividad',     icon: Clock     },
]

interface TareaPendiente {
  id: string
  lead_id: string
  lead_nombre: string
  descripcion: string
  fecha_vencimiento: string | null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [tareas, setTareas] = useState<TareaPendiente[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const cargarTareas = () => {
    fetch('/api/tareas/pendientes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTareas(data) })
      .catch(() => {})
  }

  useEffect(() => {
    cargarTareas()
    const interval = setInterval(cargarTareas, 60000)
    return () => clearInterval(interval)
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
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
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

        {/* Widget tareas pendientes */}
        {tareas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[9px] font-semibold tracking-[0.15em] uppercase px-3 mb-2"
              style={{ color: '#d6a700' }}>
              ⏰ Pendientes ({tareas.length})
            </p>
            <div className="space-y-1">
              {tareas.slice(0, 5).map(t => {
                const venc = t.fecha_vencimiento ? new Date(t.fecha_vencimiento) : null
                const hoy = venc ? isToday(venc) : false
                const vencido = venc ? isPast(venc) && !hoy : false
                return (
                  <Link
                    key={t.id}
                    href={`/pipeline?lead=${t.lead_id}`}
                    className="block px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <p className="text-[11px] text-white/70 leading-tight truncate">{t.lead_nombre}</p>
                    <p className="text-[10px] text-white/40 leading-tight truncate mt-0.5">{t.descripcion}</p>
                    {venc && (
                      <p className={clsx(
                        'text-[9px] mt-0.5 font-medium',
                        hoy ? 'text-amber-400' : vencido ? 'text-red-400' : 'text-green-400'
                      )}>
                        {hoy ? 'Hoy' : format(venc, "d MMM", { locale: es })}
                      </p>
                    )}
                  </Link>
                )
              })}
              {tareas.length > 5 && (
                <p className="text-[10px] text-white/30 px-3">+{tareas.length - 5} más</p>
              )}
            </div>
          </div>
        )}
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
