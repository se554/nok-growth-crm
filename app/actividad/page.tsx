'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import type { LeadEvento, TipoEvento } from '@/lib/types'
import { EVENTO_ICONS, EVENTO_LABELS, ESTADO_STYLES } from '@/lib/types'

interface EventoConLead extends LeadEvento {
  lead_nombre: string
  lead_id: string
}

function agruparPorFecha(eventos: EventoConLead[]) {
  const grupos: Record<string, EventoConLead[]> = {}
  for (const e of eventos) {
    const fecha = new Date(e.fecha)
    let label = format(fecha, 'dd MMM yyyy', { locale: es })
    if (isToday(fecha)) label = 'Hoy'
    else if (isYesterday(fecha)) label = 'Ayer'
    else if (isThisWeek(fecha)) label = format(fecha, 'EEEE', { locale: es })
    if (!grupos[label]) grupos[label] = []
    grupos[label].push(e)
  }
  return grupos
}

export default function ActividadPage() {
  const [eventos, setEventos] = useState<EventoConLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTipo, setFilterTipo] = useState<TipoEvento | ''>('')

  useEffect(() => {
    fetch('/api/actividad').then(r => r.json()).then(data => {
      setEventos(data)
      setLoading(false)
    })
  }, [])

  const filtered = filterTipo ? eventos.filter(e => e.tipo === filterTipo) : eventos
  const grupos = agruparPorFecha(filtered)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Actividad</h1>
          <p className="text-[12px] text-[#6B6B6B]">Feed cronológico de todos los eventos</p>
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value as TipoEvento | '')}
          className="text-[12px] border border-[#E8E6E0] rounded-lg px-3 py-1.5 outline-none focus:border-[#C9A84C] bg-white text-[#1A1A1A]">
          <option value="">Todos los tipos</option>
          {(Object.keys(EVENTO_LABELS) as TipoEvento[]).map(t => (
            <option key={t} value={t}>{EVENTO_ICONS[t]} {EVENTO_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E6E0] p-4 flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#F5F3EE] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F5F3EE] rounded w-32" />
                <div className="h-4 bg-[#F5F3EE] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([fecha, evs]) => (
            <div key={fecha}>
              <p className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3">{fecha}</p>
              <div className="space-y-2">
                {evs.map(evento => (
                  <div key={evento.id} className="bg-white rounded-xl border border-[#E8E6E0] p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F3EE] flex items-center justify-center text-[14px] shrink-0">
                      {EVENTO_ICONS[evento.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{evento.lead_nombre}</span>
                          <span className="text-[11px] text-[#6B6B6B] shrink-0">{EVENTO_LABELS[evento.tipo]}</span>
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] shrink-0">
                          {format(new Date(evento.fecha), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                      {evento.tipo === 'estado_cambiado' && evento.estado_anterior && evento.estado_nuevo && (
                        <div className="flex items-center gap-1.5 mb-1">
                          {(() => {
                            const sA = ESTADO_STYLES[evento.estado_anterior as string] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:evento.estado_anterior }
                            const sN = ESTADO_STYLES[evento.estado_nuevo as string] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:evento.estado_nuevo }
                            return <>
                              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sA.bg, sA.text, sA.border)}>{sA.label}</span>
                              <span className="text-[#6B6B6B] text-[10px]">→</span>
                              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sN.bg, sN.text, sN.border)}>{sN.label}</span>
                            </>
                          })()}
                        </div>
                      )}
                      <p className="text-[12px] text-[#6B6B6B] leading-snug">{evento.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[13px] text-[#6B6B6B]">Sin actividad registrada.</div>
          )}
        </div>
      )}
    </div>
  )
}
