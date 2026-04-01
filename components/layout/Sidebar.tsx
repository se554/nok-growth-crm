'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Kanban, BarChart2, Users, Clock, LogOut, CheckSquare } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { EVENTO_ICONS } from '@/lib/types'
import type { TipoEvento } from '@/lib/types'

const nav = [
  { href: '/pipeline',     label: 'Pipeline',       icon: Kanban      },
  { href: '/tareas',       label: 'Recordatorios',  icon: CheckSquare },
  { href: '/analitica',    label: 'Analítica',       icon: BarChart2   },
  { href: '/propietarios', label: 'Propietarios',    icon: Users       },
  { href: '/actividad',    label: 'Actividad',       icon: Clock       },
]

interface ItemPendiente {
  id: string
  lead_id: string
  lead_nombre: string
  tipo: TipoEvento
  descripcion: string
  fecha_vencimiento: string
  urgente?: boolean
  proxima?: boolean
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [urgentes, setUrgentes] = useState<ItemPendiente[]>([])
  const [proximas, setProximas] = useState<ItemPendiente[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const cargarTareas = () => {
    fetch('/api/tareas/pendientes')
      .then(r => r.json())
      .then(data => {
        if (data?.urgentes) setUrgentes(data.urgentes)
        if (data?.proximas) setProximas(data.proximas)
      })
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

  const renderItem = (t: ItemPendiente) => {
    const venc = new Date(t.fecha_vencimiento)
    const hoy = isToday(venc)
    return (
      <Link key={t.id} href={`/pipeline?lead=${t.lead_id}`}
        className="block px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all">
        <div className="flex items-start gap-1.5">
          <span className="text-[11px] mt-0.5 shrink-0">{EVENTO_ICONS[t.tipo] ?? '📌'}</span>
          <div className="min-w-0">
            <p className="text-[11px] text-white/70 truncate leading-tight">{t.lead_nombre}</p>
            <p className="text-[10px] text-white/40 truncate leading-tight">{t.descripcion}</p>
            <p className={clsx('text-[9px] font-medium mt-0.5',
              t.urgente ? (hoy ? 'text-amber-400' : 'text-red-400') : 'text-green-400'
            )}>
              {hoy ? 'Hoy' : format(venc, "d MMM", { locale: es })}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{ backgroundColor: '#0b2922' }}>

      {/* Logo NOK */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nok_negro.png" alt="NOK" style={{ width: '160px', height: 'auto' }} />
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-2"
          style={{ color: '#d6a700' }}>
          Growth CRM
        </p>
      </div>

      {/* Nav */}
      <nav className="px-3 py-5 space-y-0.5 shrink-0">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const esTareas = href === '/tareas'
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150',
                active ? 'text-white font-medium' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
              style={active ? { backgroundColor: 'rgba(214,167,0,0.15)', color: '#d6a700' } : {}}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.5} />
              <span className="flex-1">{label}</span>
              {esTareas && urgentes.length > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {urgentes.length}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Pendientes hoy / vencidos */}
      {urgentes.length > 0 && (
        <div className="px-3 pb-3 shrink-0">
          <div className="border-t border-white/10 pt-3">
            <p className="text-[9px] font-semibold tracking-[0.15em] uppercase px-2 mb-1.5 text-red-400">
              ⚠ Urgentes · {urgentes.length}
            </p>
            {urgentes.slice(0, 4).map(renderItem)}
            {urgentes.length > 4 && (
              <Link href="/tareas" className="block text-[10px] text-white/30 hover:text-white/50 px-2 mt-1">
                +{urgentes.length - 4} más →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Próximas (7 días) */}
      {proximas.length > 0 && (
        <div className="px-3 pb-3 shrink-0">
          <div className="border-t border-white/10 pt-3">
            <p className="text-[9px] font-semibold tracking-[0.15em] uppercase px-2 mb-1.5 text-green-400">
              📅 Próximas · {proximas.length}
            </p>
            {proximas.slice(0, 3).map(renderItem)}
            {proximas.length > 3 && (
              <Link href="/tareas" className="block text-[10px] text-white/30 hover:text-white/50 px-2 mt-1">
                +{proximas.length - 3} más →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Usuario + Logout */}
      <div className="px-4 py-4 border-t border-white/10 mt-auto shrink-0">
        {userEmail && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
              style={{ backgroundColor: '#d6a700', color: '#0b2922' }}>
              {initials}
            </div>
            <p className="text-[11px] text-white/50 truncate flex-1">{userEmail}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-red-400 transition-colors w-full">
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
