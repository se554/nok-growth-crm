import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/tareas/pendientes — urgentes (hoy/vencidas) + próximas 7 días
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .select('id, lead_id, descripcion, fecha, metadata, tipo, leads(nombre)')
    .order('fecha', { ascending: false })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ahora = new Date()
  const hoyFin = new Date(); hoyFin.setHours(23, 59, 59, 999)
  const en7dias = new Date(); en7dias.setDate(en7dias.getDate() + 7); en7dias.setHours(23, 59, 59, 999)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todos = (data ?? [])
    .filter((t: any) => !!t.metadata?.fecha_vencimiento)
    .sort((a: any, b: any) => {
      const fa = a.metadata?.fecha_vencimiento ?? ''
      const fb = b.metadata?.fecha_vencimiento ?? ''
      return fa < fb ? -1 : 1
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => {
      const fv = new Date(t.metadata.fecha_vencimiento)
      return {
        id: t.id,
        lead_id: t.lead_id,
        lead_nombre: t.leads?.nombre ?? 'Sin nombre',
        tipo: t.tipo,
        descripcion: t.descripcion,
        fecha_vencimiento: t.metadata.fecha_vencimiento,
        urgente: fv <= hoyFin,
        proxima: fv > hoyFin && fv <= en7dias,
      }
    })

  const urgentes = todos.filter((t: any) => t.urgente)
  const proximas = todos.filter((t: any) => t.proxima)

  return NextResponse.json({ urgentes, proximas })
}
