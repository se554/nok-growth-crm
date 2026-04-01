import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/tareas/pendientes — eventos con fecha_vencimiento <= hoy
export async function GET() {
  // Traer todos los eventos — el filtro JSONB de PostgREST no es confiable,
  // filtramos en JS para garantizar correctitud
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .select('id, lead_id, descripcion, fecha, metadata, leads(nombre)')
    .order('fecha', { ascending: false })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hoyFin = new Date()
  hoyFin.setHours(23, 59, 59, 999)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tareas = (data ?? [])
    .filter((t: any) => {
      const fv = t.metadata?.fecha_vencimiento
      if (!fv) return false
      return new Date(fv) <= hoyFin
    })
    .sort((a: any, b: any) => {
      const fa = a.metadata?.fecha_vencimiento ?? ''
      const fb = b.metadata?.fecha_vencimiento ?? ''
      return fa < fb ? -1 : 1
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => ({
      id: t.id,
      lead_id: t.lead_id,
      lead_nombre: t.leads?.nombre ?? 'Sin nombre',
      descripcion: t.descripcion,
      fecha_vencimiento: t.metadata?.fecha_vencimiento ?? null,
    }))

  return NextResponse.json(tareas)
}
