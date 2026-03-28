'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Mail, MessageCircle, ChevronRight, Building2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { LeadConActividad, LeadDetalle, Estado } from '@/lib/types'
import { ESTADO_STYLES, ESTADOS_ORDEN, TIPO_PROPIEDAD_LABELS, TIPOLOGIA_LABELS } from '@/lib/types'
import type { TipoPropiedad, Tipologia, Prioridad } from '@/lib/types'
import HojaDeVida from './HojaDeVida'
import EventoForm from './EventoForm'

interface Props {
  lead: LeadConActividad
  onClose: () => void
  onUpdated: () => void
}

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function InfoGrid({ items }: { items: { label: string; value: string | null | undefined; highlight?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.filter(i => i.value).map(({ label, value, highlight }) => (
        <div key={label} className="bg-[#F5F3EE] rounded-xl p-3">
          <p className="text-[10px] text-[#6B6B6B] mb-0.5">{label}</p>
          <p className={clsx('text-[13px] font-medium', highlight ? 'text-[#C9A84C]' : 'text-[#1A1A1A]')}>{value}</p>
        </div>
      ))}
    </div>
  )
}

export default function LeadDetailDrawer({ lead, onClose, onUpdated }: Props) {
  const [detalle, setDetalle] = useState<LeadDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'hoja' | 'propietario' | 'propiedad'>('hoja')
  const [updatingEstado, setUpdatingEstado] = useState(false)

  const fetchDetalle = async () => {
    const res = await fetch(`/api/leads/${lead.id}`)
    if (res.ok) setDetalle(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchDetalle() }, [lead.id])

  const siguienteEstado = (): Estado | null => {
    const idx = ESTADOS_ORDEN.indexOf(lead.estado)
    if (idx === -1 || idx >= ESTADOS_ORDEN.length - 2) return null
    return ESTADOS_ORDEN[idx + 1]
  }

  const cambiarEstado = async (nuevoEstado: Estado) => {
    setUpdatingEstado(true)
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado, estado_anterior: lead.estado }),
    })
    setUpdatingEstado(false)
    onUpdated()
  }

  const marcarPerdido = async () => {
    if (!confirm('¿Marcar este lead como perdido?')) return
    await cambiarEstado('perdido')
  }

  const style = ESTADO_STYLES[lead.estado]
  const next = siguienteEstado()
  const d = detalle ?? lead

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-[500px] bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E6E0]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold', style.bg, style.text)}>
                {getInitials(lead.nombre)}
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{lead.nombre}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                    {style.label}
                  </span>
                  {(d as LeadConActividad).ejecucion_nok && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 font-medium">
                      NOK ejecuta
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F5F3EE] rounded-lg transition-all">
              <X size={16} className="text-[#6B6B6B]" />
            </button>
          </div>

          {/* Contacto rápido */}
          <div className="flex gap-2 mt-3">
            {lead.telefono && (
              <a href={`tel:${lead.telefono}`} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] hover:text-[#C9A84C] border border-[#E8E6E0] px-2.5 py-1.5 rounded-lg transition-all">
                <Phone size={12} /> {lead.telefono}
              </a>
            )}
            {(d as LeadDetalle & { whatsapp?: string }).whatsapp && (
              <a href={`https://wa.me/${((d as LeadDetalle & { whatsapp?: string }).whatsapp ?? '').replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-green-600 hover:text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg transition-all">
                <MessageCircle size={12} /> WhatsApp
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] hover:text-[#C9A84C] border border-[#E8E6E0] px-2.5 py-1.5 rounded-lg transition-all">
                <Mail size={12} /> Email
              </a>
            )}
          </div>

          {/* Acciones de estado */}
          <div className="flex gap-2 mt-3">
            {next && (
              <button onClick={() => cambiarEstado(next)} disabled={updatingEstado}
                className="flex items-center gap-1 text-[12px] bg-[#C9A84C] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8963f] disabled:opacity-50 transition-all">
                Mover a {ESTADO_STYLES[next].label} <ChevronRight size={13} />
              </button>
            )}
            {lead.estado !== 'perdido' && lead.estado !== 'cerrado' && (
              <button onClick={marcarPerdido} disabled={updatingEstado}
                className="text-[12px] text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all">
                Marcar perdido
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8E6E0] px-5">
          {([
            { id: 'hoja', label: 'Hoja de vida' },
            { id: 'propietario', label: 'Propietario' },
            { id: 'propiedad', label: 'Propiedad' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx('py-3 px-1 mr-4 text-[12px] border-b-2 transition-all',
                tab === t.id ? 'border-[#C9A84C] text-[#1A1A1A] font-medium' : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* TAB: Hoja de vida */}
          {tab === 'hoja' && (
            <div className="space-y-5">
              <div className="bg-[#F5F3EE] rounded-xl p-4">
                <p className="text-[12px] font-medium text-[#1A1A1A] mb-3">Registrar actividad</p>
                <EventoForm leadId={lead.id} onEventoAdded={fetchDetalle} />
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8E6E0] animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-[#E8E6E0] rounded animate-pulse w-24" />
                        <div className="h-4 bg-[#E8E6E0] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HojaDeVida eventos={detalle?.eventos ?? []} />
              )}
            </div>
          )}

          {/* TAB: Propietario */}
          {tab === 'propietario' && (
            <div className="space-y-4">
              <InfoGrid items={[
                { label: 'Nombre completo', value: lead.nombre },
                { label: 'Cédula / Pasaporte', value: (d as LeadDetalle & { cedula?: string }).cedula },
                { label: 'Nacionalidad', value: (d as LeadDetalle & { nacionalidad?: string }).nacionalidad },
                { label: 'País de residencia', value: (d as LeadDetalle & { pais?: string }).pais },
                { label: 'Teléfono', value: lead.telefono },
                { label: 'WhatsApp', value: (d as LeadDetalle & { whatsapp?: string }).whatsapp },
                { label: 'Email', value: lead.email },
                { label: 'Asignado a', value: lead.asignado_a },
              ]} />

              {/* Datos bancarios */}
              {((d as LeadDetalle & { banco?: string }).banco || (d as LeadDetalle & { numero_cuenta?: string }).numero_cuenta) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-amber-700 mb-2">Datos bancarios</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(d as LeadDetalle & { banco?: string }).banco && (
                      <div>
                        <p className="text-[10px] text-amber-600">Banco</p>
                        <p className="text-[13px] font-medium text-[#1A1A1A]">{(d as LeadDetalle & { banco?: string }).banco}</p>
                      </div>
                    )}
                    {(d as LeadDetalle & { numero_cuenta?: string }).numero_cuenta && (
                      <div>
                        <p className="text-[10px] text-amber-600">Número de cuenta</p>
                        <p className="text-[13px] font-medium text-[#1A1A1A]">{(d as LeadDetalle & { numero_cuenta?: string }).numero_cuenta}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lead.notas_rapidas && (
                <div className="bg-[#F5F3EE] border border-[#E8E6E0] rounded-xl p-3">
                  <p className="text-[10px] text-[#6B6B6B] mb-1">Notas</p>
                  <p className="text-[13px] text-[#1A1A1A]">{lead.notas_rapidas}</p>
                </div>
              )}
              {(d as LeadDetalle & { pendientes?: string }).pendientes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] text-amber-600 mb-1 font-semibold">Pendientes</p>
                  <p className="text-[13px] text-[#1A1A1A]">{(d as LeadDetalle & { pendientes?: string }).pendientes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Propiedad */}
          {tab === 'propiedad' && (
            <div className="space-y-4">
              {/* Header propiedad */}
              <div className="bg-[#F5F3EE] rounded-xl p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E0] flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">{lead.propiedad}</p>
                  <p className="text-[12px] text-[#6B6B6B]">{lead.zona ?? ''}{lead.zona && (d as LeadDetalle & { pais?: string }).pais ? ' · ' : ''}{(d as LeadDetalle & { pais?: string }).pais}</p>
                </div>
              </div>

              <InfoGrid items={[
                { label: 'Proyecto', value: (d as LeadDetalle & { proyecto?: string }).proyecto },
                { label: 'Apartamento / Unidad', value: (d as LeadDetalle & { apartamento?: string }).apartamento },
                { label: 'Tipo de propiedad', value: (d as LeadDetalle & { tipo_propiedad?: TipoPropiedad }).tipo_propiedad ? TIPO_PROPIEDAD_LABELS[(d as LeadDetalle & { tipo_propiedad?: TipoPropiedad }).tipo_propiedad!] : null },
                { label: 'Tipología', value: (d as LeadDetalle & { tipologia?: Tipologia }).tipologia ? TIPOLOGIA_LABELS[(d as LeadDetalle & { tipologia?: Tipologia }).tipologia!] : null },
                { label: 'Zona', value: lead.zona },
                { label: 'País', value: (d as LeadDetalle & { pais?: string }).pais },
                { label: 'Número de unidades', value: String(lead.numero_unidades) },
                { label: 'Valor mensual estimado', value: lead.valor_mensual_estimado ? `$${lead.valor_mensual_estimado.toLocaleString()}` : null, highlight: true },
                { label: 'Probabilidad de cierre', value: `${lead.probabilidad}%` },
                { label: 'Fuente del lead', value: lead.fuente },
                { label: 'Días sin contacto', value: `${lead.dias_sin_contacto ?? 0} días` },
                { label: 'Prioridad', value: (d as LeadDetalle & { prioridad?: Prioridad }).prioridad ? ((d as LeadDetalle & { prioridad?: Prioridad }).prioridad!.charAt(0).toUpperCase() + (d as LeadDetalle & { prioridad?: Prioridad }).prioridad!.slice(1)) : null },
              ]} />

              {/* NOK ejecuta */}
              <div className={clsx(
                'rounded-xl p-4 border',
                (d as LeadDetalle & { ejecucion_nok?: boolean }).ejecucion_nok
                  ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30'
                  : 'bg-[#F5F3EE] border-[#E8E6E0]'
              )}>
                <div className="flex items-center gap-2">
                  <div className={clsx('w-3 h-3 rounded-full', (d as LeadDetalle & { ejecucion_nok?: boolean }).ejecucion_nok ? 'bg-[#C9A84C]' : 'bg-[#6B6B6B]')} />
                  <p className="text-[13px] font-medium text-[#1A1A1A]">
                    {(d as LeadDetalle & { ejecucion_nok?: boolean }).ejecucion_nok
                      ? 'NOK ejecuta la compra de esta propiedad'
                      : 'El propietario gestiona la propiedad'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
