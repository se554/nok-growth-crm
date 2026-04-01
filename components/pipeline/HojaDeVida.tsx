'use client'

import { formatDistanceToNow, format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import { Download } from 'lucide-react'
import type { LeadEvento, Estado } from '@/lib/types'
import { EVENTO_ICONS, EVENTO_LABELS, ESTADO_STYLES } from '@/lib/types'

interface Props {
  eventos: LeadEvento[]
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HojaDeVida({ eventos }: Props) {
  if (!eventos.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin eventos registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {eventos.map((evento, i) => {
        const vencimiento = evento.metadata?.fecha_vencimiento
          ? new Date(evento.metadata.fecha_vencimiento)
          : null
        const vencido = vencimiento ? isPast(vencimiento) && !isToday(vencimiento) : false
        const hoy = vencimiento ? isToday(vencimiento) : false

        return (
          <div key={evento.id} className="flex gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] shrink-0"
                style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)' }}>
                {EVENTO_ICONS[evento.tipo]}
              </div>
              {i < eventos.length - 1 && (
                <div className="w-px flex-1 mt-1 min-h-[12px]" style={{ background: 'var(--border-mid)' }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {EVENTO_LABELS[evento.tipo]}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {formatDistanceToNow(new Date(evento.fecha), { addSuffix: true, locale: es })}
                </span>
              </div>

              {/* Estado change */}
              {evento.tipo === 'estado_cambiado' && evento.estado_anterior && evento.estado_nuevo && (
                <div className="flex items-center gap-1.5 mb-1">
                  {(() => {
                    const sA = ESTADO_STYLES[evento.estado_anterior] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:evento.estado_anterior }
                    const sN = ESTADO_STYLES[evento.estado_nuevo] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:evento.estado_nuevo }
                    return <>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sA.bg, sA.text, sA.border)}>{sA.label}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>→</span>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sN.bg, sN.text, sN.border)}>{sN.label}</span>
                    </>
                  })()}
                </div>
              )}

              {/* Vencimiento badge */}
              {vencimiento && (
                <div className="mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={
                      hoy    ? { background: 'rgba(217,119,6,0.15)', color: '#D97706', border: '1px solid rgba(217,119,6,0.3)' } :
                      vencido ? { background: 'rgba(242,0,34,0.12)', color: '#f87171', border: '1px solid rgba(242,0,34,0.25)' } :
                               { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                    }>
                    {hoy ? '⏰ Vence hoy' : vencido
                      ? `⚠️ Venció ${format(vencimiento, "d MMM", { locale: es })}`
                      : `📅 Vence ${format(vencimiento, "d MMM", { locale: es })}`}
                  </span>
                </div>
              )}

              <p className="text-[13px] leading-snug" style={{ color: 'var(--text-primary)' }}>
                {evento.descripcion}
              </p>

              {/* Documento adjunto */}
              {evento.tipo === 'documento_adjunto' && evento.metadata?.doc_url && (
                <a
                  href={evento.metadata.doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    color: 'var(--gold)',
                    border: '1px solid var(--gold-mid)',
                    background: 'var(--gold-dim)',
                  }}
                >
                  <Download size={11} />
                  {evento.metadata.doc_nombre ?? 'Descargar'}
                  {evento.metadata.doc_tamano ? ` · ${formatBytes(evento.metadata.doc_tamano)}` : ''}
                </a>
              )}

              {evento.autor && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{evento.autor}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
