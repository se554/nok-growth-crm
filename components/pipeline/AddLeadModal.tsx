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

  const inp = "w-full text-[13px] border border-[#E8E6E0] rounded-xl px-3 py-2 outline-none focus:border-[#C9A84C] transition-all text-[#1A1A1A] placeholder-[#6B6B6B] bg-white"
  const lbl = "block text-[11px] font-medium text-[#6B6B6B] mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[600px] shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E0]">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Nuevo lead</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F5F3EE] rounded-lg transition-all">
            <X size={16} className="text-[#6B6B6B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">

          {/* Sección: Propietario */}
          <div>
            <p className="text-[11px] font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">Propietario</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Nombre completo *</label>
                <input required value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  placeholder="María Elena Guzmán" className={inp} />
              </div>
              <div>
                <label className={lbl}>Teléfono</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
                  placeholder="+1 809-555-0000" className={inp} />
              </div>
              <div>
                <label className={lbl}>WhatsApp</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="+1 809-555-0000" className={inp} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="correo@gmail.com" className={inp} />
              </div>
              <div>
                <label className={lbl}>Cédula / Pasaporte</label>
                <input value={form.cedula} onChange={e => set('cedula', e.target.value)}
                  placeholder="001-1234567-1" className={inp} />
              </div>
              <div>
                <label className={lbl}>Nacionalidad</label>
                <input value={form.nacionalidad} onChange={e => set('nacionalidad', e.target.value)}
                  placeholder="Dominicana" className={inp} />
              </div>
              <div>
                <label className={lbl}>País de residencia</label>
                <input value={form.pais} onChange={e => set('pais', e.target.value)}
                  placeholder="República Dominicana" className={inp} />
              </div>
            </div>
          </div>

          {/* Sección: Propiedad */}
          <div>
            <p className="text-[11px] font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">Propiedad</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Nombre de la propiedad *</label>
                <input required value={form.propiedad} onChange={e => set('propiedad', e.target.value)}
                  placeholder="Apartamento Torre Anacaona" className={inp} />
              </div>
              <div>
                <label className={lbl}>Zona</label>
                <select value={form.zona} onChange={e => set('zona', e.target.value)} className={inp}>
                  <option value="">Seleccionar...</option>
                  {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Tipo de propiedad</label>
                <select value={form.tipo_propiedad}
                  onChange={e => { set('tipo_propiedad', e.target.value); set('tipologia', '') }}
                  className={inp}>
                  <option value="">Seleccionar...</option>
                  {(Object.entries(TIPO_PROPIEDAD_LABELS) as [TipoPropiedad, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              {tipologiasDisponibles.length > 0 && (
                <div>
                  <label className={lbl}>Tipología</label>
                  <select value={form.tipologia} onChange={e => set('tipologia', e.target.value)} className={inp}>
                    <option value="">Seleccionar...</option>
                    {tipologiasDisponibles.map(t => (
                      <option key={t} value={t}>{TIPOLOGIA_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={lbl}>Valor mensual estimado ($)</label>
                <input type="number" value={form.valor_mensual_estimado}
                  onChange={e => set('valor_mensual_estimado', e.target.value)}
                  placeholder="3500" className={inp} />
              </div>
              <div>
                <label className={lbl}>Número de unidades</label>
                <input type="number" min="1" value={form.numero_unidades}
                  onChange={e => set('numero_unidades', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Proyecto</label>
                <input value={form.proyecto} onChange={e => set('proyecto', e.target.value)}
                  placeholder="The Towers, Panorama Garden..." className={inp} />
              </div>
              <div>
                <label className={lbl}>Apartamento / Unidad</label>
                <input value={form.apartamento} onChange={e => set('apartamento', e.target.value)}
                  placeholder="C2-301" className={inp} />
              </div>
              <div>
                <label className={lbl}>Prioridad</label>
                <select value={form.prioridad} onChange={e => set('prioridad', e.target.value)} className={inp}>
                  <option value="">Sin definir</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                  <option value="na">N/A</option>
                </select>
              </div>
            </div>

            {/* NOK ejecuta */}
            <div className="mt-3 flex items-center gap-3 p-3 bg-[#F5F3EE] rounded-xl border border-[#E8E6E0]">
              <input type="checkbox" id="ejecucion_nok" checked={form.ejecucion_nok}
                onChange={e => set('ejecucion_nok', e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C]" />
              <div>
                <label htmlFor="ejecucion_nok" className="text-[13px] font-medium text-[#1A1A1A] cursor-pointer">
                  NOK ejecuta la compra
                </label>
                <p className="text-[11px] text-[#6B6B6B]">NOK realizará la adquisición o inversión de la propiedad</p>
              </div>
            </div>
          </div>

          {/* Sección: Datos bancarios */}
          <div>
            <p className="text-[11px] font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">Datos bancarios</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Banco</label>
                <input value={form.banco} onChange={e => set('banco', e.target.value)}
                  placeholder="Banco Popular" className={inp} />
              </div>
              <div>
                <label className={lbl}>Número de cuenta</label>
                <input value={form.numero_cuenta} onChange={e => set('numero_cuenta', e.target.value)}
                  placeholder="814-123456-7" className={inp} />
              </div>
            </div>
          </div>

          {/* Sección: CRM */}
          <div>
            <p className="text-[11px] font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">CRM</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Fuente del lead</label>
                <select value={form.fuente} onChange={e => set('fuente', e.target.value as Fuente)} className={inp}>
                  <option value="referido">Referido</option>
                  <option value="instagram">Instagram</option>
                  <option value="web">Web</option>
                  <option value="llamada">Llamada</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Estado inicial</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value as Estado)} className={inp}>
                  <option value="prospecto">Prospecto</option>
                  <option value="contactado">Contactado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Notas iniciales</label>
                <textarea value={form.notas_rapidas} onChange={e => set('notas_rapidas', e.target.value)}
                  rows={2} placeholder="Información relevante sobre el lead..."
                  className={`${inp} resize-none`} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Pendientes</label>
                <textarea value={form.pendientes} onChange={e => set('pendientes', e.target.value)}
                  rows={2} placeholder="Tareas o acciones pendientes..."
                  className={`${inp} resize-none`} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 text-[13px] border border-[#E8E6E0] text-[#6B6B6B] py-2.5 rounded-xl hover:bg-[#F5F3EE] transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 text-[13px] bg-[#C9A84C] text-white py-2.5 rounded-xl hover:bg-[#b8963f] disabled:opacity-50 transition-all font-medium">
              {loading ? 'Guardando...' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
