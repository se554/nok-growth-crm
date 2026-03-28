'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
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
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) return
    setLoading(true)

    await fetch(`/api/leads/${leadId}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, descripcion }),
    })

    setDescripcion('')
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
            className={clsx(
              'flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-all',
              tipo === t
                ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
                : 'border-[#E8E6E0] text-[#6B6B6B] hover:border-[#C9A84C]'
            )}
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
        className="w-full text-[13px] border border-[#E8E6E0] rounded-xl px-3 py-2 resize-none outline-none focus:border-[#C9A84C] transition-all text-[#1A1A1A] placeholder-[#6B6B6B]"
      />

      <button
        type="submit"
        disabled={!descripcion.trim() || loading}
        className="w-full bg-[#C9A84C] text-white text-[13px] font-medium py-2 rounded-xl hover:bg-[#b8963f] disabled:opacity-40 transition-all"
      >
        {loading ? 'Guardando...' : 'Agregar a hoja de vida'}
      </button>
    </form>
  )
}
