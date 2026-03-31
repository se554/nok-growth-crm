import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Estados canónicos actuales
const ESTADOS_ACTIVOS = ['prospecto', 'cotizacion', 'comprometido']
const ESTADOS_TODOS = ['prospecto', 'cotizacion', 'comprometido', 'cerrado', 'perdido']

// Normalizar estados legacy al canónico correspondiente
function normalizar(estado: string): string {
  const map: Record<string, string> = {
    pendiente_contacto:  'prospecto',
    contactado:          'prospecto',
    pendiente_respuesta: 'prospecto',
    en_espera:           'prospecto',
    pendiente_reunion:   'cotizacion',
    propuesta:           'cotizacion',
    negociacion:         'comprometido',
    ganado:              'cerrado',
  }
  return map[estado] ?? estado
}

export async function GET() {
  const [leadsRes, eventosRes, cerradosMesRes] = await Promise.all([
    // Consulta leads directamente (no el view, que puede filtrar)
    supabaseAdmin.from('leads').select('*').limit(1000),
    supabaseAdmin.from('lead_eventos').select('*').order('fecha', { ascending: true }),
    supabaseAdmin
      .from('leads')
      .select('valor_mensual_estimado')
      .eq('estado', 'cerrado')
      .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  if (leadsRes.error) return NextResponse.json({ error: leadsRes.error.message }, { status: 500 })

  const leadsRaw = leadsRes.data ?? []
  const eventos = eventosRes.data ?? []
  const cerradosMes = cerradosMesRes.data ?? []

  // Calcular dias_sin_contacto en JS
  const now = Date.now()
  const leads = leadsRaw.map(l => ({
    ...l,
    estado: normalizar(l.estado),
    dias_sin_contacto: l.fecha_ultimo_contacto
      ? Math.floor((now - new Date(l.fecha_ultimo_contacto).getTime()) / 86400000)
      : Math.floor((now - new Date(l.created_at).getTime()) / 86400000),
  }))

  const activos = leads.filter(l => ESTADOS_ACTIVOS.includes(l.estado))
  const enNegociacion = leads.filter(l => ['cotizacion','comprometido'].includes(l.estado))
  const cerrados = leads.filter(l => l.estado === 'cerrado')
  const perdidos = leads.filter(l => l.estado === 'perdido')
  const sinContacto7d = leads.filter(l =>
    l.estado !== 'cerrado' && l.estado !== 'perdido' && (l.dias_sin_contacto ?? 0) >= 7
  )

  // Tasa de conversión
  const totalFinalizados = cerrados.length + perdidos.length
  const tasa_conversion = totalFinalizados > 0 ? Math.round((cerrados.length / totalFinalizados) * 100) : 0

  // Por estado — todos los estados con sus conteos reales
  const por_estado = ESTADOS_TODOS.map(estado => ({
    estado,
    count: leads.filter(l => l.estado === estado).length,
    valor_total: leads.filter(l => l.estado === estado).reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
  })).filter(e => e.count > 0)

  // Leads en riesgo
  const leads_en_riesgo = leads
    .filter(l => l.estado !== 'cerrado' && l.estado !== 'perdido' && (l.dias_sin_contacto ?? 0) >= 7)
    .sort((a, b) => (b.dias_sin_contacto ?? 0) - (a.dias_sin_contacto ?? 0))
    .slice(0, 10)

  // Top zonas (fallback a pais si no hay zona)
  const zonaMap: Record<string, { count: number; valor: number }> = {}
  for (const l of leads) {
    const zona = l.zona ?? l.pais ?? 'Sin zona'
    if (!zonaMap[zona]) zonaMap[zona] = { count: 0, valor: 0 }
    zonaMap[zona].count++
    zonaMap[zona].valor += l.valor_mensual_estimado ?? 0
  }
  const top_zonas = Object.entries(zonaMap)
    .map(([zona, d]) => ({ zona, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Por tipo de propiedad
  const tipoMap: Record<string, { count: number; valor: number }> = {}
  for (const l of leads) {
    const tipo = l.tipo_propiedad ?? 'sin_datos'
    if (!tipoMap[tipo]) tipoMap[tipo] = { count: 0, valor: 0 }
    tipoMap[tipo].count++
    tipoMap[tipo].valor += l.valor_mensual_estimado ?? 0
  }
  const por_tipo_propiedad = Object.entries(tipoMap)
    .map(([tipo, d]) => ({ tipo, ...d }))
    .sort((a, b) => b.count - a.count)

  // Por tipología
  const tipologiaMap: Record<string, { count: number; valor: number }> = {}
  for (const l of leads) {
    const tip = l.tipologia ?? 'sin_datos'
    if (!tipologiaMap[tip]) tipologiaMap[tip] = { count: 0, valor: 0 }
    tipologiaMap[tip].count++
    tipologiaMap[tip].valor += l.valor_mensual_estimado ?? 0
  }
  const por_tipologia = Object.entries(tipologiaMap)
    .map(([tipologia, d]) => ({ tipologia, ...d }))
    .sort((a, b) => b.count - a.count)

  // Por país
  const paisMap: Record<string, { count: number; valor: number }> = {}
  for (const l of leads) {
    const pais = l.pais ?? 'Desconocido'
    if (!paisMap[pais]) paisMap[pais] = { count: 0, valor: 0 }
    paisMap[pais].count++
    paisMap[pais].valor += l.valor_mensual_estimado ?? 0
  }
  const por_pais = Object.entries(paisMap)
    .map(([pais, d]) => ({ pais, ...d }))
    .sort((a, b) => b.count - a.count)

  // Por proyecto
  const proyectoMap: Record<string, { count: number; valor: number }> = {}
  for (const l of leads) {
    if (!l.proyecto) continue
    if (!proyectoMap[l.proyecto]) proyectoMap[l.proyecto] = { count: 0, valor: 0 }
    proyectoMap[l.proyecto].count++
    proyectoMap[l.proyecto].valor += l.valor_mensual_estimado ?? 0
  }
  const por_proyecto = Object.entries(proyectoMap)
    .map(([proyecto, d]) => ({ proyecto, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Ejecución NOK
  const ejecucion_nok_count = leads.filter(l => l.ejecucion_nok).length
  const ejecucion_nok_valor = leads.filter(l => l.ejecucion_nok).reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0)

  // Tiempo promedio por estado
  const eventosPorLead: Record<string, typeof eventos> = {}
  for (const e of eventos) {
    if (!eventosPorLead[e.lead_id]) eventosPorLead[e.lead_id] = []
    eventosPorLead[e.lead_id].push(e)
  }
  const diasPorEstado: Record<string, number[]> = {}
  for (const lead of leads) {
    const evs = (eventosPorLead[lead.id] ?? [])
      .filter(e => e.tipo === 'estado_cambiado')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    let estadoActual = 'prospecto'
    let fechaEntrada = new Date(lead.created_at).getTime()
    for (const ev of evs) {
      const dias = (new Date(ev.fecha).getTime() - fechaEntrada) / 86400000
      if (!diasPorEstado[estadoActual]) diasPorEstado[estadoActual] = []
      diasPorEstado[estadoActual].push(Math.max(0, dias))
      estadoActual = normalizar(ev.estado_nuevo ?? estadoActual)
      fechaEntrada = new Date(ev.fecha).getTime()
    }
    const diasActual = (Date.now() - fechaEntrada) / 86400000
    if (!diasPorEstado[estadoActual]) diasPorEstado[estadoActual] = []
    diasPorEstado[estadoActual].push(Math.max(0, diasActual))
  }
  const tiempo_promedio_por_estado = Object.entries(diasPorEstado)
    .filter(([estado]) => ESTADOS_TODOS.includes(estado))
    .map(([estado, dias]) => ({
      estado,
      promedio_dias: Math.round(dias.reduce((a, b) => a + b, 0) / dias.length),
    }))

  // Tiempo promedio de cierre
  const tiemposCierre = cerrados.map(l =>
    (new Date(l.updated_at).getTime() - new Date(l.created_at).getTime()) / 86400000
  )
  const tiempo_promedio_cierre = tiemposCierre.length
    ? Math.round(tiemposCierre.reduce((a, b) => a + b, 0) / tiemposCierre.length)
    : null

  // Cambios de estado últimos 14 días
  const hoy = new Date()
  const cambios_estado_diarios = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const cambiosDelDia = eventos.filter(e => e.tipo === 'estado_cambiado' && e.fecha.startsWith(dateStr))
    const transiciones: Record<string, number> = {}
    for (const c of cambiosDelDia) {
      const key = `${c.estado_anterior}→${c.estado_nuevo}`
      transiciones[key] = (transiciones[key] ?? 0) + 1
    }
    return { fecha: dateStr, total: cambiosDelDia.length, transiciones }
  })

  return NextResponse.json({
    total_activos: leads.filter(l => l.estado !== 'perdido').length,
    total_leads: leads.length,
    valor_pipeline: activos.reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
    leads_negociacion: enNegociacion.length,
    valor_negociacion: enNegociacion.reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
    leads_sin_contacto_7d: sinContacto7d.length,
    ganados_este_mes: cerradosMes.length,
    valor_ganado_mes: cerradosMes.reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
    tasa_conversion,
    tiempo_promedio_cierre,
    ejecucion_nok_count,
    ejecucion_nok_valor,
    por_estado,
    por_tipo_propiedad,
    por_tipologia,
    por_pais,
    por_proyecto,
    top_zonas,
    leads_en_riesgo,
    tiempo_promedio_por_estado,
    cambios_estado_diarios,
  })
}
