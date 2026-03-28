import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/leads — lista con filtros opcionales
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')
  const zona = searchParams.get('zona')
  const pais = searchParams.get('pais')
  const proyecto = searchParams.get('proyecto')
  const dias_min = searchParams.get('dias_sin_contacto_min')
  const limit = parseInt(searchParams.get('limit') ?? '1000')

  let query = supabaseAdmin
    .from('leads_con_actividad')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (estado) query = query.eq('estado', estado)
  if (zona) query = query.ilike('zona', `%${zona}%`)
  if (pais) query = query.ilike('pais', `%${pais}%`)
  if (proyecto) query = query.ilike('proyecto', `%${proyecto}%`)
  if (dias_min) query = query.gte('dias_sin_contacto', parseInt(dias_min))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/leads — crear nuevo lead
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .insert({
      nombre: body.nombre,
      telefono: body.telefono || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      cedula: body.cedula || null,
      nacionalidad: body.nacionalidad || 'Dominicana',
      pais: body.pais || 'República Dominicana',
      propiedad: body.propiedad,
      zona: body.zona || null,
      tipo_propiedad: body.tipo_propiedad || null,
      tipologia: body.tipologia || null,
      valor_mensual_estimado: body.valor_mensual_estimado || null,
      estado: body.estado || 'prospecto',
      fuente: body.fuente || 'otro',
      probabilidad: body.probabilidad || 50,
      notas_rapidas: body.notas_rapidas || null,
      numero_unidades: body.numero_unidades || 1,
      ejecucion_nok: body.ejecucion_nok ?? false,
      banco: body.banco || null,
      numero_cuenta: body.numero_cuenta || null,
      proyecto: body.proyecto || null,
      apartamento: body.apartamento || null,
      prioridad: body.prioridad || null,
      pendientes: body.pendientes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Crear evento de creación automáticamente
  await supabaseAdmin.from('lead_eventos').insert({
    lead_id: lead.id,
    tipo: 'creacion',
    descripcion: `Lead creado. Fuente: ${lead.fuente}${body.notas_rapidas ? '. ' + body.notas_rapidas : ''}`,
    autor: 'NOK Team',
  })

  return NextResponse.json(lead, { status: 201 })
}
