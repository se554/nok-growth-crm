'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Mail, MessageCircle, ChevronRight, Building2, Pencil } from 'lucide-react'
import { clsx } from 'clsx'
import type { LeadConActividad, LeadDetalle, Estado } from '@/lib/types'
import { ESTADO_STYLES, ESTADOS_ORDEN, TIPO_PROPIEDAD_LABELS, TIPOLOGIA_LABELS, ZONAS } from '@/lib/types'
import HojaDeVida from './HojaDeVida'
import EventoForm from './EventoForm'

interface Props {
  lead: LeadConActividad
  onClose: () => void
  onUpdated: () => void
}

interface FormState {
  nombre: string
  cedula: string
  nacionalidad: string
  pais: string
  telefono: string
  whatsapp: string
  email: string
  asignado_a: string
  banco: string
  numero_cuenta: string
  notas_rapidas: string
  pendientes: string
  propiedad: string
  zona: string
  proyecto: string
  apartamento: string
  tipo_propiedad: string
  tipologia: string
  numero_unidades: string
  valor_mensual_estimado: string
  probabilidad: string
  fuente: string
  prioridad: string
  ejecucion_nok: boolean
}

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildForm(data: any): FormState {
  return {
    nombre: data.nombre ?? '',
    cedula: data.cedula ?? '',
    nacionalidad: data.nacionalidad ?? '',
    pais: data.pais ?? '',
    telefono: data.telefono ?? '',
    whatsapp: data.whatsapp ?? '',
    email: data.email ?? '',
    asignado_a: data.asignado_a ?? '',
    banco: data.banco ?? '',
    numero_cuenta: data.numero_cuenta ?? '',
    notas_rapidas: data.notas_rapidas ?? '',
    pendientes: data.pendientes ?? '',
    propiedad: data.propiedad ?? '',
    zona: data.zona ?? '',
    proyecto: data.proyecto ?? '',
    apartamento: data.apartamento ?? '',
    tipo_propiedad: data.tipo_propiedad ?? '',
    tipologia: data.tipologia ?? '',
    numero_unidades: String(data.numero_unidades ?? 1),
    valor_mensual_estimado: data.valor_mensual_estimado ? String(data.valor_mensual_estimado) : '',
    probabilidad: String(data.probabilidad ?? 50),
    fuente: data.fuente ?? 'otro',
    prioridad: data.prioridad ?? 'na',
    ejecucion_nok: data.ejecucion_nok ?? false,
  }
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

const inp = "w-full bg-white border border-[#E8E6E0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C] transition-colors"

function EF({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-[#F5F3EE] rounded-xl p-3', className)}>
      <p className="text-[10px] text-[#6B6B6B] mb-0.5">{label}</p>
      {children}
    </div>
  )
}

export default function LeadDetailDrawer({ lead, onClose, onUpdated }: Props) {
  const [detalle, setDetalle] = useState<LeadDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'hoja' | 'propietario' | 'propiedad'>('hoja')
  const [updatingEstado, setUpdatingEstado] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(buildForm(lead))

  const setF = (field: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const fetchDetalle = async () => {
    const res = await fetch(`/api/leads/${lead.id}`)
    if (res.ok) {
      const data = await res.json()
      setDetalle(data)
      setForm(buildForm(data))
    }
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

  const guardar = async () => {
    setSaving(true)
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        cedula: form.cedula || null,
        nacionalidad: form.nacionalidad || null,
        pais: form.pais || null,
        telefono: form.telefono || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        asignado_a: form.asignado_a || null,
        banco: form.banco || null,
        numero_cuenta: form.numero_cuenta || null,
        notas_rapidas: form.notas_rapidas || null,
        pendientes: form.pendientes || null,
        propiedad: form.propiedad,
        zona: form.zona || null,
        proyecto: form.proyecto || null,
        apartamento: form.apartamento || null,
        tipo_propiedad: form.tipo_propiedad || null,
        tipologia: form.tipologia || null,
        numero_unidades: parseInt(form.numero_unidades) || 1,
        valor_mensual_estimado: form.valor_mensual_estimado ? parseFloat(form.valor_mensual_estimado) : null,
        probabilidad: parseInt(form.probabilidad) || 50,
        fuente: form.fuente,
        prioridad: form.prioridad || 'na',
        ejecucion_nok: form.ejecucion_nok,
      }),
    })
    setSaving(false)
    setEditing(false)
    fetchDetalle()
    onUpdated()
  }

  const cancelar = () => {
    fetchDetalle()
    setEditing(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (detalle ?? lead) as any
  const style = ESTADO_STYLES[lead.estado] ?? ESTADO_STYLES['prospecto']
  const next = siguienteEstado()

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
                  {d.ejecucion_nok && (
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
            {d.whatsapp && (
              <a href={`https://wa.me/${(d.whatsapp ?? '').replace(/\D/g,'')}`}
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
                Mover a {ESTADO_STYLES[next]?.label} <ChevronRight size={13} />
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

        {/* Tabs + botón editar */}
        <div className="flex items-center border-b border-[#E8E6E0] px-5">
          <div className="flex flex-1">
            {([
              { id: 'hoja', label: 'Hoja de vida' },
              { id: 'propietario', label: 'Propietario' },
              { id: 'propiedad', label: 'Propiedad' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setEditing(false) }}
                className={clsx('py-3 px-1 mr-4 text-[12px] border-b-2 transition-all',
                  tab === t.id ? 'border-[#C9A84C] text-[#1A1A1A] font-medium' : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                )}>
                {t.label}
              </button>
            ))}
          </div>
          {tab !== 'hoja' && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] hover:text-[#C9A84C] border border-[#E8E6E0] px-2.5 py-1.5 rounded-lg transition-all">
              <Pencil size={11} /> Editar
            </button>
          )}
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
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EF label="Nombre completo" className="col-span-2">
                      <input className={inp} value={form.nombre} onChange={e => setF('nombre', e.target.value)} />
                    </EF>
                    <EF label="Cédula / Pasaporte">
                      <input className={inp} value={form.cedula} onChange={e => setF('cedula', e.target.value)} />
                    </EF>
                    <EF label="Nacionalidad">
                      <input className={inp} value={form.nacionalidad} onChange={e => setF('nacionalidad', e.target.value)} />
                    </EF>
                    <EF label="País de residencia">
                      <input className={inp} value={form.pais} onChange={e => setF('pais', e.target.value)} />
                    </EF>
                    <EF label="Asignado a">
                      <input className={inp} value={form.asignado_a} onChange={e => setF('asignado_a', e.target.value)} />
                    </EF>
                    <EF label="Teléfono">
                      <input className={inp} value={form.telefono} onChange={e => setF('telefono', e.target.value)} />
                    </EF>
                    <EF label="WhatsApp">
                      <input className={inp} value={form.whatsapp} onChange={e => setF('whatsapp', e.target.value)} />
                    </EF>
                    <EF label="Email" className="col-span-2">
                      <input className={inp} value={form.email} onChange={e => setF('email', e.target.value)} />
                    </EF>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-amber-700 mb-2">Datos bancarios</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-amber-600 mb-0.5">Banco</p>
                        <input className={inp} value={form.banco} onChange={e => setF('banco', e.target.value)} />
                      </div>
                      <div>
                        <p className="text-[10px] text-amber-600 mb-0.5">Número de cuenta</p>
                        <input className={inp} value={form.numero_cuenta} onChange={e => setF('numero_cuenta', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F3EE] border border-[#E8E6E0] rounded-xl p-3">
                    <p className="text-[10px] text-[#6B6B6B] mb-1">Notas</p>
                    <textarea className={clsx(inp, 'resize-none')} rows={3}
                      value={form.notas_rapidas} onChange={e => setF('notas_rapidas', e.target.value)} />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-[10px] text-amber-600 mb-1 font-semibold">Pendientes</p>
                    <textarea className={clsx(inp, 'resize-none')} rows={2}
                      value={form.pendientes} onChange={e => setF('pendientes', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <InfoGrid items={[
                    { label: 'Nombre completo', value: d.nombre },
                    { label: 'Cédula / Pasaporte', value: d.cedula },
                    { label: 'Nacionalidad', value: d.nacionalidad },
                    { label: 'País de residencia', value: d.pais },
                    { label: 'Teléfono', value: d.telefono },
                    { label: 'WhatsApp', value: d.whatsapp },
                    { label: 'Email', value: d.email },
                    { label: 'Asignado a', value: d.asignado_a },
                  ]} />

                  {(d.banco || d.numero_cuenta) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-[11px] font-semibold text-amber-700 mb-2">Datos bancarios</p>
                      <div className="grid grid-cols-2 gap-2">
                        {d.banco && (
                          <div>
                            <p className="text-[10px] text-amber-600">Banco</p>
                            <p className="text-[13px] font-medium text-[#1A1A1A]">{d.banco}</p>
                          </div>
                        )}
                        {d.numero_cuenta && (
                          <div>
                            <p className="text-[10px] text-amber-600">Número de cuenta</p>
                            <p className="text-[13px] font-medium text-[#1A1A1A]">{d.numero_cuenta}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {d.notas_rapidas && (
                    <div className="bg-[#F5F3EE] border border-[#E8E6E0] rounded-xl p-3">
                      <p className="text-[10px] text-[#6B6B6B] mb-1">Notas</p>
                      <p className="text-[13px] text-[#1A1A1A]">{d.notas_rapidas}</p>
                    </div>
                  )}
                  {d.pendientes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-[10px] text-amber-600 mb-1 font-semibold">Pendientes</p>
                      <p className="text-[13px] text-[#1A1A1A]">{d.pendientes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB: Propiedad */}
          {tab === 'propiedad' && (
            <div className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EF label="Nombre de la propiedad" className="col-span-2">
                      <input className={inp} value={form.propiedad} onChange={e => setF('propiedad', e.target.value)} />
                    </EF>
                    <EF label="Proyecto">
                      <input className={inp} value={form.proyecto} onChange={e => setF('proyecto', e.target.value)} />
                    </EF>
                    <EF label="Apartamento / Unidad">
                      <input className={inp} value={form.apartamento} onChange={e => setF('apartamento', e.target.value)} />
                    </EF>
                    <EF label="Zona">
                      <select className={inp} value={form.zona} onChange={e => setF('zona', e.target.value)}>
                        <option value="">Sin zona</option>
                        {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </EF>
                    <EF label="País">
                      <input className={inp} value={form.pais} onChange={e => setF('pais', e.target.value)} />
                    </EF>
                    <EF label="Tipo de propiedad">
                      <select className={inp} value={form.tipo_propiedad} onChange={e => setF('tipo_propiedad', e.target.value)}>
                        <option value="">Sin tipo</option>
                        {Object.entries(TIPO_PROPIEDAD_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </EF>
                    <EF label="Tipología">
                      <select className={inp} value={form.tipologia} onChange={e => setF('tipologia', e.target.value)}>
                        <option value="">Sin tipología</option>
                        {Object.entries(TIPOLOGIA_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </EF>
                    <EF label="Nº de unidades">
                      <input type="number" min="1" className={inp} value={form.numero_unidades}
                        onChange={e => setF('numero_unidades', e.target.value)} />
                    </EF>
                    <EF label="Valor mensual estimado ($)">
                      <input type="number" className={inp} value={form.valor_mensual_estimado}
                        onChange={e => setF('valor_mensual_estimado', e.target.value)} />
                    </EF>
                    <EF label="Probabilidad de cierre (%)">
                      <input type="number" min="0" max="100" className={inp} value={form.probabilidad}
                        onChange={e => setF('probabilidad', e.target.value)} />
                    </EF>
                    <EF label="Fuente del lead">
                      <select className={inp} value={form.fuente} onChange={e => setF('fuente', e.target.value)}>
                        {['referido','instagram','web','llamada','whatsapp','otro'].map(f => (
                          <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                        ))}
                      </select>
                    </EF>
                    <EF label="Prioridad">
                      <select className={inp} value={form.prioridad} onChange={e => setF('prioridad', e.target.value)}>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                        <option value="na">N/A</option>
                      </select>
                    </EF>
                  </div>

                  <div
                    className={clsx('rounded-xl p-4 border cursor-pointer transition-all',
                      form.ejecucion_nok ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30' : 'bg-[#F5F3EE] border-[#E8E6E0]'
                    )}
                    onClick={() => setF('ejecucion_nok', !form.ejecucion_nok)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={clsx('w-3 h-3 rounded-full transition-colors', form.ejecucion_nok ? 'bg-[#C9A84C]' : 'bg-[#6B6B6B]')} />
                      <p className="text-[13px] font-medium text-[#1A1A1A]">
                        {form.ejecucion_nok ? 'NOK ejecuta la compra de esta propiedad' : 'El propietario gestiona la propiedad'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#F5F3EE] rounded-xl p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E0] flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">{d.propiedad}</p>
                      <p className="text-[12px] text-[#6B6B6B]">{d.zona ?? ''}{d.zona && d.pais ? ' · ' : ''}{d.pais}</p>
                    </div>
                  </div>

                  <InfoGrid items={[
                    { label: 'Proyecto', value: d.proyecto },
                    { label: 'Apartamento / Unidad', value: d.apartamento },
                    { label: 'Tipo de propiedad', value: d.tipo_propiedad ? (TIPO_PROPIEDAD_LABELS as Record<string, string>)[d.tipo_propiedad] : null },
                    { label: 'Tipología', value: d.tipologia ? (TIPOLOGIA_LABELS as Record<string, string>)[d.tipologia] : null },
                    { label: 'Zona', value: d.zona },
                    { label: 'País', value: d.pais },
                    { label: 'Número de unidades', value: String(d.numero_unidades) },
                    { label: 'Valor mensual estimado', value: d.valor_mensual_estimado ? `$${d.valor_mensual_estimado.toLocaleString()}` : null, highlight: true },
                    { label: 'Probabilidad de cierre', value: `${d.probabilidad}%` },
                    { label: 'Fuente del lead', value: d.fuente },
                    { label: 'Días sin contacto', value: `${lead.dias_sin_contacto ?? 0} días` },
                    { label: 'Prioridad', value: d.prioridad ? (d.prioridad.charAt(0).toUpperCase() + d.prioridad.slice(1)) : null },
                  ]} />

                  <div className={clsx('rounded-xl p-4 border', d.ejecucion_nok ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30' : 'bg-[#F5F3EE] border-[#E8E6E0]')}>
                    <div className="flex items-center gap-2">
                      <div className={clsx('w-3 h-3 rounded-full', d.ejecucion_nok ? 'bg-[#C9A84C]' : 'bg-[#6B6B6B]')} />
                      <p className="text-[13px] font-medium text-[#1A1A1A]">
                        {d.ejecucion_nok ? 'NOK ejecuta la compra de esta propiedad' : 'El propietario gestiona la propiedad'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer guardar/cancelar */}
        {editing && (
          <div className="px-5 py-3 border-t border-[#E8E6E0] flex gap-2 bg-white">
            <button onClick={guardar} disabled={saving}
              className="flex-1 text-[13px] font-medium bg-[#C9A84C] text-white py-2 rounded-lg hover:bg-[#b8963f] disabled:opacity-50 transition-all">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={cancelar}
              className="text-[13px] text-[#6B6B6B] border border-[#E8E6E0] px-4 py-2 rounded-lg hover:bg-[#F5F3EE] transition-all">
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
