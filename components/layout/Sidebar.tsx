'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Kanban, BarChart2, Users, Clock, LogOut, BookMarked } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'
import { format, isToday, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { EVENTO_ICONS } from '@/lib/types'
import type { TipoEvento } from '@/lib/types'

const nav = [
  { href: '/pipeline',     label: 'Pipeline',       icon: Kanban      },
  { href: '/tareas',       label: 'Recordatorios',  icon: BookMarked  },
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
    const interval = setInterval(cargarTareas, 60000)

    // Escuchar cuando se completa/descompleta una tarea desde la página de tareas
    const handleTareaUpdate = () => cargarTareas()
    window.addEventListener('tareas-updated', handleTareaUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('tareas-updated', handleTareaUpdate)
    }
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
    const vencido = isPast(venc) && !hoy
    return (
      <Link key={t.id} href={`/pipeline?lead=${t.lead_id}`}
        className="group flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
        <span className="text-[12px] mt-0.5 shrink-0 opacity-70">{EVENTO_ICONS[t.tipo] ?? '📌'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium truncate leading-tight" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>{t.lead_nombre}</p>
          <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.descripcion}</p>
          <p className={clsx('text-[9px] font-semibold mt-0.5 tracking-wide uppercase',
            hoy ? 'text-amber-400' : vencido ? 'text-red-400' : 'text-emerald-400'
          )}>
            {hoy ? 'Hoy' : format(venc, "d MMM", { locale: es })}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="px-6 pt-7 pb-5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nok_blanco.png" alt="NOK" style={{ width: '100px', height: 'auto' }} />
        <div className="text-[9px] font-semibold tracking-[0.22em] uppercase mt-1.5"
          style={{ color: 'var(--gold)' }}>
          Growth CRM
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-0.5 shrink-0">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const esTareas = href === '/tareas'
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 relative',
                active ? 'font-medium' : 'hover:bg-white/5'
              )}
              style={active
                ? { background: 'var(--gold-dim)', color: 'var(--gold)', borderLeft: '2px solid var(--gold)' }
                : { color: 'var(--text-muted)', borderLeft: '2px solid transparent' }
              }
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span className="flex-1">{label}</span>
              {esTareas && urgentes.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: 'var(--danger)', color: 'white' }}>
                  {urgentes.length}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Urgentes */}
      {urgentes.length > 0 && (
        <div className="px-3 pb-2 shrink-0">
          <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[9px] font-semibold tracking-[0.18em] uppercase px-3 mb-1.5" style={{ color: 'var(--danger)' }}>
              Urgentes · {urgentes.length}
            </p>
            {urgentes.slice(0, 3).map(renderItem)}
            {urgentes.length > 3 && (
              <Link href="/tareas" className="block text-[10px] px-3 mt-1 transition-colors" style={{ color: 'var(--text-dim)' }}>
                +{urgentes.length - 3} más →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Próximas */}
      {proximas.length > 0 && (
        <div className="px-3 pb-3 shrink-0">
          <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[9px] font-semibold tracking-[0.18em] uppercase px-3 mb-1.5" style={{ color: '#34d399' }}>
              Próximas · {proximas.length}
            </p>
            {proximas.slice(0, 3).map(renderItem)}
            {proximas.length > 3 && (
              <Link href="/tareas" className="block text-[10px] px-3 mt-1" style={{ color: 'var(--text-dim)' }}>
                +{proximas.length - 3} más →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-4 py-4 mt-auto shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {userEmail && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
              style={{ background: 'var(--gold)', color: '#1D1D1B' }}>
              {initials}
            </div>
            <p className="text-[11px] truncate flex-1" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] transition-colors w-full"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
