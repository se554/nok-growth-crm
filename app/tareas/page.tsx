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

const GRUPOS: { key: Grupo; label: string; color: string; dot: string }[] = [
  { key: 'vencida',   label: 'Vencidas',     color: 'text-red-600',   dot: 'bg-red-500'   },
  { key: 'hoy',       label: 'Hoy',          color: 'text-amber-600', dot: 'bg-amber-400' },
  { key: 'semana',    label: 'Esta semana',  color: 'text-blue-600',  dot: 'bg-blue-400'  },
  { key: 'proxima',   label: 'Próximas',     color: 'text-green-600', dot: 'bg-green-400' },
  { key: 'sin_fecha', label: 'Sin fecha',    color: 'text-[#6B6B6B]', dot: 'bg-gray-300'  },
]

const TIPOS_CON_RECORDATORIO: TipoEvento[] = [
  'llamada','whatsapp','email','reunion','propuesta_enviada','contrato','nota','tarea'
]

function TareaCard({ tarea, onClick }: { tarea: Tarea; onClick: () => void }) {
  const grupo = clasificar(tarea)
  const estado = ESTADO_STYLES[tarea.lead_estado] ?? ESTADO_STYLES['prospecto']
  const venc = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento) : null

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all',
        grupo === 'vencida' ? 'border-red-200 hover:border-red-300' :
        grupo === 'hoy'     ? 'border-amber-200 hover:border-amber-300' :
        'border-[#E8E6E0] hover:border-[#C9A84C]'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px]">{EVENTO_ICONS[tarea.tipo]}</span>
            <span className="text-[11px] text-[#6B6B6B]">{EVENTO_LABELS[tarea.tipo]}</span>
          </div>
          <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{tarea.lead_nombre}</p>
          {tarea.lead_propiedad && (
            <p className="text-[11px] text-[#6B6B6B] truncate">{tarea.lead_propiedad}</p>
          )}
        </div>
        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border shrink-0', estado.bg, estado.text, estado.border)}>
          {estado.label}
        </span>
      </div>

      <p className="text-[12px] text-[#1A1A1A] leading-snug mb-2">{tarea.descripcion}</p>

      <div className="flex items-center gap-1.5">
        <Clock size={11} className={clsx(
          grupo === 'vencida' ? 'text-red-400' :
          grupo === 'hoy'     ? 'text-amber-400' : 'text-[#6B6B6B]'
        )} />
        <span className={clsx(
          'text-[11px] font-medium',
          grupo === 'vencida' ? 'text-red-500' :
          grupo === 'hoy'     ? 'text-amber-600' : 'text-[#6B6B6B]'
        )}>
          {!venc ? 'Sin fecha' :
           grupo === 'hoy'     ? 'Hoy' :
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Recordatorios</h1>
          <p className="text-[12px] text-[#6B6B6B]">
            {filtered.length} recordatorio{filtered.length !== 1 ? 's' : ''}
            {totalUrgentes > 0 && !filterEstado && !filterTipo && (
              <span className="ml-2 text-red-500 font-medium">· {totalUrgentes} urgente{totalUrgentes !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <button onClick={cargar}
          className="p-1.5 text-[#6B6B6B] hover:text-[#C9A84C] border border-[#E8E6E0] rounded-lg hover:bg-[#F5F3EE] transition-all">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filtro por tipo de evento */}
      <div>
        <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2">Tipo de actividad</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterTipo('')}
            className={clsx('text-[11px] px-2.5 py-1 rounded-full border transition-all',
              filterTipo === '' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E6E0] text-[#6B6B6B] hover:border-[#1A1A1A]'
            )}>
            Todos · {tareas.length}
          </button>
          {TIPOS_CON_RECORDATORIO.filter(t => countByTipo[t] > 0).map(t => (
            <button key={t} onClick={() => setFilterTipo(t)}
              className={clsx('flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-all',
                filterTipo === t ? 'bg-[#C9A84C] text-white border-[#C9A84C]' : 'border-[#E8E6E0] text-[#6B6B6B] hover:border-[#C9A84C]'
              )}>
              {EVENTO_ICONS[t]} {EVENTO_LABELS[t]} · {countByTipo[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por estado del lead */}
      <div>
        <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2">Estado del lead</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterEstado('')}
            className={clsx('text-[11px] px-2.5 py-1 rounded-full border transition-all',
              filterEstado === '' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E6E0] text-[#6B6B6B] hover:border-[#1A1A1A]'
            )}>
            Todos
          </button>
          {ESTADOS_ORDEN.filter(e => countByEstado[e] > 0).map(e => {
            const s = ESTADO_STYLES[e]
            return (
              <button key={e} onClick={() => setFilterEstado(e)}
                className={clsx('text-[11px] px-2.5 py-1 rounded-full border transition-all',
                  filterEstado === e ? `${s.bg} ${s.text} ${s.border} font-medium` : 'border-[#E8E6E0] text-[#6B6B6B] hover:border-[#C9A84C]'
                )}>
                {s.label} · {countByEstado[e]}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E6E0] p-4 animate-pulse">
              <div className="h-3 bg-[#F5F3EE] rounded w-32 mb-2" />
              <div className="h-4 bg-[#F5F3EE] rounded w-full mb-1" />
              <div className="h-3 bg-[#F5F3EE] rounded w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[13px] text-[#6B6B6B]">
          No hay recordatorios con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(g => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx('w-2 h-2 rounded-full', g.dot)} />
                <p className={clsx('text-[12px] font-semibold uppercase tracking-wide', g.color)}>{g.label}</p>
                <span className="text-[11px] text-[#6B6B6B] bg-[#F5F3EE] px-2 py-0.5 rounded-full">{g.items.length}</span>
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
