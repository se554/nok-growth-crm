'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
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

  const cargar = useCallback(() => {
    fetch('/api/actividad').then(r => r.json()).then(data => {
      setEventos(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filterTipo ? eventos.filter(e => e.tipo === filterTipo) : eventos
  const grupos = agruparPorFecha(filtered)

  const selectStyle: React.CSSProperties = {
    fontSize: '12px',
    border: '1px solid var(--border-mid)',
    borderRadius: '8px',
    padding: '6px 12px',
    outline: 'none',
    background: 'var(--surface-el)',
    color: 'var(--text-primary)',
    colorScheme: 'dark',
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Actividad</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Feed cronológico de todos los eventos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargar}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <RefreshCw size={14} />
          </button>
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value as TipoEvento | '')}
            style={selectStyle}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
          >
            <option value="">Todos los tipos</option>
            {(Object.keys(EVENTO_LABELS) as TipoEvento[]).map(t => (
              <option key={t} value={t}>{EVENTO_ICONS[t]} {EVENTO_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-xl p-4 flex gap-3 animate-pulse"
              style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'var(--surface-hi)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-32" style={{ background: 'var(--surface-hi)' }} />
                <div className="h-4 rounded w-full" style={{ background: 'var(--surface-hi)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([fecha, evs]) => (
            <div key={fecha}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                style={{ color: 'var(--text-dim)' }}>
                {fecha}
              </p>
              <div className="space-y-2">
                {evs.map(evento => (
                  <div key={evento.id} className="rounded-xl p-4 flex gap-3"
                    style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] shrink-0"
                      style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)' }}>
                      {EVENTO_ICONS[evento.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {evento.lead_nombre}
                          </span>
                          <span className="text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                            {EVENTO_LABELS[evento.tipo]}
                          </span>
                        </div>
                        <span className="text-[11px] shrink-0" style={{ color: 'var(--text-dim)' }}>
                          {format(new Date(evento.fecha), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                      {evento.tipo === 'estado_cambiado' && evento.estado_anterior && evento.estado_nuevo && (
                        <div className="flex items-center gap-1.5 mb-1">
                          {(() => {
                            const sA = ESTADO_STYLES[evento.estado_anterior as string] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:evento.estado_anterior }
                            const sN = ESTADO_STYLES[evento.estado_nuevo as string] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:evento.estado_nuevo }
                            return <>
                              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sA.bg, sA.text, sA.border)}>{sA.label}</span>
                              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>→</span>
                              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sN.bg, sN.text, sN.border)}>{sN.label}</span>
                            </>
                          })()}
                        </div>
                      )}
                      <p className="text-[12px] leading-snug" style={{ color: 'var(--text-muted)' }}>{evento.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Sin actividad registrada.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
