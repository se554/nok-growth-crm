'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import type { LeadConActividad } from '@/lib/types'
import { PRIORIDAD_STYLES } from '@/lib/types'

interface Props {
  lead: LeadConActividad
  onClick: () => void
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getAlertStyle(dias: number, estado: string) {
  if (estado === 'cerrado' || estado === 'perdido') return ''
  if (dias >= 14) return 'border-l-2 border-l-red-400'
  if (dias >= 7) return 'border-l-2 border-l-amber-400'
  return ''
}

export default function DealCard({ lead, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dias = lead.dias_sin_contacto ?? 0
  const alertStyle = getAlertStyle(dias, lead.estado)
  const esUrgente = dias >= 14 && lead.estado !== 'cerrado' && lead.estado !== 'perdido'
  const prioridadStyle = lead.prioridad && lead.prioridad !== 'na' ? PRIORIDAD_STYLES[lead.prioridad] : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl p-3 cursor-pointer select-none',
        'border border-[#E8E6E0] hover:border-[#C9A84C] hover:shadow-sm',
        'transition-all duration-150',
        alertStyle,
        isDragging && 'opacity-50 shadow-lg rotate-1'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#F5F3EE] border border-[#E8E6E0] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-semibold text-[#6B6B6B]">{getInitials(lead.nombre)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1A1A1A] leading-tight truncate">{lead.nombre}</p>
          {/* Proyecto (Notion) o propiedad */}
          {lead.proyecto ? (
            <p className="text-[11px] text-[#C9A84C] font-medium truncate">🏗 {lead.proyecto}{lead.apartamento ? ` · ${lead.apartamento}` : ''}</p>
          ) : (
            <p className="text-[11px] text-[#6B6B6B] truncate">{lead.propiedad}</p>
          )}
        </div>
        {/* Prioridad badge */}
        {prioridadStyle && (
          <span className={clsx('text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', prioridadStyle.bg, prioridadStyle.text)}>
            {lead.prioridad === 'alta' ? '🔴' : '🟡'}
          </span>
        )}
      </div>

      {/* Pendientes */}
      {lead.pendientes && (
        <p className="text-[10px] text-[#6B6B6B] mb-2 line-clamp-2 italic">⚠ {lead.pendientes}</p>
      )}

      {/* Zona / País */}
      {(lead.zona || lead.pais) && (
        <p className="text-[11px] text-[#6B6B6B] mb-2">
          📍 {lead.zona || lead.pais}
        </p>
      )}

      {/* Valor */}
      {lead.valor_mensual_estimado && (
        <p className="text-[13px] font-semibold text-green-600 mb-2">
          ${lead.valor_mensual_estimado.toLocaleString()}/mes
          {lead.numero_unidades > 1 && (
            <span className="text-[11px] font-normal text-[#6B6B6B] ml-1">· {lead.numero_unidades} unidades</span>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {esUrgente && (
            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
              URGENTE
            </span>
          )}
          {!esUrgente && dias > 0 && (
            <span className={clsx(
              'text-[11px]',
              dias >= 7 ? 'text-amber-600' : 'text-[#6B6B6B]'
            )}>
              {dias}d sin contacto
            </span>
          )}
        </div>
        {lead.probabilidad > 0 && (
          <span className="text-[11px] text-[#6B6B6B]">{lead.probabilidad}%</span>
        )}
      </div>
    </div>
  )
}
