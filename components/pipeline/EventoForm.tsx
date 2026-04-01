'use client'

import { useState } from 'react'
import type { TipoEvento } from '@/lib/types'
import { EVENTO_ICONS, EVENTO_LABELS } from '@/lib/types'

const TIPOS: TipoEvento[] = ['llamada','whatsapp','email','reunion','propuesta_enviada','contrato','nota','tarea']

interface Props {
  leadId: string
  onEventoAdded: () => void
}

export default function EventoForm({ leadId, onEventoAdded }: Props) {
  const [tipo, setTipo] = useState<TipoEvento>('nota')
  const [descripcion, setDescripcion] = useState('')
  const [fechaRecordatorio, setFechaRecordatorio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) return
    setLoading(true)

    const metadata: Record<string, string> = {}
    if (fechaRecordatorio) {
      metadata.fecha_vencimiento = new Date(fechaRecordatorio + 'T23:59:59').toISOString()
    }

    await fetch(`/api/leads/${leadId}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, descripcion, metadata }),
    })

    setDescripcion('')
    setFechaRecordatorio('')
    setLoading(false)
    onEventoAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Tipo selector */}
      <div className="flex flex-wrap gap-1.5">
        {TIPOS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-all"
            style={tipo === t
              ? { background: 'var(--gold)', color: '#1D1D1B', border: '1px solid var(--gold)' }
              : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-mid)' }
            }
          >
            <span>{EVENTO_ICONS[t]}</span>
            {EVENTO_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Descripción */}
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción del evento..."
        rows={3}
        className="w-full text-[13px] rounded-xl px-3 py-2 resize-none outline-none transition-all"
        style={{
          background: 'var(--surface-hi)',
          border: '1px solid var(--border-mid)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
      />

      {/* Fecha recordatorio */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: 'var(--surface-hi)', border: '1px solid var(--border-mid)' }}>
        <span className="text-[12px] shrink-0">📅</span>
        <div className="flex-1">
          <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-dim)' }}>Recordatorio (opcional)</p>
          <input
            type="date"
            value={fechaRecordatorio}
            onChange={(e) => setFechaRecordatorio(e.target.value)}
            className="w-full text-[12px] bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', colorScheme: 'dark' }}
          />
        </div>
        {fechaRecordatorio && (
          <button type="button" onClick={() => setFechaRecordatorio('')}
            className="text-[10px] transition-colors shrink-0"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!descripcion.trim() || loading}
        className="w-full text-[13px] font-medium py-2 rounded-xl transition-all disabled:opacity-40"
        style={{ background: 'var(--gold)', color: '#1D1D1B' }}
      >
        {loading ? 'Guardando...' : 'Agregar a hoja de vida'}
      </button>
    </form>
  )
}
