'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import type { Estado } from '@/lib/types'
import { ESTADO_STYLES, TIPOLOGIA_LABELS, TIPO_PROPIEDAD_LABELS } from '@/lib/types'
import type { TipoPropiedad, Tipologia } from '@/lib/types'

interface Analytics {
  total_activos: number; total_leads: number; valor_pipeline: number
  leads_negociacion: number; valor_negociacion: number; leads_sin_contacto_7d: number
  ganados_este_mes: number; valor_ganado_mes: number; tasa_conversion: number
  tiempo_promedio_cierre: number | null; ejecucion_nok_count: number; ejecucion_nok_valor: number
  por_estado: { estado: Estado; count: number; valor_total: number }[]
  por_tipo_propiedad: { tipo: string; count: number; valor: number }[]
  por_tipologia: { tipologia: string; count: number; valor: number }[]
  por_pais: { pais: string; count: number; valor: number }[]
  por_proyecto: { proyecto: string; count: number; valor: number }[]
  top_zonas: { zona: string; count: number; valor: number }[]
  leads_en_riesgo: { id: string; nombre: string; propiedad: string; estado: Estado; valor_mensual_estimado: number; dias_sin_contacto: number }[]
  tiempo_promedio_por_estado: { estado: string; promedio_dias: number }[]
  cambios_estado_diarios: { fecha: string; total: number; transiciones: Record<string, number> }[]
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] mb-1 uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>{label}</p>
      <p className="text-[24px] font-semibold leading-tight" style={{ color: color ?? 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>{children}</h2>
}

function HBar({ label, value, pct, colorStyle, sub }: { label: string; value: number; pct: number; colorStyle?: React.CSSProperties; sub?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <div className="text-right">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {value > 100 ? `$${value.toLocaleString()}` : value}
          </span>
          {sub && <span className="text-[11px] ml-2" style={{ color: '#34d399' }}>{sub}</span>}
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hi)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--gold)', ...colorStyle }} />
      </div>
    </div>
  )
}

