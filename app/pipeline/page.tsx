'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, X } from 'lucide-react'
import { clsx } from 'clsx'
import type { LeadConActividad, PipelineMetrics } from '@/lib/types'
import { ESTADO_STYLES } from '@/lib/types'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import LeadDetailDrawer from '@/components/pipeline/LeadDetailDrawer'
import AddLeadModal from '@/components/pipeline/AddLeadModal'

function MetricCard({ label, value, sub, alert }: {
  label: string; value: string; sub?: string; alert?: boolean
}) {
  return (
    <div className="bg-white rounded-[14px] px-4 py-3 shadow-nok" style={{ border: '1px solid #d4d4d4' }}>
      <p className="text-[11px] mb-1" style={{ color: '#6c6c6c' }}>{label}</p>
      <p className="text-[20px] font-semibold leading-tight" style={{ color: alert ? '#d6a700' : '#1d1d1b' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: '#6c6c6c' }}>{sub}</p>}
    </div>
  )
}

function PipelinePageInner() {
  const [selectedLead, setSelectedLead] = useState<LeadConActividad | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [allLeads, setAllLeads] = useState<LeadConActividad[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setMetrics)
  }, [refreshKey])

  // Cargar leads para el autocomplete
  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAllLeads(data)
    })
  }, [refreshKey])

  // Abrir drawer si viene ?lead=<id>
  useEffect(() => {
    const leadId = searchParams.get('lead')
    if (!leadId) return
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(data => { if (data?.id) setSelectedLead(data as LeadConActividad) })
  }, [searchParams])

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLeadUpdated = () => {
    setRefreshKey(k => k + 1)
    setSelectedLead(null)
  }

  // Resultados del dropdown
  const q = search.toLowerCase().trim()
  const suggestions = q.length >= 2
    ? allLeads.filter(l =>
        l.nombre?.toLowerCase().includes(q) ||
        (l as any).apartamento?.toLowerCase().includes(q) ||
        (l as any).zona?.toLowerCase().includes(q) ||
        (l as any).proyecto?.toLowerCase().includes(q) ||
        l.propiedad?.toLowerCase().includes(q)
      ).slice(0, 6)
    : []

  const openLead = (lead: LeadConActividad) => {
    setSelectedLead(lead)
    setShowDropdown(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 pt-5 pb-4 bg-white" style={{ borderBottom: '1px solid #d4d4d4' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[18px] font-semibold" style={{ color: '#1d1d1b' }}>Pipeline</h1>
            <p className="text-[12px]" style={{ color: '#6c6c6c' }}>Gestión de leads y propietarios</p>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Búsqueda global */}
            <div ref={searchRef} className="relative flex-1 max-w-sm">
              <div className={clsx(
                'flex items-center gap-2 rounded-[10px] px-3 py-2 bg-white transition-all',
                showDropdown && search ? 'border-[#C9A84C]' : 'border-[#d4d4d4]'
              )} style={{ border: '1px solid', borderColor: showDropdown && search ? '#C9A84C' : '#d4d4d4' }}>
                <Search size={13} style={{ color: '#6c6c6c' }} className="shrink-0" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Buscar propietario, apartamento, zona, proyecto..."
                  className="text-[12px] outline-none bg-transparent flex-1 min-w-0"
                  style={{ color: '#1d1d1b' }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setShowDropdown(false) }}>
                    <X size={12} style={{ color: '#6c6c6c' }} />
                  </button>
                )}
              </div>

              {/* Dropdown resultados */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E8E6E0] z-50 overflow-hidden">
                  {suggestions.map(lead => {
                    const estado = ESTADO_STYLES[lead.estado] ?? ESTADO_STYLES['prospecto']
                    const sub = [(lead as any).apartamento, (lead as any).zona, (lead as any).proyecto]
                      .filter(Boolean).join(' · ')
                    return (
                      <button key={lead.id} onClick={() => openLead(lead)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F3EE] transition-all text-left">
                        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', estado.bg, estado.text)}>
                          {lead.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{lead.nombre}</p>
                          {sub && <p className="text-[11px] text-[#6B6B6B] truncate">{sub}</p>}
                        </div>
                        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border shrink-0', estado.bg, estado.text, estado.border)}>
                          {estado.label}
                        </span>
                      </button>
                    )
                  })}
                  {q.length >= 2 && allLeads.filter(l =>
                    l.nombre?.toLowerCase().includes(q) ||
                    (l as any).apartamento?.toLowerCase().includes(q) ||
                    (l as any).zona?.toLowerCase().includes(q) ||
                    (l as any).proyecto?.toLowerCase().includes(q) ||
                    l.propiedad?.toLowerCase().includes(q)
                  ).length > 6 && (
                    <div className="px-4 py-2 text-[11px] text-[#6B6B6B] border-t border-[#E8E6E0] bg-[#F5F3EE]">
                      Mostrando 6 de {allLeads.filter(l =>
                        l.nombre?.toLowerCase().includes(q) ||
                        (l as any).apartamento?.toLowerCase().includes(q) ||
                        (l as any).zona?.toLowerCase().includes(q) ||
                        (l as any).proyecto?.toLowerCase().includes(q) ||
                        l.propiedad?.toLowerCase().includes(q)
                      ).length} — el Kanban muestra todos
                    </div>
                  )}
                </div>
              )}

              {/* Sin resultados */}
              {showDropdown && q.length >= 2 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E8E6E0] z-50 px-4 py-3 text-[12px] text-[#6B6B6B]">
                  Sin resultados para &quot;{search}&quot;
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] transition-all shrink-0"
              style={{ backgroundColor: '#833b0e' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d6a700'; e.currentTarget.style.color = '#1d1d1b' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#833b0e'; e.currentTarget.style.color = 'white' }}
            >
              <Plus size={15} />
              Nuevo lead
            </button>
          </div>
        </div>

        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-5 gap-3">
            <MetricCard label="Leads activos" value={String(metrics.total_activos)} />
            <MetricCard label="Valor del pipeline" value={`$${metrics.valor_pipeline.toLocaleString()}`} sub="por mes" />
            <MetricCard label="En negociación" value={String(metrics.leads_negociacion)} sub={`$${metrics.valor_negociacion.toLocaleString()}/mes`} />
            <MetricCard label="Sin contacto 7d+" value={String(metrics.leads_sin_contacto_7d)} alert={metrics.leads_sin_contacto_7d > 0} />
            <MetricCard label="Ganados este mes" value={String(metrics.ganados_este_mes)} sub={metrics.valor_ganado_mes > 0 ? `$${metrics.valor_ganado_mes.toLocaleString()}/mes` : undefined} />
          </div>
        )}

        {/* Indicador filtro activo */}
        {search.trim().length >= 2 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-[#6B6B6B]">Filtrando por:</span>
            <span className="flex items-center gap-1 text-[11px] bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-0.5 rounded-full">
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch('')} className="ml-1 hover:text-[#b8963f]">
                <X size={10} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-auto">
        <KanbanBoard
          key={refreshKey}
          onLeadClick={lead => setSelectedLead(lead)}
          filterSearch={search}
        />
      </div>

      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
        />
      )}

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleLeadUpdated}
        />
      )}
    </div>
  )
}

export default function PipelinePage() {
  return (
    <Suspense>
      <PipelinePageInner />
    </Suspense>
  )
}
