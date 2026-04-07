'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import type { LeadConActividad } from '@/lib/types'

interface Props {
  lead: LeadConActividad
  onClick: () => void
}

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function DealCard({ lead, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dias = lead.dias_sin_contacto ?? 0
  const marcadoUrgente = lead.prioridad === 'alta'
  const esUrgente = (marcadoUrgente || dias >= 14) && lead.estado !== 'cerrado' && lead.estado !== 'perdido'
  const esAtrasado = dias >= 7 && !esUrgente && lead.estado !== 'cerrado' && lead.estado !== 'perdido'

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--surface-el)',
        border: `1px solid ${esUrgente ? 'rgba(242,0,34,0.3)' : esAtrasado ? 'rgba(217,119,6,0.3)' : 'var(--border)'}`,
        borderLeft: `2px solid ${esUrgente ? '#F20022' : esAtrasado ? '#D97706' : 'transparent'}`,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? `${CSS.Transform.toString(transform)} rotate(1deg)` : CSS.Transform.toString(transform),
        boxShadow: isDragging ? '0 12px 32px rgba(0,0,0,0.5)' : undefined,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="rounded-xl p-3.5 cursor-pointer select-none transition-all duration-150 card-hover"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold"
          style={{ background: 'var(--surface-hi)', color: 'var(--text-muted)', border: '1px solid var(--border-mid)' }}>
          {getInitials(lead.nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
            {lead.nombre}
          </p>
          {lead.proyecto ? (
            <p className="text-[11px] truncate" style={{ color: 'var(--gold)' }}>
              {lead.proyecto}{lead.apartamento ? ` · ${lead.apartamento}` : ''}
            </p>
          ) : (
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{lead.propiedad}</p>
          )}
        </div>
      </div>

      {/* Pendientes */}
      {lead.pendientes && (
        <p className="text-[10px] mb-2 line-clamp-2 italic" style={{ color: 'var(--text-muted)' }}>
          {lead.pendientes}
        </p>
      )}

      {/* Zona */}
      {(lead.zona || lead.pais) && (
        <p className="text-[11px] mb-2" style={{ color: 'var(--text-dim)' }}>
          {lead.zona || lead.pais}
        </p>
      )}

      {/* Valor */}
      {lead.valor_mensual_estimado && (
        <p className="text-[13px] font-semibold mb-2" style={{ color: '#34d399' }}>
          ${lead.valor_mensual_estimado.toLocaleString()}/mes
          {lead.numero_unidades > 1 && (
            <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
              · {lead.numero_unidades} u.
            </span>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div>
          {esUrgente && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase"
              style={{ background: 'rgba(242,0,34,0.15)', color: '#f87171' }}>
              urgente
            </span>
          )}
          {!esUrgente && dias > 0 && (
            <span className="text-[10px]" style={{ color: esAtrasado ? '#D97706' : 'var(--text-dim)' }}>
              {dias}d sin contacto
            </span>
          )}
        </div>
        {lead.probabilidad > 0 && (
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{lead.probabilidad}%</span>
        )}
      </div>
    </div>
  )
}
