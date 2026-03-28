'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { clsx } from 'clsx'
import type { LeadConActividad, Estado } from '@/lib/types'
import { ESTADO_STYLES } from '@/lib/types'
import DealCard from './DealCard'

interface Props {
  estado: Estado
  leads: LeadConActividad[]
  onLeadClick: (lead: LeadConActividad) => void
}

export default function KanbanColumn({ estado, leads, onLeadClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })
  const style = ESTADO_STYLES[estado]
  const valorTotal = leads.reduce((sum, l) => sum + (l.valor_mensual_estimado ?? 0), 0)

  return (
    <div className="flex flex-col w-[260px] shrink-0">
      {/* Header columna */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
              {style.label}
            </span>
            <span className="text-[12px] font-medium text-[#6B6B6B]">{leads.length}</span>
          </div>
        </div>
        {valorTotal > 0 && (
          <p className="text-[11px] text-[#6B6B6B]">${valorTotal.toLocaleString()}/mes</p>
        )}
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-colors',
          isOver ? 'bg-[#C9A84C]/10 border-2 border-dashed border-[#C9A84C]' : 'bg-[#F5F3EE]/60'
        )}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <DealCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[11px] text-[#6B6B6B]">Sin leads</p>
          </div>
        )}
      </div>
    </div>
  )
}
