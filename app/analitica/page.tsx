'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import type { Estado } from '@/lib/types'
import { ESTADO_STYLES, TIPOLOGIA_LABELS, TIPO_PROPIEDAD_LABELS } from '@/lib/types'
import type { TipoPropiedad, Tipologia } from '@/lib/types'

interface Analytics {
  total_activos: number
  total_leads: number
  valor_pipeline: number
  leads_negociacion: number
  valor_negociacion: number
  leads_sin_contacto_7d: number
  ganados_este_mes: number
  valor_ganado_mes: number
  tasa_conversion: number
  tiempo_promedio_cierre: number | null
  ejecucion_nok_count: number
  ejecucion_nok_valor: number
  por_estado: { estado: Estado; count: number; valor_total: number }[]
  por_tipo_propiedad: { tipo: string; count: number; valor: number }[]
  por_tipologia: { tipologia: string; count: number; valor: number }[]
  por_pais: { pais: string; count: number; valor: number }[]
  por_proyecto: { proyecto: string; count: number; valor: number }[]
  top_zonas: { zona: string; count: number; valor: number }[]
  leads_en_riesgo: {
    id: string; nombre: string; propiedad: string; estado: Estado
    valor_mensual_estimado: number; dias_sin_contacto: number
  }[]
  tiempo_promedio_por_estado: { estado: string; promedio_dias: number }[]
  cambios_estado_diarios: { fecha: string; total: number; transiciones: Record<string, number> }[]
}

