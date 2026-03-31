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
        <p className="text-[13px] text-[#6B6B6B]">Sin eventos registrados aún.</p>
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
            {/* Línea de tiempo */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#F5F3EE] border border-[#E8E6E0] flex items-center justify-center text-[14px] shrink-0">
                {EVENTO_ICONS[evento.tipo]}
              </div>
              {i < eventos.length - 1 && (
                <div className="w-px flex-1 bg-[#E8E6E0] mt-1 min-h-[12px]" />
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-3">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-[#6B6B6B]">
                  {EVENTO_LABELS[evento.tipo]}
                </span>
                <span className="text-[11px] text-[#6B6B6B]">
                  {formatDistanceToNow(new Date(evento.fecha), { addSuffix: true, locale: es })}
                </span>
              </div>

              {/* Cambio de estado */}
              {evento.tipo === 'estado_cambiado' && evento.estado_anterior && evento.estado_nuevo && (
                <div className="flex items-center gap-1.5 mb-1">
                  {(() => {
                    const sA = ESTADO_STYLES[evento.estado_anterior] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:evento.estado_anterior }
                    const sN = ESTADO_STYLES[evento.estado_nuevo] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:evento.estado_nuevo }
                    return <>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sA.bg, sA.text, sA.border)}>{sA.label}</span>
                      <span className="text-[#6B6B6B] text-[10px]">→</span>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', sN.bg, sN.text, sN.border)}>{sN.label}</span>
                    </>
                  })()}
                </div>
              )}

              {/* Badge fecha vencimiento para tareas */}
              {evento.tipo === 'tarea' && vencimiento && (
                <div className="mb-1">
                  <span className={clsx(
                    'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                    hoy ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    vencido ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  )}>
                    {hoy ? '⏰ Vence hoy' : vencido ? `⚠️ Venció ${format(vencimiento, "d MMM", { locale: es })}` : `📅 Vence ${format(vencimiento, "d MMM", { locale: es })}`}
                  </span>
                </div>
              )}

              <p className="text-[13px] text-[#1A1A1A] leading-snug">{evento.descripcion}</p>

              {/* Documento adjunto */}
              {evento.tipo === 'documento_adjunto' && evento.metadata?.doc_url && (
                <a
                  href={evento.metadata.doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-[#C9A84C] hover:text-[#b8963f] border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-2.5 py-1 rounded-lg transition-all"
                >
                  <Download size={11} />
                  {evento.metadata.doc_nombre ?? 'Descargar'}
                  {evento.metadata.doc_tamano ? ` · ${formatBytes(evento.metadata.doc_tamano)}` : ''}
                </a>
              )}

              <p className="text-[11px] text-[#6B6B6B] mt-0.5">{evento.autor}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
