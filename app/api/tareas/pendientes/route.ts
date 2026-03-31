import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/tareas/pendientes — eventos con fecha_vencimiento en metadata <= hoy
export async function GET() {
  // Traer todos los eventos con metadata que tenga fecha_vencimiento
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .select('id, lead_id, descripcion, fecha, metadata, leads(nombre)')
    .not('metadata->>fecha_vencimiento', 'is', null)
    .order('metadata->>fecha_vencimiento', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hoyFin = new Date()
  hoyFin.setHours(23, 59, 59, 999)

  // Filtrar en JS: solo los que vencen hoy o antes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tareas = (data ?? [])
    .filter((t: any) => {
      const fv = t.metadata?.fecha_vencimiento
      if (!fv) return false
      return new Date(fv) <= hoyFin
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
