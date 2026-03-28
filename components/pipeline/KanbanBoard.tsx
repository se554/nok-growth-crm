'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase'
import type { LeadConActividad, Estado } from '@/lib/types'
import { ESTADOS_ORDEN } from '@/lib/types'
import KanbanColumn from './KanbanColumn'
import DealCard from './DealCard'

interface Props {
  onLeadClick: (lead: LeadConActividad) => void
  filterPais?: string
  filterProyecto?: string
}

export default function KanbanBoard({ onLeadClick, filterPais, filterProyecto }: Props) {
  const [leads, setLeads] = useState<LeadConActividad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLead, setActiveLead] = useState<LeadConActividad | null>(null)

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterPais) params.set('pais', filterPais)
    if (filterProyecto) params.set('proyecto', filterProyecto)
    const qs = params.toString()
    const res = await fetch(`/api/leads${qs ? '?' + qs : ''}`)
    if (res.ok) {
      const data = await res.json()
      setLeads(data)
    }
    setLoading(false)
  }, [filterPais, filterProyecto])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads, filterPais, filterProyecto])

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getLeadsByEstado = (estado: Estado) =>
    leads.filter((l) => l.estado === estado)

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id)
    setActiveLead(lead ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeLead = leads.find((l) => l.id === activeId)
    if (!activeLead) return

    // Si cayó sobre una columna (estado)
    const overEstado = ESTADOS_ORDEN.includes(overId as Estado) ? (overId as Estado) : null
    if (overEstado && activeLead.estado !== overEstado) {
      setLeads((prev) =>
        prev.map((l) => (l.id === activeId ? { ...l, estado: overEstado } : l))
      )
    }

    // Si cayó sobre otro card
    const overLead = leads.find((l) => l.id === overId)
    if (overLead && overLead.estado !== activeLead.estado) {
      setLeads((prev) =>
        prev.map((l) => (l.id === activeId ? { ...l, estado: overLead.estado } : l))
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)
    if (!over) return

    const activeId = active.id as string
    const lead = leads.find((l) => l.id === activeId)
    if (!lead) return

    const originalLead = activeLead
    if (!originalLead || originalLead.estado === lead.estado) return

    // Persistir en Supabase
    await fetch(`/api/leads/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: lead.estado,
        estado_anterior: originalLead.estado,
        nota: `Movido de ${originalLead.estado} a ${lead.estado} via Kanban`,
      }),
    })
  }

  if (loading) {
    return (
      <div className="flex gap-4 p-6">
        {ESTADOS_ORDEN.map((e) => (
          <div key={e} className="w-[260px] shrink-0">
            <div className="h-6 bg-white rounded-full w-24 mb-3 animate-pulse" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto min-h-full">
        {ESTADOS_ORDEN.map((estado) => (
          <KanbanColumn
            key={estado}
            estado={estado}
            leads={getLeadsByEstado(estado)}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="rotate-2 shadow-xl opacity-90">
            <DealCard lead={activeLead} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
