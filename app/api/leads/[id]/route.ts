import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/leads/[id] — detalle completo con eventos
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [leadRes, eventosRes] = await Promise.all([
    supabaseAdmin
      .from('leads_con_actividad')
      .select('*')
      .eq('id', params.id)
      .single(),
    supabaseAdmin
      .from('lead_eventos')
      .select('*')
      .eq('lead_id', params.id)
      .order('fecha', { ascending: false }),
  ])

  if (leadRes.error) return NextResponse.json({ error: leadRes.error.message }, { status: 404 })

  return NextResponse.json({ ...leadRes.data, eventos: eventosRes.data ?? [] })
}

// PATCH /api/leads/[id] — actualizar campos
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { estado_anterior, nota, ...fields } = body

  // Si cambia el estado, registrar evento automático
  if (fields.estado && estado_anterior && fields.estado !== estado_anterior) {
    await supabaseAdmin.from('lead_eventos').insert({
      lead_id: params.id,
      tipo: 'estado_cambiado',
      descripcion: nota || `Estado actualizado a ${fields.estado}`,
      autor: 'NOK Team',
      estado_anterior,
      estado_nuevo: fields.estado,
    })
    fields.fecha_ultimo_contacto = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(fields)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/leads/[id] — eliminar lead y todos sus eventos
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // Primero eliminar eventos asociados
  await supabaseAdmin
    .from('lead_eventos')
    .delete()
    .eq('lead_id', params.id)

  // Luego eliminar el lead
  const { error } = await supabaseAdmin
    .from('leads')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
