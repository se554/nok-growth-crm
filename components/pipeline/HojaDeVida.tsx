'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import type { LeadEvento, Estado } from '@/lib/types'
import { EVENTO_ICONS, EVENTO_LABELS, ESTADO_STYLES } from '@/lib/types'

interface Props {
  eventos: LeadEvento[]
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
      {eventos.map((evento, i) => (
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

            <p className="text-[13px] text-[#1A1A1A] leading-snug">{evento.descripcion}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">{evento.autor}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
