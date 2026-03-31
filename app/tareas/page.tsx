'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Clock } from 'lucide-react'
import { format, isToday, isPast, isThisWeek, isFuture } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import { ESTADO_STYLES } from '@/lib/types'

interface Tarea {
  id: string
  lead_id: string
  lead_nombre: string
  lead_estado: string
  lead_propiedad: string
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
  { key: 'vencida', label: 'Vencidas',      color: 'text-red-600',   dot: 'bg-red-500'   },
  { key: 'hoy',     label: 'Hoy',           color: 'text-amber-600', dot: 'bg-amber-400' },
  { key: 'semana',  label: 'Esta semana',   color: 'text-blue-600',  dot: 'bg-blue-400'  },
  { key: 'proxima', label: 'Próximas',      color: 'text-green-600', dot: 'bg-green-400' },
  { key: 'sin_fecha', label: 'Sin fecha',   color: 'text-[#6B6B6B]', dot: 'bg-gray-300'  },
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
        <div className="min-w-0">
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
          grupo === 'hoy'     ? 'text-amber-400' :
          'text-[#6B6B6B]'
        )} />
        <span className={clsx(
          'text-[11px] font-medium',
          grupo === 'vencida' ? 'text-red-500' :
          grupo === 'hoy'     ? 'text-amber-600' :
          'text-[#6B6B6B]'
        )}>
          {!venc ? 'Sin fecha' :
           grupo === 'hoy' ? 'Hoy' :
           grupo === 'vencida' ? `Venció ${format(venc, "d MMM", { locale: es })}` :
           format(venc, "d MMM yyyy", { locale: es })}
        </span>
      </div>
    </div>
  )
}

export default function TareasPage() {
  const router = useRouter()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(() => {
    fetch('/api/tareas')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTareas(data); setLoading(false) })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const grouped = GRUPOS.map(g => ({
    ...g,
    items: tareas.filter(t => clasificar(t) === g.key),
  })).filter(g => g.items.length > 0)

  const totalPendientes = tareas.filter(t => {
    const g = clasificar(t)
    return g === 'vencida' || g === 'hoy'
  }).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Tareas</h1>
          <p className="text-[12px] text-[#6B6B6B]">
            {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} en total
            {totalPendientes > 0 && (
              <span className="ml-2 text-red-500 font-medium">· {totalPendientes} urgente{totalPendientes !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <button onClick={cargar}
          className="p-1.5 text-[#6B6B6B] hover:text-[#C9A84C] border border-[#E8E6E0] rounded-lg hover:bg-[#F5F3EE] transition-all">
          <RefreshCw size={14} />
        </button>
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
      ) : tareas.length === 0 ? (
        <div className="text-center py-16 text-[13px] text-[#6B6B6B]">
          No hay tareas registradas.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(g => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx('w-2 h-2 rounded-full', g.dot)} />
                <p className={clsx('text-[12px] font-semibold uppercase tracking-wide', g.color)}>
                  {g.label}
                </p>
                <span className="text-[11px] text-[#6B6B6B] bg-[#F5F3EE] px-2 py-0.5 rounded-full">
                  {g.items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.items.map(t => (
                  <TareaCard
                    key={t.id}
                    tarea={t}
                    onClick={() => router.push(`/pipeline?lead=${t.lead_id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
