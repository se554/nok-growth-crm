'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Globe, FolderOpen } from 'lucide-react'
import type { LeadConActividad, PipelineMetrics } from '@/lib/types'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import LeadDetailDrawer from '@/components/pipeline/LeadDetailDrawer'
import AddLeadModal from '@/components/pipeline/AddLeadModal'

function MetricCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string
  value: string
  sub?: string
  alert?: boolean
}) {
  return (
    <div className="bg-white rounded-[14px] px-4 py-3 shadow-nok" style={{ border: '1px solid #d4d4d4' }}>
      <p className="text-[11px] mb-1" style={{ color: '#6c6c6c' }}>{label}</p>
      <p className={`text-[20px] font-semibold leading-tight`} style={{ color: alert ? '#d6a700' : '#1d1d1b' }}>
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
  const [filterPais, setFilterPais] = useState('')
  const [filterProyecto, setFilterProyecto] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setMetrics)
  }, [refreshKey])

  // Abrir drawer si viene ?lead=<id> desde la página de tareas
  useEffect(() => {
    const leadId = searchParams.get('lead')
    if (!leadId) return
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(data => { if (data?.id) setSelectedLead(data as LeadConActividad) })
  }, [searchParams])

  const handleLeadUpdated = () => {
    setRefreshKey((k) => k + 1)
    setSelectedLead(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 pt-6 pb-4 bg-white" style={{ borderBottom: '1px solid #d4d4d4' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[18px] font-semibold" style={{ color: '#1d1d1b' }}>Pipeline</h1>
            <p className="text-[12px]" style={{ color: '#6c6c6c' }}>Gestión de leads y propietarios</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 bg-white" style={{ border: '1px solid #d4d4d4' }}>
              <Globe size={13} style={{ color: '#6c6c6c' }} />
              <select value={filterPais} onChange={e => setFilterPais(e.target.value)}
                className="text-[12px] outline-none bg-transparent pr-1" style={{ color: '#1d1d1b' }}>
                <option value="">Todos los países</option>
                <option value="Punta Cana">Punta Cana</option>
                <option value="República Dominicana">Rep. Dominicana</option>
                <option value="España">España</option>
                <option value="Estados Unidos">Estados Unidos</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 bg-white" style={{ border: '1px solid #d4d4d4' }}>
              <FolderOpen size={13} style={{ color: '#6c6c6c' }} />
              <input value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)}
                placeholder="Filtrar proyecto..."
                className="text-[12px] outline-none bg-transparent w-32"
                style={{ color: '#1d1d1b' }} />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] transition-all"
              style={{ backgroundColor: '#833b0e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d6a700', e.currentTarget.style.color = '#1d1d1b')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#833b0e', e.currentTarget.style.color = 'white')}
            >
              <Plus size={15} />
              Nuevo lead
            </button>
          </div>
        </div>

        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-5 gap-3">
            <MetricCard
              label="Leads activos"
              value={String(metrics.total_activos)}
            />
            <MetricCard
              label="Valor del pipeline"
              value={`$${metrics.valor_pipeline.toLocaleString()}`}
              sub="por mes"
            />
            <MetricCard
              label="En negociación"
              value={String(metrics.leads_negociacion)}
              sub={`$${metrics.valor_negociacion.toLocaleString()}/mes`}
            />
            <MetricCard
              label="Sin contacto 7d+"
              value={String(metrics.leads_sin_contacto_7d)}
              alert={metrics.leads_sin_contacto_7d > 0}
            />
            <MetricCard
              label="Ganados este mes"
              value={String(metrics.ganados_este_mes)}
              sub={metrics.valor_ganado_mes > 0 ? `$${metrics.valor_ganado_mes.toLocaleString()}/mes` : undefined}
            />
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-auto">
        <KanbanBoard
          key={`${refreshKey}-${filterPais}-${filterProyecto}`}
          onLeadClick={(lead) => setSelectedLead(lead)}
          filterPais={filterPais}
          filterProyecto={filterProyecto}
        />
      </div>

      {/* Drawer detalle */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
        />
      )}

      {/* Modal nuevo lead */}
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
