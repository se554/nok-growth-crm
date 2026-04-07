'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Phone, Mail, MessageCircle, ChevronRight, Building2, Pencil, Paperclip, Upload, Trash2 } from 'lucide-react'
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
  nombre: string; cedula: string; nacionalidad: string; pais: string
  telefono: string; whatsapp: string; email: string; asignado_a: string
  banco: string; numero_cuenta: string; notas_rapidas: string; pendientes: string
  propiedad: string; zona: string; proyecto: string; apartamento: string
  tipo_propiedad: string; tipologia: string; numero_unidades: string
  valor_mensual_estimado: string; probabilidad: string; fuente: string
  prioridad: string; ejecucion_nok: boolean; presupuesto_aprobado: string
}

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildForm(data: any): FormState {
  return {
    nombre: data.nombre ?? '', cedula: data.cedula ?? '', nacionalidad: data.nacionalidad ?? '',
    pais: data.pais ?? '', telefono: data.telefono ?? '', whatsapp: data.whatsapp ?? '',
    email: data.email ?? '', asignado_a: data.asignado_a ?? '', banco: data.banco ?? '',
    numero_cuenta: data.numero_cuenta ?? '', notas_rapidas: data.notas_rapidas ?? '',
    pendientes: data.pendientes ?? '', propiedad: data.propiedad ?? '', zona: data.zona ?? '',
    proyecto: data.proyecto ?? '', apartamento: data.apartamento ?? '',
    tipo_propiedad: data.tipo_propiedad ?? '', tipologia: data.tipologia ?? '',
    numero_unidades: String(data.numero_unidades ?? 1),
    valor_mensual_estimado: data.valor_mensual_estimado ? String(data.valor_mensual_estimado) : '',
    probabilidad: String(data.probabilidad ?? 50), fuente: data.fuente ?? 'otro',
    prioridad: data.prioridad ?? 'na', ejecucion_nok: data.ejecucion_nok ?? false,
    presupuesto_aprobado: data.presupuesto_aprobado ? String(data.presupuesto_aprobado) : '',
  }
}

const inpStyle: React.CSSProperties = {
  width: '100%',
  fontSize: '13px',
  background: 'var(--surface-hi)',
  border: '1px solid var(--border-mid)',
  borderRadius: '8px',
  padding: '6px 10px',
  color: 'var(--text-primary)',
  outline: 'none',
}

