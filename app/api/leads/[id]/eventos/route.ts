import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/leads/[id]/eventos — agregar evento a la hoja de vida
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .insert({
      lead_id: params.id,
      tipo: body.tipo,
      descripcion: body.descripcion,
      autor: body.autor || 'NOK Team',
      fecha: body.fecha || new Date().toISOString(),
      estado_anterior: body.estado_anterior || null,
      estado_nuevo: body.estado_nuevo || null,
      metadata: body.metadata || {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Actualizar fecha_ultimo_contacto en el lead
  await supabaseAdmin
    .from('leads')
    .update({ fecha_ultimo_contacto: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json(data, { status: 201 })
}
