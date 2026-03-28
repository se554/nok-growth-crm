import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/actividad — todos los eventos con nombre del lead, ordenados por fecha desc
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .select(`
      *,
      leads!lead_id ( nombre )
    `)
    .order('fecha', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const eventos = (data ?? []).map((e: Record<string, unknown> & { leads?: { nombre: string } }) => ({
    ...e,
    lead_nombre: e.leads?.nombre ?? 'Desconocido',
    leads: undefined,
  }))

  return NextResponse.json(eventos)
}
