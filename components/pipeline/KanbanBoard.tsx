'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import { supabase } from '@/lib/supabase'
import type { LeadConActividad, Estado } from '@/lib/types'
import { ESTADOS_ORDEN } from '@/lib/types'
import KanbanColumn from './KanbanColumn'
import DealCard from './DealCard'

interface Props {
  onLeadClick: (lead: LeadConActividad) => void
  filterPais?: string
  filterProyecto?: string
  filterSearch?: string
}

export default function KanbanBoard({ onLeadClick, filterPais, filterProyecto, filterSearch }: Props) {
  const [allLeads, setAllLeads] = useState<LeadConActividad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLead, setActiveLead] = useState<LeadConActividad | null>(null)
  const isDragging = activeLead !== null

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterPais) params.set('pais', filterPais)
    if (filterProyecto) params.set('proyecto', filterProyecto)
    const qs = params.toString()
    const res = await fetch(`/api/leads${qs ? '?' + qs : ''}`)
    if (res.ok) {
      const data = await res.json()
      const unique: LeadConActividad[] = Array.from(
        new Map((data as LeadConActividad[]).map((l) => [l.id, l])).values()
      )
      setAllLeads(unique)
    }
    setLoading(false)
  }, [filterPais, filterProyecto])

  useEffect(() => { fetchLeads() }, [fetchLeads, filterPais, filterProyecto])

  const q = (filterSearch ?? '').toLowerCase().trim()
  const leads = q
    ? allLeads.filter(l =>
        l.nombre?.toLowerCase().includes(q) ||
        (l as any).apartamento?.toLowerCase().includes(q) ||
        (l as any).zona?.toLowerCase().includes(q) ||
        (l as any).proyecto?.toLowerCase().includes(q) ||
        l.propiedad?.toLowerCase().includes(q)
      )
    : allLeads

  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        if (!isDragging) fetchLeads()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads, isDragging])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getLeadsByEstado = (estado: Estado) => leads.filter((l) => l.estado === estado)

  const handleDragStart = (event: DragStartEvent) => {
    const lead = allLeads.find((l) => l.id === event.active.id)
    setActiveLead(lead ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeLeadItem = allLeads.find((l) => l.id === activeId)
    if (!activeLeadItem) return

    const overEstado = ESTADOS_ORDEN.includes(overId as Estado) ? (overId as Estado) : null
    if (overEstado && activeLeadItem.estado !== overEstado) {
      setAllLeads((prev) =>
        prev.map((l) => (l.id === activeId ? { ...l, estado: overEstado } : l))
      )
    }

    const overLead = allLeads.find((l) => l.id === overId)
    if (overLead && overLead.estado !== activeLeadItem.estado) {
      setAllLeads((prev) =>
        prev.map((l) => (l.id === activeId ? { ...l, estado: overLead.estado } : l))
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)
    if (!over) return

    const activeId = active.id as string
    const lead = allLeads.find((l) => l.id === activeId)
    if (!lead) return

    const originalLead = activeLead
    if (!originalLead || originalLead.estado === lead.estado) return

    await fetch(`/api/leads/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: lead.estado,
        estado_anterior: originalLead.estado,
        nota: `Movido de ${originalLead.estado} a ${lead.estado} via Kanban`,
      }),
    })
    fetchLeads()
  }

  if (loading) {
    return (
      <div className="flex gap-4 p-6">
        {ESTADOS_ORDEN.map((e) => (
          <div key={e} className="w-[260px] shrink-0">
            <div className="h-5 rounded-full w-20 mb-3 animate-pulse" style={{ background: 'var(--surface-hi)' }} />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--surface-el)' }} />
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
          <div className="rotate-2 scale-105" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}>
            <DealCard lead={activeLead} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
