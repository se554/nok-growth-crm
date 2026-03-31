import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/tareas — todas las tareas con info del lead
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .select('id, lead_id, descripcion, fecha, metadata, leads(nombre, estado, propiedad)')
    .eq('tipo', 'tarea')
    .order('fecha', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tareas = (data ?? []).map((t: any) => ({
    id: t.id,
    lead_id: t.lead_id,
    lead_nombre: t.leads?.nombre ?? 'Sin nombre',
    lead_estado: t.leads?.estado ?? 'prospecto',
    lead_propiedad: t.leads?.propiedad ?? '',
    descripcion: t.descripcion,
    fecha_creacion: t.fecha,
    fecha_vencimiento: t.metadata?.fecha_vencimiento ?? null,
  }))

  return NextResponse.json(tareas)
}