function MiniBarChart({ data }: { data: { fecha: string; total: number }[] }) {
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => {
        const pct = (d.total / max) * 100
        const date = new Date(d.fecha)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.fecha}: ${d.total}`}>
            <div className="w-full flex items-end" style={{ height: '60px' }}>
              <div className="w-full rounded-t transition-all"
                style={{
                  height: d.total > 0 ? `${Math.max(pct, 8)}%` : '2px',
                  background: d.total > 0 ? (isWeekend ? 'rgba(214,167,0,0.45)' : 'var(--gold)') : 'var(--border-mid)',
                }} />
            </div>
            {i % 3 === 0 && (
              <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                {date.getDate()}/{date.getMonth() + 1}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  )
}

const ESTADOS_ORDEN_LOCAL = [
  'prospecto','pendiente_contacto','contactado','pendiente_respuesta',
  'en_espera','pendiente_reunion','cotizacion','comprometido','cerrado','perdido',
]

export default function AnaliticaPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }} />)}
    </div>
  )

  const maxEstado = Math.max(...data.por_estado.map(e => e.count), 1)
  const maxTiempo = Math.max(...data.tiempo_promedio_por_estado.map(e => e.promedio_dias), 1)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Analítica</h1>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Métricas del pipeline NOK</p>
      </div>

      {/* KPIs row 1 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total leads" value={String(data.total_leads)} sub={`${data.total_activos} activos`} />
        <KPICard label="Valor total pipeline" value={`$${data.valor_pipeline.toLocaleString()}`} sub="por mes" />
        <KPICard label="Tasa de conversión" value={`${data.tasa_conversion}%`}
          sub={`${data.ganados_este_mes} cerrados este mes`}
          color={data.tasa_conversion >= 50 ? '#34d399' : 'var(--gold)'} />
        <KPICard label="Sin contacto 7d+"
          value={String(data.leads_sin_contacto_7d)}
          color={data.leads_sin_contacto_7d > 0 ? '#f87171' : '#34d399'} />
      </div>

      {/* KPIs row 2 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Tiempo promedio de cierre"
          value={data.tiempo_promedio_cierre ? `${data.tiempo_promedio_cierre}d` : 'N/D'}
          sub="desde prospecto a cerrado" />
        <KPICard label="En cotización/comprometido" value={String(data.leads_negociacion)}
          sub={`$${data.valor_negociacion.toLocaleString()}/mes`} />
        <KPICard label="NOK ejecuta compra" value={String(data.ejecucion_nok_count)}
          sub={`$${data.ejecucion_nok_valor.toLocaleString()}/mes potencial`}
          color="var(--gold)" />
        <KPICard label="Cerrados este mes" value={String(data.ganados_este_mes)}
          sub={`$${data.valor_ganado_mes.toLocaleString()}/mes`} color="#34d399" />
      </div>

      {/* Funnel + Tiempo por etapa */}
      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionTitle>Funnel de conversión</SectionTitle>
          <div className="space-y-3">
            {data.por_estado.map(({ estado, count, valor_total }) => {
              const style = ESTADO_STYLES[estado as Estado] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:estado }
              const pct = Math.round((count / maxEstado) * 100)
              return (
                <div key={estado}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                      {style.label}
                    </span>
                    <div className="text-right">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                      {valor_total > 0 && <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>${valor_total.toLocaleString()}/mes</span>}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hi)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Tiempo promedio por etapa</SectionTitle>
          <div className="space-y-3">
            {data.tiempo_promedio_por_estado
              .filter(e => ESTADO_STYLES[e.estado])
              .sort((a, b) => ESTADOS_ORDEN_LOCAL.indexOf(a.estado) - ESTADOS_ORDEN_LOCAL.indexOf(b.estado))
              .map(({ estado, promedio_dias }) => {
                const style = ESTADO_STYLES[estado] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:estado }
                const pct = (promedio_dias / maxTiempo) * 100
                return (
                  <div key={estado}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                        {style.label}
                      </span>
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{promedio_dias}d</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hi)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </Panel>
      </div>

      {/* Zonas + Tipo de propiedad */}
      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionTitle>Zonas / Países con más leads</SectionTitle>
          <div className="space-y-2.5">
            {data.top_zonas.map(({ zona, count, valor }) => {
              const max = Math.max(...data.top_zonas.map(z => z.count), 1)
              return <HBar key={zona} label={zona} value={count} pct={(count/max)*100} sub={valor > 0 ? `$${valor.toLocaleString()}/mes` : undefined} />
            })}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Por tipo de propiedad</SectionTitle>
          <div className="space-y-2.5">
            {data.por_tipo_propiedad.map(({ tipo, count, valor }) => {
              const max = Math.max(...data.por_tipo_propiedad.map(t => t.count), 1)
              const label = TIPO_PROPIEDAD_LABELS[tipo as TipoPropiedad] ?? tipo
              return <HBar key={tipo} label={label} value={count} pct={(count/max)*100}
                colorStyle={{ background: 'var(--blue)' }} sub={valor > 0 ? `$${valor.toLocaleString()}/mes` : undefined} />
            })}
          </div>
        </Panel>
      </div>

      {/* Tipologías + País */}
      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionTitle>Tipologías de propiedad</SectionTitle>
          <div className="space-y-2.5">
            {data.por_tipologia.map(({ tipologia, count, valor }) => {
              const max = Math.max(...data.por_tipologia.map(t => t.count), 1)
              const label = TIPOLOGIA_LABELS[tipologia as Tipologia] ?? tipologia
              return <HBar key={tipologia} label={label} value={count} pct={(count/max)*100}
                colorStyle={{ background: 'var(--purple)' }} sub={valor > 0 ? `$${valor.toLocaleString()}/mes` : undefined} />
            })}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Leads por país</SectionTitle>
          <div className="space-y-2.5">
            {data.por_pais.map(({ pais, count, valor }) => {
              const max = Math.max(...data.por_pais.map(p => p.count), 1)
              return <HBar key={pais} label={pais} value={count} pct={(count/max)*100}
                colorStyle={{ background: '#34d399' }} sub={valor > 0 ? `$${valor.toLocaleString()}/mes` : undefined} />
            })}
          </div>
        </Panel>
      </div>

      {/* Por proyecto */}
      {data.por_proyecto.length > 0 && (
        <Panel>
          <SectionTitle>Leads por proyecto</SectionTitle>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            {data.por_proyecto.map(({ proyecto, count, valor }) => {
              const max = Math.max(...data.por_proyecto.map(p => p.count), 1)
              return <HBar key={proyecto} label={proyecto} value={count} pct={(count/max)*100}
                sub={valor > 0 ? `$${valor.toLocaleString()}/mes` : undefined} />
            })}
          </div>
        </Panel>
      )}

      {/* Cambios diarios */}
      <Panel>
        <div className="flex items-start justify-between mb-4">
          <SectionTitle>Cambios de estado — últimos 14 días</SectionTitle>
          <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            Total: {data.cambios_estado_diarios.reduce((s, d) => s + d.total, 0)} cambios
          </span>
        </div>
        <MiniBarChart data={data.cambios_estado_diarios} />
        <div className="mt-4 space-y-1.5">
          {data.cambios_estado_diarios
            .filter(d => d.total > 0)
            .slice(-5)
            .reverse()
            .map(d => (
              <div key={d.fecha} className="flex items-center gap-3">
                <span className="text-[11px] w-20 shrink-0" style={{ color: 'var(--text-dim)' }}>{d.fecha.slice(5)}</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(d.transiciones).map(([key, count]) => {
                    const [, a] = key.split('→')
                    const styleA = ESTADO_STYLES[a as Estado]
                    return (
                      <span key={key} className={clsx('text-[10px] px-2 py-0.5 rounded-full border', styleA?.bg, styleA?.text, styleA?.border)}>
                        {key} ({count})
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      </Panel>

      {/* Leads en riesgo */}
      <Panel>
        <SectionTitle>Leads en riesgo</SectionTitle>
        {data.leads_en_riesgo.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>¡Sin leads en riesgo!</p>
        ) : (
          <div className="space-y-2">
            {data.leads_en_riesgo.map(lead => {
              const style = ESTADO_STYLES[lead.estado] ?? { bg:'bg-white/5',text:'text-white/40',border:'border-white/10',label:lead.estado }
              const urgente = lead.dias_sin_contacto >= 14
              return (
                <div key={lead.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    border: `1px solid var(--border)`,
                    borderLeft: `2px solid ${urgente ? '#F20022' : '#D97706'}`,
                    background: 'var(--surface-hi)',
                  }}>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{lead.nombre}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{lead.propiedad}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                      {style.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[12px] font-semibold" style={{ color: urgente ? '#f87171' : '#D97706' }}>
                        {lead.dias_sin_contacto}d sin contacto
                      </p>
                      {lead.valor_mensual_estimado > 0 && (
                        <p className="text-[11px]" style={{ color: '#34d399' }}>${lead.valor_mensual_estimado.toLocaleString()}/mes</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