function KPICard({ label, value, sub, color, small }: {
  label: string; value: string; sub?: string; color?: string; small?: boolean
}) {
  return (
    <div className="bg-white rounded-xl px-5 py-4 border border-[#E8E6E0]">
      <p className="text-[11px] text-[#6B6B6B] mb-1">{label}</p>
      <p className={clsx(small ? 'text-[18px]' : 'text-[24px]', 'font-semibold leading-tight', color ?? 'text-[#1A1A1A]')}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#6B6B6B] mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">{children}</h2>
}

function HBarChart({ items, valueKey, labelKey, colorClass }: {
  items: Record<string, unknown>[]
  valueKey: string
  labelKey: string
  colorClass?: string
}) {
  const max = Math.max(...items.map(i => (i[valueKey] as number) ?? 0), 1)
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const val = (item[valueKey] as number) ?? 0
        const label = item[labelKey] as string
        const pct = (val / max) * 100
        return (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-[12px] text-[#1A1A1A]">{label}</span>
              <span className="text-[12px] font-medium text-[#1A1A1A]">
                {typeof val === 'number' && val > 100 ? `$${val.toLocaleString()}` : val}
              </span>
            </div>
            <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full', colorClass ?? 'bg-[#C9A84C]')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MiniBarChart({ data }: {
  data: { fecha: string; total: number }[]
}) {
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => {
        const pct = (d.total / max) * 100
        const date = new Date(d.fecha)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.fecha}: ${d.total} cambios`}>
            <div className="w-full flex items-end" style={{ height: '60px' }}>
              <div
                className={clsx('w-full rounded-t transition-all', d.total > 0 ? 'bg-[#C9A84C]' : 'bg-[#E8E6E0]', isWeekend && d.total > 0 && 'opacity-60')}
                style={{ height: d.total > 0 ? `${Math.max(pct, 8)}%` : '4px' }}
              />
            </div>
            {i % 3 === 0 && (
              <span className="text-[9px] text-[#6B6B6B]">
                {date.getDate()}/{date.getMonth() + 1}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AnaliticaPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-[#E8E6E0]" />)}
    </div>
  )

  const maxEstado = Math.max(...data.por_estado.map(e => e.count), 1)
  const maxTiempo = Math.max(...data.tiempo_promedio_por_estado.map(e => e.promedio_dias), 1)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Analítica</h1>
        <p className="text-[12px] text-[#6B6B6B]">Métricas del pipeline NOK</p>
      </div>

      {/* KPIs fila 1 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total leads" value={String(data.total_leads)} sub={`${data.total_activos} activos`} />
        <KPICard label="Valor total pipeline" value={`$${data.valor_pipeline.toLocaleString()}`} sub="por mes" />
        <KPICard label="Tasa de conversión" value={`${data.tasa_conversion}%`}
          sub={`${data.ganados_este_mes} cerrados este mes`}
          color={data.tasa_conversion >= 50 ? 'text-green-600' : 'text-amber-600'} />
        <KPICard label="Sin contacto 7d+"
          value={String(data.leads_sin_contacto_7d)}
          color={data.leads_sin_contacto_7d > 0 ? 'text-red-500' : 'text-green-600'} />
      </div>

      {/* KPIs fila 2 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Tiempo promedio de cierre"
          value={data.tiempo_promedio_cierre ? `${data.tiempo_promedio_cierre}d` : 'N/D'}
          sub="desde prospecto a cerrado" />
        <KPICard label="En cotización/comprometido" value={String(data.leads_negociacion)}
          sub={`$${data.valor_negociacion.toLocaleString()}/mes`} />
        <KPICard label="NOK ejecuta compra" value={String(data.ejecucion_nok_count)}
          sub={`$${data.ejecucion_nok_valor.toLocaleString()}/mes potencial`}
          color="text-[#C9A84C]" />
        <KPICard label="Cerrados este mes" value={String(data.ganados_este_mes)}
          sub={`$${data.valor_ganado_mes.toLocaleString()}/mes`} color="text-green-600" />
      </div>

      {/* Fila: Funnel + Tiempo por etapa */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Funnel de conversión</SectionTitle>
          <div className="space-y-3">
            {data.por_estado.map(({ estado, count, valor_total }) => {
              const style = ESTADO_STYLES[estado as Estado] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: estado }
              const pct = Math.round((count / maxEstado) * 100)
              return (
                <div key={estado}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                      {style.label}
                    </span>
                    <div className="text-right">
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">{count}</span>
                      {valor_total > 0 && <span className="text-[11px] text-[#6B6B6B] ml-2">${valor_total.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', style.bg, 'border', style.border)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Tiempo promedio por etapa</SectionTitle>
          <div className="space-y-3">
            {data.tiempo_promedio_por_estado
              .filter(e => ESTADO_STYLES[e.estado])
              .sort((a, b) => ESTADOS_ORDEN.indexOf(a.estado as Estado) - ESTADOS_ORDEN.indexOf(b.estado as Estado))
              .map(({ estado, promedio_dias }) => {
                const style = ESTADO_STYLES[estado] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: estado }
                const pct = (promedio_dias / maxTiempo) * 100
                return (
                  <div key={estado}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                        {style.label}
                      </span>
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{promedio_dias}d</span>
                    </div>
                    <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Fila: Top zonas + Por tipo de propiedad */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Zonas / Países con más leads</SectionTitle>
          <div className="space-y-2.5">
            {data.top_zonas.map(({ zona, count, valor }) => {
              const max = Math.max(...data.top_zonas.map(z => z.count), 1)
              const pct = (count / max) * 100
              return (
                <div key={zona}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#1A1A1A]">{zona}</span>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{count}</span>
                      {valor > 0 && <span className="text-[11px] text-green-600 ml-2">${valor.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Por tipo de propiedad</SectionTitle>
          <div className="space-y-2.5">
            {data.por_tipo_propiedad.map(({ tipo, count, valor }) => {
              const max = Math.max(...data.por_tipo_propiedad.map(t => t.count), 1)
              const pct = (count / max) * 100
              const label = TIPO_PROPIEDAD_LABELS[tipo as TipoPropiedad] ?? tipo
              return (
                <div key={tipo}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#1A1A1A]">{label}</span>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{count}</span>
                      {valor > 0 && <span className="text-[11px] text-green-600 ml-2">${valor.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fila: Tipologías + Por país */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Tipologías de propiedad</SectionTitle>
          <div className="space-y-2.5">
            {data.por_tipologia.map(({ tipologia, count, valor }) => {
              const max = Math.max(...data.por_tipologia.map(t => t.count), 1)
              const pct = (count / max) * 100
              const label = TIPOLOGIA_LABELS[tipologia as Tipologia] ?? tipologia
              return (
                <div key={tipologia}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#1A1A1A]">{label}</span>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{count}</span>
                      {valor > 0 && <span className="text-[11px] text-green-600 ml-2">${valor.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Leads por país</SectionTitle>
          <div className="space-y-3">
            {data.por_pais.map(({ pais, count, valor }) => {
              const max = Math.max(...data.por_pais.map(p => p.count), 1)
              const pct = (count / max) * 100
              return (
                <div key={pais}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#1A1A1A]">{pais}</span>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold">{count}</span>
                      {valor > 0 && <span className="text-[11px] text-green-600 ml-2">${valor.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Por proyecto */}
      {data.por_proyecto.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
          <SectionTitle>Leads por proyecto</SectionTitle>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            {data.por_proyecto.map(({ proyecto, count, valor }) => {
              const max = Math.max(...data.por_proyecto.map(p => p.count), 1)
              const pct = (count / max) * 100
              return (
                <div key={proyecto}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#1A1A1A] truncate max-w-[180px]">{proyecto}</span>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{count}</span>
                      {valor > 0 && <span className="text-[11px] text-green-600 ml-2">${valor.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cambios de estado diarios */}
      <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
        <div className="flex items-start justify-between mb-4">
          <SectionTitle>Cambios de estado — últimos 14 días</SectionTitle>
          <span className="text-[11px] text-[#6B6B6B]">
            Total: {data.cambios_estado_diarios.reduce((s, d) => s + d.total, 0)} cambios
          </span>
        </div>
        <MiniBarChart data={data.cambios_estado_diarios} />
        {/* Transiciones recientes */}
        <div className="mt-4 space-y-1.5">
          {data.cambios_estado_diarios
            .filter(d => d.total > 0)
            .slice(-5)
            .reverse()
            .map(d => (
              <div key={d.fecha} className="flex items-center gap-3">
                <span className="text-[11px] text-[#6B6B6B] w-20 shrink-0">{d.fecha.slice(5)}</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(d.transiciones).map(([key, count]) => {
                    const [de, a] = key.split('→')
                    const styleA = ESTADO_STYLES[a as Estado]
                    return (
                      <span key={key} className={clsx('text-[10px] px-2 py-0.5 rounded-full border', styleA?.bg, styleA?.text, styleA?.border)}>
                        {de} → {a} ({count})
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Leads en riesgo */}
      <div className="bg-white rounded-xl border border-[#E8E6E0] p-5">
        <SectionTitle>Leads en riesgo</SectionTitle>
        {data.leads_en_riesgo.length === 0 ? (
          <p className="text-[13px] text-[#6B6B6B]">¡Sin leads en riesgo!</p>
        ) : (
          <div className="space-y-2">
            {data.leads_en_riesgo.map(lead => {
              const style = ESTADO_STYLES[lead.estado] ?? { bg:'bg-gray-100',text:'text-gray-500',border:'border-gray-200',label:lead.estado }
              const urgente = lead.dias_sin_contacto >= 14
              return (
                <div key={lead.id} className={clsx(
                  'flex items-center justify-between p-3 rounded-xl border border-[#E8E6E0]',
                  urgente ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-amber-400'
                )}>
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1A1A]">{lead.nombre}</p>
                    <p className="text-[11px] text-[#6B6B6B]">{lead.propiedad}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                      {style.label}
                    </span>
                    <div className="text-right">
                      <p className={clsx('text-[12px] font-semibold', urgente ? 'text-red-500' : 'text-amber-600')}>
                        {lead.dias_sin_contacto}d sin contacto
                      </p>
                      {lead.valor_mensual_estimado > 0 && (
                        <p className="text-[11px] text-green-600">${lead.valor_mensual_estimado.toLocaleString()}/mes</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Necesario para el sort de tiempo por estado
const ESTADOS_ORDEN = [
  'prospecto','pendiente_contacto','contactado','pendiente_respuesta',
  'en_espera','pendiente_reunion','cotizacion','comprometido','cerrado','perdido',
]
