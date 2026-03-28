'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { LeadConActividad, Estado, Fuente } from '@/lib/types'
import { ESTADO_STYLES, ZONAS } from '@/lib/types'
import LeadDetailDrawer from '@/components/pipeline/LeadDetailDrawer'

export default function PropietariosPage() {
  const [leads, setLeads] = useState<LeadConActividad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterZona, setFilterZona] = useState('')
  const [filterPais, setFilterPais] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'dias_sin_contacto' | 'valor_mensual_estimado'>('dias_sin_contacto')
  const [selected, setSelected] = useState<LeadConActividad | null>(null)

  const fetchLeads = () => {
    fetch('/api/leads').then(r => r.json()).then(data => {
      setLeads(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase()
      const matchSearch = !q || l.nombre.toLowerCase().includes(q) || l.propiedad.toLowerCase().includes(q) || (l.proyecto ?? '').toLowerCase().includes(q)
      const matchEstado = !filterEstado || l.estado === filterEstado
      const matchZona = !filterZona || l.zona === filterZona
      const matchPais = !filterPais || (l.pais ?? '').toLowerCase().includes(filterPais.toLowerCase())
      return matchSearch && matchEstado && matchZona && matchPais
    })
    .sort((a, b) => {
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'dias_sin_contacto') return (b.dias_sin_contacto ?? 0) - (a.dias_sin_contacto ?? 0)
      if (sortBy === 'valor_mensual_estimado') return (b.valor_mensual_estimado ?? 0) - (a.valor_mensual_estimado ?? 0)
      return 0
    })

  const exportCSV = () => {
    const headers = ['Nombre','Propiedad','Zona','Estado','Valor/mes','Días sin contacto','Teléfono','Email']
    const rows = filtered.map(l => [
      l.nombre, l.propiedad, l.zona ?? '', l.estado,
      l.valor_mensual_estimado ?? '', l.dias_sin_contacto ?? '',
      l.telefono ?? '', l.email ?? ''
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'nok-leads.csv'; a.click()
  }

  const selectClass = "text-[12px] border border-[#E8E6E0] rounded-lg px-3 py-1.5 outline-none focus:border-[#C9A84C] bg-white text-[#1A1A1A]"

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Propietarios</h1>
          <p className="text-[12px] text-[#6B6B6B]">{filtered.length} leads</p>
        </div>
        <button onClick={exportCSV} className="text-[12px] border border-[#E8E6E0] px-3 py-1.5 rounded-lg hover:bg-[#F5F3EE] transition-all text-[#6B6B6B]">
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 border border-[#E8E6E0] rounded-lg px-3 py-1.5 bg-white flex-1 min-w-[200px]">
          <Search size={14} className="text-[#6B6B6B]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nombre o propiedad..."
            className="text-[12px] outline-none bg-transparent text-[#1A1A1A] placeholder-[#6B6B6B] flex-1" />
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          {(['prospecto','contactado','propuesta','negociacion','ganado','perdido'] as Estado[]).map(e => (
            <option key={e} value={e}>{ESTADO_STYLES[e].label}</option>
          ))}
        </select>
        <select value={filterZona} onChange={e => setFilterZona(e.target.value)} className={selectClass}>
          <option value="">Todas las zonas</option>
          {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={filterPais} onChange={e => setFilterPais(e.target.value)} className={selectClass}>
          <option value="">Todos los países</option>
          <option value="Punta Cana">Punta Cana</option>
          <option value="República Dominicana">Rep. Dominicana</option>
          <option value="España">España</option>
          <option value="Estados Unidos">Estados Unidos</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={selectClass}>
          <option value="dias_sin_contacto">Ordenar: Sin contacto</option>
          <option value="valor_mensual_estimado">Ordenar: Valor</option>
          <option value="nombre">Ordenar: Nombre</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E0] bg-[#F5F3EE]">
              {['Nombre','Propiedad','Zona','Estado','Valor/mes','Sin contacto','Última actividad'].map(h => (
                <th key={h} className="text-left text-[11px] font-medium text-[#6B6B6B] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length: 5}).map((_, i) => (
                <tr key={i} className="border-b border-[#E8E6E0]">
                  {Array.from({length: 7}).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-[#F5F3EE] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(lead => {
              const style = ESTADO_STYLES[lead.estado] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:lead.estado }
              const dias = lead.dias_sin_contacto ?? 0
              const urgente = dias >= 14 && lead.estado !== 'cerrado' && lead.estado !== 'perdido'
              return (
                <tr key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="border-b border-[#E8E6E0] hover:bg-[#F5F3EE] cursor-pointer transition-all last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[#1A1A1A]">{lead.nombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-[#6B6B6B]">{lead.propiedad}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-[#6B6B6B]">{lead.zona ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-green-600">
                      {lead.valor_mensual_estimado ? `$${lead.valor_mensual_estimado.toLocaleString()}` : '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[12px] font-medium', urgente ? 'text-red-500' : dias >= 7 ? 'text-amber-600' : 'text-[#6B6B6B]')}>
                      {dias > 0 ? `${dias}d` : '—'}
                      {urgente && ' ⚠️'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-[#6B6B6B]">
                      {lead.ultimo_evento
                        ? formatDistanceToNow(new Date(lead.fecha_ultimo_contacto ?? lead.created_at), { addSuffix: true, locale: es })
                        : '—'}
                    </p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#6B6B6B]">Sin resultados para ese filtro.</div>
        )}
      </div>

      {selected && (
        <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onUpdated={() => { fetchLeads(); setSelected(null) }} />
      )}
    </div>
  )
}
