'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Estado, Fuente, TipoPropiedad, Tipologia, Prioridad } from '@/lib/types'
import { ZONAS, TIPO_PROPIEDAD_LABELS, TIPOLOGIA_LABELS } from '@/lib/types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const TIPOLOGIAS_POR_TIPO: Record<string, Tipologia[]> = {
  apartamento: ['studio','1_hab','2_hab','3_hab','4_hab_plus'],
  villa: ['villa_pequena','villa_grande'],
  penthouse: ['penthouse'],
  local_comercial: ['local'],
  casa: ['1_hab','2_hab','3_hab','4_hab_plus'],
  otro: ['otro'],
}

const inpStyle: React.CSSProperties = {
  width: '100%',
  fontSize: '13px',
  background: 'var(--surface-hi)',
  border: '1px solid var(--border-mid)',
  borderRadius: '10px',
  padding: '7px 12px',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

function Inp({ value, onChange, placeholder, type = 'text', required = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={inpStyle}
      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
    />
  )
}

function Sel({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inpStyle, colorScheme: 'dark' }}
      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
    >
      {children}
    </select>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
      style={{ color: 'var(--gold)' }}>
      {children}
    </p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
      {children}
    </label>
  )
}

export default function AddLeadModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', telefono: '', whatsapp: '', email: '',
    cedula: '', nacionalidad: 'Dominicana', pais: 'República Dominicana',
    propiedad: '', zona: '', banco: '', numero_cuenta: '',
    valor_mensual_estimado: '', numero_unidades: '1',
    tipo_propiedad: '' as TipoPropiedad | '',
    tipologia: '' as Tipologia | '',
    fuente: 'otro' as Fuente,
    notas_rapidas: '',
    estado: 'prospecto' as Estado,
    ejecucion_nok: false,
    proyecto: '', apartamento: '',
    prioridad: '' as Prioridad | '',
    pendientes: '',
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const tipologiasDisponibles = form.tipo_propiedad
    ? TIPOLOGIAS_POR_TIPO[form.tipo_propiedad] ?? []
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.propiedad.trim()) return
    setLoading(true)

    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        valor_mensual_estimado: form.valor_mensual_estimado ? parseFloat(form.valor_mensual_estimado) : null,
        numero_unidades: parseInt(form.numero_unidades) || 1,
        tipo_propiedad: form.tipo_propiedad || null,
        tipologia: form.tipologia || null,
        prioridad: form.prioridad || null,
        proyecto: form.proyecto || null,
        apartamento: form.apartamento || null,
        pendientes: form.pendientes || null,
      }),
    })

    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[600px] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>

        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>Nuevo lead</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hi)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-6">

          {/* Propietario */}
          <div>
            <SectionLabel>Propietario</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldLabel>Nombre completo *</FieldLabel>
                <Inp required value={form.nombre} onChange={v => set('nombre', v)} placeholder="María Elena Guzmán" />
              </div>
              <div><FieldLabel>Teléfono</FieldLabel><Inp value={form.telefono} onChange={v => set('telefono', v)} placeholder="+1 809-555-0000" /></div>
              <div><FieldLabel>WhatsApp</FieldLabel><Inp value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+1 809-555-0000" /></div>
              <div><FieldLabel>Email</FieldLabel><Inp type="email" value={form.email} onChange={v => set('email', v)} placeholder="correo@gmail.com" /></div>
              <div><FieldLabel>Cédula / Pasaporte</FieldLabel><Inp value={form.cedula} onChange={v => set('cedula', v)} placeholder="001-1234567-1" /></div>
              <div><FieldLabel>Nacionalidad</FieldLabel><Inp value={form.nacionalidad} onChange={v => set('nacionalidad', v)} placeholder="Dominicana" /></div>
              <div><FieldLabel>País de residencia</FieldLabel><Inp value={form.pais} onChange={v => set('pais', v)} placeholder="República Dominicana" /></div>
            </div>
          </div>

          {/* Propiedad */}
          <div>
            <SectionLabel>Propiedad</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldLabel>Nombre de la propiedad *</FieldLabel>
                <Inp required value={form.propiedad} onChange={v => set('propiedad', v)} placeholder="Apartamento Torre Anacaona" />
              </div>
              <div>
                <FieldLabel>Zona</FieldLabel>
                <Sel value={form.zona} onChange={v => set('zona', v)}>
                  <option value="">Seleccionar...</option>
                  {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                </Sel>
              </div>
              <div>
                <FieldLabel>Tipo de propiedad</FieldLabel>
                <Sel value={form.tipo_propiedad} onChange={v => { set('tipo_propiedad', v); set('tipologia', '') }}>
                  <option value="">Seleccionar...</option>
                  {(Object.entries(TIPO_PROPIEDAD_LABELS) as [TipoPropiedad, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Sel>
              </div>
              {tipologiasDisponibles.length > 0 && (
                <div>
                  <FieldLabel>Tipología</FieldLabel>
                  <Sel value={form.tipologia} onChange={v => set('tipologia', v)}>
                    <option value="">Seleccionar...</option>
                    {tipologiasDisponibles.map(t => (
                      <option key={t} value={t}>{TIPOLOGIA_LABELS[t]}</option>
                    ))}
                  </Sel>
                </div>
              )}
              <div><FieldLabel>Valor mensual estimado ($)</FieldLabel><Inp type="number" value={form.valor_mensual_estimado} onChange={v => set('valor_mensual_estimado', v)} placeholder="3500" /></div>
              <div><FieldLabel>Número de unidades</FieldLabel><Inp type="number" value={form.numero_unidades} onChange={v => set('numero_unidades', v)} /></div>
              <div><FieldLabel>Proyecto</FieldLabel><Inp value={form.proyecto} onChange={v => set('proyecto', v)} placeholder="The Towers, Panorama Garden..." /></div>
              <div><FieldLabel>Apartamento / Unidad</FieldLabel><Inp value={form.apartamento} onChange={v => set('apartamento', v)} placeholder="C2-301" /></div>
              <div>
                <FieldLabel>Prioridad</FieldLabel>
                <Sel value={form.prioridad} onChange={v => set('prioridad', v)}>
                  <option value="">Sin definir</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                  <option value="na">N/A</option>
                </Sel>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={{ background: form.ejecucion_nok ? 'var(--gold-dim)' : 'var(--surface-el)', border: `1px solid ${form.ejecucion_nok ? 'var(--gold-mid)' : 'var(--border)'}` }}
              onClick={() => set('ejecucion_nok', !form.ejecucion_nok)}>
              <input type="checkbox" checked={form.ejecucion_nok} onChange={() => {}} className="w-4 h-4" style={{ accentColor: 'var(--gold)' }} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>NOK ejecuta la compra</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>NOK realizará la adquisición o inversión de la propiedad</p>
              </div>
            </div>
          </div>

          {/* Datos bancarios */}
          <div>
            <SectionLabel>Datos bancarios</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><FieldLabel>Banco</FieldLabel><Inp value={form.banco} onChange={v => set('banco', v)} placeholder="Banco Popular" /></div>
              <div><FieldLabel>Número de cuenta</FieldLabel><Inp value={form.numero_cuenta} onChange={v => set('numero_cuenta', v)} placeholder="814-123456-7" /></div>
            </div>
          </div>

          {/* CRM */}
          <div>
            <SectionLabel>CRM</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fuente del lead</FieldLabel>
                <Sel value={form.fuente} onChange={v => set('fuente', v as Fuente)}>
                  <option value="referido">Referido</option>
                  <option value="instagram">Instagram</option>
                  <option value="web">Web</option>
                  <option value="llamada">Llamada</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="otro">Otro</option>
                </Sel>
              </div>
              <div>
                <FieldLabel>Estado inicial</FieldLabel>
                <Sel value={form.estado} onChange={v => set('estado', v as Estado)}>
                  <option value="prospecto">Prospecto</option>
                  <option value="contactado">Contactado</option>
                </Sel>
              </div>
              <div className="col-span-2">
                <FieldLabel>Notas iniciales</FieldLabel>
                <textarea value={form.notas_rapidas} onChange={e => set('notas_rapidas', e.target.value)}
                  rows={2} placeholder="Información relevante sobre el lead..."
                  style={{ ...inpStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
              </div>
              <div className="col-span-2">
                <FieldLabel>Pendientes</FieldLabel>
                <textarea value={form.pendientes} onChange={e => set('pendientes', e.target.value)}
                  rows={2} placeholder="Tareas o acciones pendientes..."
                  style={{ ...inpStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 text-[13px] py-2.5 rounded-xl transition-all"
              style={{ border: '1px solid var(--border-mid)', color: 'var(--text-muted)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hi)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-gold disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
