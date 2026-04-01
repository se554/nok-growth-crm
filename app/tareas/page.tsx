'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Clock } from 'lucide-react'
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

function TareaCard({ tarea, onClick }: { tarea: Tarea; onClick: () => void }) {
  const grupo = clasificar(tarea)
  const estado = ESTADO_STYLES[tarea.lead_estado] ?? ESTADO_STYLES['prospecto']
  const venc = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento) : null

  const borderColor = grupo === 'vencida' ? 'rgba(242,0,34,0.2)' :
                      grupo === 'hoy' ? 'rgba(217,119,6,0.25)' : 'var(--border)'
  const borderLeft = grupo === 'vencida' ? '2px solid #F20022' :
                     grupo === 'hoy' ? '2px solid #D97706' : '2px solid transparent'

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-4 cursor-pointer transition-all card-hover"
      style={{ background: 'var(--surface-el)', border: `1px solid ${borderColor}`, borderLeft }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[12px]">{EVENTO_ICONS[tarea.tipo]}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{EVENTO_LABELS[tarea.tipo]}</span>
          </div>
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tarea.lead_nombre}</p>
          {tarea.lead_propiedad && (
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{tarea.lead_propiedad}</p>
          )}
        </div>
        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border shrink-0', estado.bg, estado.text, estado.border)}>
          {estado.label}
        </span>
      </div>

      <p className="text-[12px] leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>{tarea.descripcion}</p>

      <div className="flex items-center gap-1.5">
        <Clock size={11} style={{ color: grupo === 'vencida' ? '#f87171' : grupo === 'hoy' ? '#D97706' : 'var(--text-dim)' }} />
        <span className="text-[11px] font-medium" style={{
          color: grupo === 'vencida' ? '#f87171' : grupo === 'hoy' ? '#D97706' : 'var(--text-dim)'
        }}>
          {!venc ? 'Sin fecha' :
           grupo === 'hoy' ? 'Hoy' :
           grupo === 'vencida' ? `Venció ${format(venc, "d MMM", { locale: es })}` :
           format(venc, "d 'de' MMM yyyy", { locale: es })}
        </span>
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

  const cargar = useCallback(() => {
    fetch('/api/tareas')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTareas(data); setLoading(false) })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtered = tareas
    .filter(t => filterEstado ? t.lead_estado === filterEstado : true)
    .filter(t => filterTipo   ? t.tipo === filterTipo           : true)

  const grouped = GRUPOS.map(g => ({
    ...g,
    items: filtered.filter(t => clasificar(t) === g.key),
  })).filter(g => g.items.length > 0)

  const totalUrgentes = tareas.filter(t => {
    const g = clasificar(t); return g === 'vencida' || g === 'hoy'
  }).length

  const countByEstado = ESTADOS_ORDEN.reduce((acc, e) => {
    acc[e] = tareas.filter(t => t.lead_estado === e).length
    return acc
  }, {} as Record<string, number>)

  const countByTipo = TIPOS_CON_RECORDATORIO.reduce((acc, t) => {
    acc[t] = tareas.filter(r => r.tipo === t).length
    return acc
  }, {} as Record<string, number>)

  const pillBase: React.CSSProperties = {
    fontSize: '11px',
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid var(--border-mid)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
  const pillActive: React.CSSProperties = {
    background: 'var(--gold-dim)',
    border: '1px solid var(--gold-mid)',
    color: 'var(--gold)',
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Recordatorios</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} recordatorio{filtered.length !== 1 ? 's' : ''}
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
            Todos · {tareas.length}
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

      {/* Content */}
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
      ) : filtered.length === 0 ? (
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
                    onClick={() => router.push(`/pipeline?lead=${t.lead_id}`)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
