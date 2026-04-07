'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Clock, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'
import { format, isToday, isPast, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import { ESTADO_STYLES, ESTADOS_ORDEN, EVENTO_ICONS, EVENTO_LABELS } from '@/lib/types'
import type { Estado, TipoEvento } from '@/lib/types'

interface Tarea {
  id: string
  lead_id: string
  lead_nombre: string
  lead_estado: string
  lead_propiedad: string
  tipo: TipoEvento
  descripcion: string
  fecha_creacion: string
  fecha_vencimiento: string | null
  completado: boolean
  completado_en: string | null
}

type Grupo = 'vencida' | 'hoy' | 'semana' | 'proxima' | 'sin_fecha'

function clasificar(t: Tarea): Grupo {
  if (!t.fecha_vencimiento) return 'sin_fecha'
  const d = new Date(t.fecha_vencimiento)
  if (isToday(d)) return 'hoy'
  if (isPast(d)) return 'vencida'
  if (isThisWeek(d, { weekStartsOn: 1 })) return 'semana'
  return 'proxima'
}

const GRUPOS: { key: Grupo; label: string; color: string; dotColor: string }[] = [
  { key: 'vencida',   label: 'Vencidas',    color: '#f87171', dotColor: '#F20022' },
  { key: 'hoy',       label: 'Hoy',         color: '#D97706', dotColor: '#D97706' },
  { key: 'semana',    label: 'Esta semana', color: '#60a5fa', dotColor: '#3b82f6' },
  { key: 'proxima',   label: 'Próximas',    color: '#34d399', dotColor: '#10b981' },
  { key: 'sin_fecha', label: 'Sin fecha',   color: 'var(--text-dim)', dotColor: 'var(--text-dim)' },
]

const TIPOS_CON_RECORDATORIO: TipoEvento[] = [
  'llamada','whatsapp','email','reunion','propuesta_enviada','contrato','nota','tarea'
]

function TareaCard({ tarea, onClick, onToggle }: { tarea: Tarea; onClick: () => void; onToggle: () => void }) {
  const grupo = clasificar(tarea)
  const estado = ESTADO_STYLES[tarea.lead_estado] ?? ESTADO_STYLES['prospecto']
  const venc = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento) : null

  const borderColor = tarea.completado ? 'rgba(52,211,153,0.2)' :
                      grupo === 'vencida' ? 'rgba(242,0,34,0.2)' :
                      grupo === 'hoy' ? 'rgba(217,119,6,0.25)' : 'var(--border)'
  const borderLeft = tarea.completado ? '2px solid #34d399' :
                     grupo === 'vencida' ? '2px solid #F20022' :
                     grupo === 'hoy' ? '2px solid #D97706' : '2px solid transparent'

  return (
    <div
      className="rounded-xl p-4 transition-all card-hover"
      style={{
        background: 'var(--surface-el)',
        border: `1px solid ${borderColor}`,
        borderLeft,
        opacity: tarea.completado ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="mt-0.5 shrink-0 transition-all"
          style={{ color: tarea.completado ? '#34d399' : 'var(--text-dim)' }}
          onMouseEnter={e => { if (!tarea.completado) e.currentTarget.style.color = 'var(--gold)' }}
          onMouseLeave={e => { if (!tarea.completado) e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          {tarea.completado ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[12px]">{EVENTO_ICONS[tarea.tipo]}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{EVENTO_LABELS[tarea.tipo]}</span>
              </div>
              <p className={clsx('text-[13px] font-medium truncate', tarea.completado && 'line-through')}
                style={{ color: 'var(--text-primary)' }}>
                {tarea.lead_nombre}
              </p>
              {tarea.lead_propiedad && (
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{tarea.lead_propiedad}</p>
              )}
            </div>
            <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border shrink-0', estado.bg, estado.text, estado.border)}>
              {estado.label}
            </span>
          </div>

          <p className={clsx('text-[12px] leading-snug mb-2', tarea.completado && 'line-through')}
            style={{ color: tarea.completado ? 'var(--text-dim)' : 'var(--text-primary)' }}>
            {tarea.descripcion}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={11} style={{
                color: tarea.completado ? '#34d399' :
                       grupo === 'vencida' ? '#f87171' :
                       grupo === 'hoy' ? '#D97706' : 'var(--text-dim)'
              }} />
              <span className="text-[11px] font-medium" style={{
                color: tarea.completado ? '#34d399' :
                       grupo === 'vencida' ? '#f87171' :
                       grupo === 'hoy' ? '#D97706' : 'var(--text-dim)'
              }}>
                {tarea.completado ? 'Completada' :
                 !venc ? 'Sin fecha' :
                 grupo === 'hoy' ? 'Hoy' :
                 grupo === 'vencida' ? `Venció ${format(venc, "d MMM", { locale: es })}` :
                 format(venc, "d 'de' MMM yyyy", { locale: es })}
              </span>
            </div>
            {tarea.completado && tarea.completado_en && (
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {format(new Date(tarea.completado_en), "d MMM HH:mm", { locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TareasPage() {
  const router = useRouter()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<Estado | ''>('')
  const [filterTipo, setFilterTipo] = useState<TipoEvento | ''>('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  const cargar = useCallback(() => {
    fetch('/api/tareas')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTareas(data); setLoading(false) })
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 15000)
    const handler = () => cargar()
    window.addEventListener('tareas-updated', handler)
    window.addEventListener('focus', handler)
    return () => {
      clearInterval(interval)
      window.removeEventListener('tareas-updated', handler)
      window.removeEventListener('focus', handler)
    }
  }, [cargar])

  const toggleTarea = async (id: string, completado: boolean) => {
    setToggling(prev => new Set(prev).add(id))
    // Optimistic update
    setTareas(prev => prev.map(t =>
      t.id === id ? { ...t, completado: !completado, completado_en: !completado ? new Date().toISOString() : null } : t
    ))
    await fetch(`/api/tareas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completado: !completado }),
    })
    setToggling(prev => { const n = new Set(prev); n.delete(id); return n })
    // Notificar al sidebar para que actualice pendientes
    window.dispatchEvent(new Event('tareas-updated'))
  }

  const pendientes = tareas.filter(t => !t.completado)
  const completadas = tareas.filter(t => t.completado)

  const filtered = pendientes
    .filter(t => filterEstado ? t.lead_estado === filterEstado : true)
    .filter(t => filterTipo   ? t.tipo === filterTipo           : true)

  const filteredCompleted = completadas
    .filter(t => filterEstado ? t.lead_estado === filterEstado : true)
    .filter(t => filterTipo   ? t.tipo === filterTipo           : true)
    .sort((a, b) => {
      const da = a.completado_en ? new Date(a.completado_en).getTime() : 0
      const db = b.completado_en ? new Date(b.completado_en).getTime() : 0
      return db - da
    })

  const grouped = GRUPOS.map(g => ({
    ...g,
    items: filtered.filter(t => clasificar(t) === g.key),
  })).filter(g => g.items.length > 0)

  const totalUrgentes = pendientes.filter(t => {
    const g = clasificar(t); return g === 'vencida' || g === 'hoy'
  }).length

  const countByEstado = ESTADOS_ORDEN.reduce((acc, e) => {
    acc[e] = pendientes.filter(t => t.lead_estado === e).length
    return acc
  }, {} as Record<string, number>)

  const countByTipo = TIPOS_CON_RECORDATORIO.reduce((acc, t) => {
    acc[t] = pendientes.filter(r => r.tipo === t).length
    return acc
  }, {} as Record<string, number>)

  const pillBase: React.CSSProperties = {
    fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
    border: '1px solid var(--border-mid)', background: 'transparent',
    color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
  }
  const pillActive: React.CSSProperties = {
    background: 'var(--gold-dim)', border: '1px solid var(--gold-mid)', color: 'var(--gold)',
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Recordatorios</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            {completadas.length > 0 && (
              <span className="ml-1" style={{ color: 'var(--text-dim)' }}>
                · {completadas.length} completada{completadas.length !== 1 ? 's' : ''}
              </span>
            )}
            {totalUrgentes > 0 && !filterEstado && !filterTipo && (
              <span className="ml-2 font-medium" style={{ color: 'var(--danger)' }}>
                · {totalUrgentes} urgente{totalUrgentes !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button onClick={cargar}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filtro por tipo */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-dim)' }}>
          Tipo de actividad
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterTipo('')}
            style={filterTipo === '' ? { ...pillBase, ...pillActive } : pillBase}>
            Todos · {pendientes.length}
          </button>
          {TIPOS_CON_RECORDATORIO.filter(t => countByTipo[t] > 0).map(t => (
            <button key={t} onClick={() => setFilterTipo(t)}
              style={filterTipo === t ? { ...pillBase, ...pillActive } : pillBase}>
              {EVENTO_ICONS[t]} {EVENTO_LABELS[t]} · {countByTipo[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por estado */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-dim)' }}>
          Estado del lead
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterEstado('')}
            style={filterEstado === '' ? { ...pillBase, ...pillActive } : pillBase}>
            Todos
          </button>
          {ESTADOS_ORDEN.filter(e => countByEstado[e] > 0).map(e => {
            const s = ESTADO_STYLES[e]
            return (
              <button key={e} onClick={() => setFilterEstado(e)}
                className={filterEstado === e ? clsx(s.bg, s.text, s.border) : ''}
                style={filterEstado === e ? { ...pillBase, border: undefined } : pillBase}>
                {s.label} · {countByEstado[e]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pendientes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
              <div className="h-3 rounded w-32 mb-2" style={{ background: 'var(--surface-hi)' }} />
              <div className="h-4 rounded w-full mb-1" style={{ background: 'var(--surface-hi)' }} />
              <div className="h-3 rounded w-24" style={{ background: 'var(--surface-hi)' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && filteredCompleted.length === 0 ? (
        <div className="text-center py-16 text-[13px]" style={{ color: 'var(--text-muted)' }}>
          No hay recordatorios con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(g => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.dotColor }} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: g.color }}>{g.label}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-hi)', color: 'var(--text-dim)' }}>
                  {g.items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.items.map(t => (
                  <TareaCard key={t.id} tarea={t}
                    onClick={() => router.push(`/pipeline?lead=${t.lead_id}`)}
                    onToggle={() => toggleTarea(t.id, t.completado)} />
                ))}
              </div>
            </div>
          ))}

          {/* Completadas */}
          {filteredCompleted.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 mb-3 transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showCompleted ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#34d399' }} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#34d399' }}>
                  Completadas
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-hi)', color: 'var(--text-dim)' }}>
                  {filteredCompleted.length}
                </span>
              </button>

              {showCompleted && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCompleted.map(t => (
                    <TareaCard key={t.id} tarea={t}
                      onClick={() => router.push(`/pipeline?lead=${t.lead_id}`)}
                      onToggle={() => toggleTarea(t.id, t.completado)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
