'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { LeadConActividad, Estado } from '@/lib/types'
import { ESTADO_STYLES } from '@/lib/types'
import DealCard from './DealCard'

interface Props {
  estado: Estado
  leads: LeadConActividad[]
  onLeadClick: (lead: LeadConActividad) => void
}

const ESTADO_DOT: Record<string, string> = {
  prospecto:    '#6B7280',
  cotizacion:   '#7C3AED',
  comprometido: '#D97706',
  cerrado:      '#059669',
  perdido:      '#DC2626',
}

export default function KanbanColumn({ estado, leads, onLeadClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })
  const style = ESTADO_STYLES[estado]
  const valorTotal = leads.reduce((sum, l) => sum + (l.valor_mensual_estimado ?? 0), 0)
  const dotColor = ESTADO_DOT[estado] ?? 'var(--text-dim)'

  return (
    <div className="flex flex-col w-[260px] shrink-0">
      {/* Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {style.label}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-medium"
            style={{ background: 'var(--surface-hi)', color: 'var(--text-muted)' }}>
            {leads.length}
          </span>
        </div>
        {valorTotal > 0 && (
          <p className="text-[11px] ml-4" style={{ color: 'var(--text-dim)' }}>
            ${valorTotal.toLocaleString()}/mes
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-all duration-200"
        style={{
          background: isOver ? 'rgba(214,167,0,0.06)' : 'rgba(255,255,255,0.02)',
          border: isOver ? '1px dashed rgba(214,167,0,0.4)' : '1px solid transparent',
        }}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <DealCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Sin leads</p>
          </div>
        )}
      </div>
    </div>
  )
}
