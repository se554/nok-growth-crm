import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// PATCH /api/tareas/[id] — marcar/desmarcar tarea como completada
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const completado = !!body.completado

  // Leer metadata actual
  const { data: evento, error: readErr } = await supabaseAdmin
    .from('lead_eventos')
    .select('metadata')
    .eq('id', params.id)
    .single()

  if (readErr || !evento) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  }

  const metadata = { ...(evento.metadata as Record<string, unknown>) }
  if (completado) {
    metadata.completado = true
    metadata.completado_en = new Date().toISOString()
  } else {
    delete metadata.completado
    delete metadata.completado_en
  }

  const { error } = await supabaseAdmin
    .from('lead_eventos')
    .update({ metadata })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, completado })
}