function InfoGrid({ items }: { items: { label: string; value: string | null | undefined; highlight?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.filter(i => i.value).map(({ label, value, highlight }) => (
        <div key={label} className="rounded-xl p-3" style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
          <p className="text-[13px] font-medium" style={{ color: highlight ? 'var(--gold)' : 'var(--text-primary)' }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

function EF({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-xl p-3', className)}
      style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
      {children}
    </div>
  )
}

function InpF({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={inpStyle}
      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
    />
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
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        nombre: form.nombre, cedula: form.cedula || null, nacionalidad: form.nacionalidad || null,
        pais: form.pais || null, telefono: form.telefono || null, whatsapp: form.whatsapp || null,
        email: form.email || null, asignado_a: form.asignado_a || null, banco: form.banco || null,
        numero_cuenta: form.numero_cuenta || null, notas_rapidas: form.notas_rapidas || null,
        pendientes: form.pendientes || null, propiedad: form.propiedad, zona: form.zona || null,
        proyecto: form.proyecto || null, apartamento: form.apartamento || null,
        tipo_propiedad: form.tipo_propiedad || null, tipologia: form.tipologia || null,
        numero_unidades: parseInt(form.numero_unidades) || 1,
        valor_mensual_estimado: form.valor_mensual_estimado ? parseFloat(form.valor_mensual_estimado) : null,
        probabilidad: parseInt(form.probabilidad) || 50, fuente: form.fuente,
        prioridad: form.prioridad || 'na', ejecucion_nok: form.ejecucion_nok,
        presupuesto_aprobado: form.presupuesto_aprobado ? parseFloat(form.presupuesto_aprobado) : null,
      }),
    })
    setSaving(false)
    setEditing(false)
    fetchDetalle()
    onUpdated()
  }

  const uploadDocumento = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    await fetch(`/api/leads/${lead.id}/documentos`, { method: 'POST', body: fd })
    setUploading(false)
    fetchDetalle()
  }

  const toggleUrgente = async () => {
    const nuevaPrioridad = (detalle ?? lead).prioridad === 'alta' ? 'na' : 'alta'
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prioridad: nuevaPrioridad }),
    })
    fetchDetalle()
    onUpdated()
  }

  const eliminarLead = async () => {
    if (!confirm(`¿Eliminar "${lead.nombre}" del pipeline?\n\nEsto eliminará el lead y toda su hoja de vida. Esta acción no se puede deshacer.`)) return
    if (!confirm('¿Estás seguro? Esta acción es permanente.')) return
    setDeleting(true)
    await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
    setDeleting(false)
    onUpdated()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (detalle ?? lead) as any
  const style = ESTADO_STYLES[lead.estado] ?? ESTADO_STYLES['prospecto']
  const next = siguienteEstado()

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[500px] h-full flex flex-col shadow-2xl"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border-mid)' }}>

        {/* Header */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold"
                style={{ background: 'var(--surface-hi)', color: 'var(--text-muted)', border: '1px solid var(--border-mid)' }}>
                {getInitials(lead.nombre)}
              </div>
              <div>
                <h2 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{lead.nombre}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', style.bg, style.text, style.border)}>
                    {style.label}
                  </span>
                  {d.ejecucion_nok && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-mid)' }}>
                      NOK ejecuta
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hi)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={16} />
            </button>
          </div>

          {/* Contacto rápido */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {lead.telefono && (
              <a href={`tel:${lead.telefono}`}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Phone size={12} /> {lead.telefono}
              </a>
            )}
            {d.whatsapp && (
              <a href={`https://wa.me/${(d.whatsapp ?? '').replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
                style={{ color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                <MessageCircle size={12} /> WhatsApp
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Mail size={12} /> Email
              </a>
            )}
          </div>

          {/* Acciones de estado */}
          <div className="flex gap-2 mt-3">
            {next && (
              <button onClick={() => cambiarEstado(next)} disabled={updatingEstado}
                className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
                style={{ background: 'var(--gold)', color: '#1D1D1B' }}>
                Mover a {ESTADO_STYLES[next]?.label} <ChevronRight size={13} />
              </button>
            )}
            {lead.estado !== 'perdido' && lead.estado !== 'cerrado' && (
              <button onClick={toggleUrgente}
                className="text-[12px] px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color: d.prioridad === 'alta' ? '#f87171' : 'var(--text-muted)',
                  border: `1px solid ${d.prioridad === 'alta' ? 'rgba(242,0,34,0.45)' : 'var(--border-mid)'}`,
                  background: d.prioridad === 'alta' ? 'rgba(242,0,34,0.1)' : 'transparent',
                }}>
                {d.prioridad === 'alta' ? '🔥 Urgente' : 'Marcar urgente'}
              </button>
            )}
            {lead.estado !== 'perdido' && lead.estado !== 'cerrado' && (
              <button onClick={marcarPerdido} disabled={updatingEstado}
                className="text-[12px] px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
                style={{ color: '#f87171', border: '1px solid rgba(242,0,34,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(242,0,34,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Marcar perdido
              </button>
            )}
            <button onClick={eliminarLead} disabled={deleting}
              className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all ml-auto"
              style={{ color: '#f87171', border: '1px solid rgba(242,0,34,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(242,0,34,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Trash2 size={12} />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex flex-1">
            {([
              { id: 'hoja', label: 'Hoja de vida' },
              { id: 'propietario', label: 'Propietario' },
              { id: 'propiedad', label: 'Propiedad' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setEditing(false) }}
                className="py-3 px-1 mr-4 text-[12px] border-b-2 transition-all"
                style={{
                  borderBottomColor: tab === t.id ? 'var(--gold)' : 'transparent',
                  color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: tab === t.id ? 500 : 400,
                }}>
                {t.label}
              </button>
            ))}
          </div>
          {tab !== 'hoja' && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Pencil size={11} /> Editar
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Hoja de vida */}
          {tab === 'hoja' && (
            <div className="space-y-5">
              <div className="rounded-xl p-4" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Registrar actividad</p>
                <EventoForm leadId={lead.id} onEventoAdded={fetchDetalle} />
              </div>

              {/* Adjuntar documento */}
              <div className="rounded-xl p-4" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Adjuntar contrato / documento</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadDocumento(file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-[12px] w-full rounded-xl px-4 py-3 transition-all disabled:opacity-50"
                  style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-mid)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {uploading ? (
                    <><Upload size={13} className="animate-bounce" /> Subiendo...</>
                  ) : (
                    <><Paperclip size={13} /> Seleccionar archivo (PDF, DOC, imagen)</>
                  )}
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full animate-pulse shrink-0" style={{ background: 'var(--surface-hi)' }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded animate-pulse w-24" style={{ background: 'var(--surface-hi)' }} />
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-hi)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HojaDeVida eventos={detalle?.eventos ?? []} />
              )}
            </div>
          )}

          {/* Propietario */}
          {tab === 'propietario' && (
            <div className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EF label="Nombre completo" className="col-span-2"><InpF value={form.nombre} onChange={v => setF('nombre', v)} /></EF>
                    <EF label="Cédula / Pasaporte"><InpF value={form.cedula} onChange={v => setF('cedula', v)} /></EF>
                    <EF label="Nacionalidad"><InpF value={form.nacionalidad} onChange={v => setF('nacionalidad', v)} /></EF>
                    <EF label="País de residencia"><InpF value={form.pais} onChange={v => setF('pais', v)} /></EF>
                    <EF label="Asignado a"><InpF value={form.asignado_a} onChange={v => setF('asignado_a', v)} /></EF>
                    <EF label="Teléfono"><InpF value={form.telefono} onChange={v => setF('telefono', v)} /></EF>
                    <EF label="WhatsApp"><InpF value={form.whatsapp} onChange={v => setF('whatsapp', v)} /></EF>
                    <EF label="Email" className="col-span-2"><InpF value={form.email} onChange={v => setF('email', v)} /></EF>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: 'rgba(214,167,0,0.06)', border: '1px solid rgba(214,167,0,0.2)' }}>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--gold)' }}>Datos bancarios</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-dim)' }}>Banco</p>
                        <InpF value={form.banco} onChange={v => setF('banco', v)} />
                      </div>
                      <div>
                        <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-dim)' }}>Número de cuenta</p>
                        <InpF value={form.numero_cuenta} onChange={v => setF('numero_cuenta', v)} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-3" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-dim)' }}>Notas</p>
                    <textarea style={{ ...inpStyle, resize: 'none' }} rows={3}
                      value={form.notas_rapidas} onChange={e => setF('notas_rapidas', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(214,167,0,0.06)', border: '1px solid rgba(214,167,0,0.2)' }}>
                    <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--gold)' }}>Pendientes</p>
                    <textarea style={{ ...inpStyle, resize: 'none' }} rows={2}
                      value={form.pendientes} onChange={e => setF('pendientes', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
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
                    <div className="rounded-xl p-4" style={{ background: 'rgba(214,167,0,0.06)', border: '1px solid rgba(214,167,0,0.2)' }}>
                      <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--gold)' }}>Datos bancarios</p>
                      <div className="grid grid-cols-2 gap-2">
                        {d.banco && <div><p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Banco</p><p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{d.banco}</p></div>}
                        {d.numero_cuenta && <div><p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Cuenta</p><p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{d.numero_cuenta}</p></div>}
                      </div>
                    </div>
                  )}
                  {d.notas_rapidas && (
                    <div className="rounded-xl p-3" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-dim)' }}>Notas</p>
                      <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.notas_rapidas}</p>
                    </div>
                  )}
                  {d.pendientes && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(214,167,0,0.06)', border: '1px solid rgba(214,167,0,0.2)' }}>
                      <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--gold)' }}>Pendientes</p>
                      <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.pendientes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Propiedad */}
          {tab === 'propiedad' && (
            <div className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EF label="Nombre de la propiedad" className="col-span-2"><InpF value={form.propiedad} onChange={v => setF('propiedad', v)} /></EF>
                    <EF label="Proyecto"><InpF value={form.proyecto} onChange={v => setF('proyecto', v)} /></EF>
                    <EF label="Apartamento / Unidad"><InpF value={form.apartamento} onChange={v => setF('apartamento', v)} /></EF>
                    <EF label="Zona">
                      <select style={{ ...inpStyle, colorScheme: 'dark' }} value={form.zona} onChange={e => setF('zona', e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}>
                        <option value="">Sin zona</option>
                        {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </EF>
                    <EF label="País"><InpF value={form.pais} onChange={v => setF('pais', v)} /></EF>
                    <EF label="Tipo de propiedad">
                      <select style={{ ...inpStyle, colorScheme: 'dark' }} value={form.tipo_propiedad} onChange={e => setF('tipo_propiedad', e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}>
                        <option value="">Sin tipo</option>
                        {Object.entries(TIPO_PROPIEDAD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </EF>
                    <EF label="Tipología">
                      <select style={{ ...inpStyle, colorScheme: 'dark' }} value={form.tipologia} onChange={e => setF('tipologia', e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}>
                        <option value="">Sin tipología</option>
                        {Object.entries(TIPOLOGIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </EF>
                    <EF label="Nº de unidades"><InpF type="number" value={form.numero_unidades} onChange={v => setF('numero_unidades', v)} /></EF>
                    <EF label="Valor mensual estimado ($)"><InpF type="number" value={form.valor_mensual_estimado} onChange={v => setF('valor_mensual_estimado', v)} /></EF>
                    <EF label="Probabilidad de cierre (%)"><InpF type="number" value={form.probabilidad} onChange={v => setF('probabilidad', v)} /></EF>
                    <EF label="Presupuesto aprobado ($)"><InpF type="number" value={form.presupuesto_aprobado} onChange={v => setF('presupuesto_aprobado', v)} /></EF>
                    <EF label="Fuente del lead">
                      <select style={{ ...inpStyle, colorScheme: 'dark' }} value={form.fuente} onChange={e => setF('fuente', e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}>
                        {['referido','instagram','web','llamada','whatsapp','otro'].map(f => (
                          <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                        ))}
                      </select>
                    </EF>
                    <EF label="Prioridad">
                      <select style={{ ...inpStyle, colorScheme: 'dark' }} value={form.prioridad} onChange={e => setF('prioridad', e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                        <option value="na">N/A</option>
                      </select>
                    </EF>
                  </div>

                  <div className="rounded-xl p-4 cursor-pointer transition-all"
                    style={{ background: form.ejecucion_nok ? 'var(--gold-dim)' : 'var(--surface-el)', border: `1px solid ${form.ejecucion_nok ? 'var(--gold-mid)' : 'var(--border)'}` }}
                    onClick={() => setF('ejecucion_nok', !form.ejecucion_nok)}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full transition-colors"
                        style={{ background: form.ejecucion_nok ? 'var(--gold)' : 'var(--text-dim)' }} />
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {form.ejecucion_nok ? 'NOK ejecuta la compra de esta propiedad' : 'El propietario gestiona la propiedad'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl p-4 flex gap-3" style={{ background: 'var(--surface-el)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)' }}>
                      <Building2 size={18} style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{d.propiedad}</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{d.zona ?? ''}{d.zona && d.pais ? ' · ' : ''}{d.pais}</p>
                    </div>
                  </div>

                  <InfoGrid items={[
                    { label: 'Proyecto', value: d.proyecto },
                    { label: 'Apartamento / Unidad', value: d.apartamento },
                    { label: 'Tipo de propiedad', value: d.tipo_propiedad ? (TIPO_PROPIEDAD_LABELS as Record<string,string>)[d.tipo_propiedad] : null },
                    { label: 'Tipología', value: d.tipologia ? (TIPOLOGIA_LABELS as Record<string,string>)[d.tipologia] : null },
                    { label: 'Zona', value: d.zona },
                    { label: 'País', value: d.pais },
                    { label: 'Número de unidades', value: String(d.numero_unidades) },
                    { label: 'Valor mensual estimado', value: d.valor_mensual_estimado ? `$${d.valor_mensual_estimado.toLocaleString()}` : null, highlight: true },
                    { label: 'Presupuesto aprobado', value: d.presupuesto_aprobado ? `$${d.presupuesto_aprobado.toLocaleString()}` : null, highlight: true },
                    { label: 'Probabilidad de cierre', value: `${d.probabilidad}%` },
                    { label: 'Fuente del lead', value: d.fuente },
                    { label: 'Días sin contacto', value: `${lead.dias_sin_contacto ?? 0} días` },
                    { label: 'Prioridad', value: d.prioridad ? (d.prioridad.charAt(0).toUpperCase() + d.prioridad.slice(1)) : null },
                  ]} />

                  <div className="rounded-xl p-4" style={{ background: d.ejecucion_nok ? 'var(--gold-dim)' : 'var(--surface-el)', border: `1px solid ${d.ejecucion_nok ? 'var(--gold-mid)' : 'var(--border)'}` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.ejecucion_nok ? 'var(--gold)' : 'var(--text-dim)' }} />
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {d.ejecucion_nok ? 'NOK ejecuta la compra de esta propiedad' : 'El propietario gestiona la propiedad'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {editing && (
          <div className="px-5 py-3 flex gap-2 shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <button onClick={guardar} disabled={saving}
              className="flex-1 btn-gold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={() => { fetchDetalle(); setEditing(false) }}
              className="text-[13px] px-4 py-2 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hi)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
