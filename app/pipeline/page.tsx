'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, X, FileText } from 'lucide-react'
import type { LeadConActividad, PipelineMetrics } from '@/lib/types'
import { ESTADO_STYLES } from '@/lib/types'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import LeadDetailDrawer from '@/components/pipeline/LeadDetailDrawer'
import AddLeadModal from '@/components/pipeline/AddLeadModal'

function MetricCard({ label, value, sub, alert }: {
  label: string; value: string; sub?: string; alert?: boolean
}) {
  return (
    <div className="rounded-[14px] px-4 py-3"
      style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] mb-1 tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>{label}</p>
      <p className="text-[20px] font-semibold leading-tight"
        style={{ color: alert ? 'var(--gold)' : 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
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
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [reporteEnviado, setReporteEnviado] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setMetrics)
  }, [refreshKey])

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAllLeads(data)
    })
  }, [refreshKey])

  useEffect(() => {
    const leadId = searchParams.get('lead')
    if (!leadId) return
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(data => { if (data?.id) setSelectedLead(data as LeadConActividad) })
  }, [searchParams])

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

  const generarReporte = async () => {
    setGenerandoReporte(true)
    setReporteEnviado(false)
    await fetch('/api/reporte/generar', { method: 'POST' })
    setGenerandoReporte(false)
    setReporteEnviado(true)
    setTimeout(() => setReporteEnviado(false), 5000)
  }

  const openLead = (lead: LeadConActividad) => {
    setSelectedLead(lead)
    setShowDropdown(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 pt-5 pb-4 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Pipeline</h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Gestión de leads y propietarios</p>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Búsqueda global */}
            <div ref={searchRef} className="relative flex-1 max-w-sm">
              <div className="flex items-center gap-2 rounded-[10px] px-3 py-2 transition-all"
                style={{ background: 'var(--surface-el)', border: '1px solid var(--border-mid)' }}>
                <Search size={13} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Buscar propietario, apartamento, zona..."
                  className="text-[12px] outline-none bg-transparent flex-1 min-w-0"
                  style={{ color: 'var(--text-primary)' }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setShowDropdown(false) }}>
                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl z-50 overflow-hidden"
                  style={{ background: 'var(--surface-el)', border: '1px solid var(--border-mid)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  {suggestions.map(lead => {
                    const estado = ESTADO_STYLES[lead.estado] ?? ESTADO_STYLES['prospecto']
                    const sub = [(lead as any).apartamento, (lead as any).zona, (lead as any).proyecto]
                      .filter(Boolean).join(' · ')
                    return (
                      <button key={lead.id} onClick={() => openLead(lead)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hi)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: 'var(--surface-hi)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {lead.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{lead.nombre}</p>
                          {sub && <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${estado.bg} ${estado.text} ${estado.border}`}>
                          {estado.label}
                        </span>
                      </button>
                    )
                  })}
                  {allLeads.filter(l =>
                    l.nombre?.toLowerCase().includes(q) || (l as any).apartamento?.toLowerCase().includes(q) ||
                    (l as any).zona?.toLowerCase().includes(q) || (l as any).proyecto?.toLowerCase().includes(q) ||
                    l.propiedad?.toLowerCase().includes(q)
                  ).length > 6 && (
                    <div className="px-4 py-2 text-[11px]" style={{ color: 'var(--text-dim)', background: 'var(--surface-hi)' }}>
                      Mostrando 6 de {allLeads.filter(l =>
                        l.nombre?.toLowerCase().includes(q) || (l as any).apartamento?.toLowerCase().includes(q) ||
                        (l as any).zona?.toLowerCase().includes(q) || (l as any).proyecto?.toLowerCase().includes(q) ||
                        l.propiedad?.toLowerCase().includes(q)
                      ).length} — el Kanban muestra todos
                    </div>
                  )}
                </div>
              )}

              {showDropdown && q.length >= 2 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl z-50 px-4 py-3 text-[12px]"
                  style={{ background: 'var(--surface-el)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  Sin resultados para &quot;{search}&quot;
                </div>
              )}
            </div>

            <button
              onClick={generarReporte}
              disabled={generandoReporte}
              className="flex items-center gap-2 text-[12px] font-medium px-3 py-2 rounded-[10px] transition-all shrink-0 disabled:opacity-50"
              style={{
                border: `1px solid ${reporteEnviado ? 'rgba(52,211,153,0.4)' : 'var(--border-mid)'}`,
                color: reporteEnviado ? '#34d399' : 'var(--text-muted)',
                background: 'var(--surface-el)',
              }}
            >
              <FileText size={14} />
              {generandoReporte ? 'Generando...' : reporteEnviado ? '✓ Enviado' : 'Reporte'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gold flex items-center gap-2 shrink-0"
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
            <MetricCard label="Pipeline" value={`$${metrics.valor_pipeline.toLocaleString()}`} sub="por mes" />
            <MetricCard label="En negociación" value={String(metrics.leads_negociacion)} sub={`$${metrics.valor_negociacion.toLocaleString()}/mes`} />
            <MetricCard label="Sin contacto 7d+" value={String(metrics.leads_sin_contacto_7d)} alert={metrics.leads_sin_contacto_7d > 0} />
            <MetricCard label="Ganados este mes" value={String(metrics.ganados_este_mes)} sub={metrics.valor_ganado_mes > 0 ? `$${metrics.valor_ganado_mes.toLocaleString()}/mes` : undefined} />
          </div>
        )}

        {/* Filtro activo */}
        {search.trim().length >= 2 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Filtrando por:</span>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-mid)' }}>
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch('')} className="ml-1 opacity-60 hover:opacity-100">
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
