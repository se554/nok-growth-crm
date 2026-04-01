import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Instanciar dentro del handler para evitar error en build
let _anthropic: Anthropic | null = null
let _resend: Resend | null = null
const getClients = () => {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return { anthropic: _anthropic, resend: _resend }
}

const DESTINATARIOS = ['se@nok.rent']

async function recopilarDatos() {
  const now = Date.now()
  const hoyFin = new Date(); hoyFin.setHours(23, 59, 59, 999)
  const en14dias = new Date(); en14dias.setDate(en14dias.getDate() + 14); en14dias.setHours(23, 59, 59, 999)
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [leadsRes, eventosRes, cerradosMesRes] = await Promise.all([
    supabaseAdmin.from('leads').select('*').limit(1000),
    supabaseAdmin.from('lead_eventos').select('*').order('fecha', { ascending: false }).limit(2000),
    supabaseAdmin.from('leads').select('valor_mensual_estimado').eq('estado', 'cerrado').gte('updated_at', inicioMes),
  ])

  const leadsRaw = leadsRes.data ?? []
  const eventos = eventosRes.data ?? []

  const normalizar = (e: string) => {
    const m: Record<string, string> = {
      pendiente_contacto: 'prospecto', contactado: 'prospecto',
      pendiente_respuesta: 'prospecto', en_espera: 'prospecto',
      pendiente_reunion: 'cotizacion', negociacion: 'comprometido', ganado: 'cerrado',
    }
    return m[e] ?? e
  }

  const leads = leadsRaw.map(l => ({
    ...l,
    estado: normalizar(l.estado),
    dias_sin_contacto: l.fecha_ultimo_contacto
      ? Math.floor((now - new Date(l.fecha_ultimo_contacto).getTime()) / 86400000)
      : Math.floor((now - new Date(l.created_at).getTime()) / 86400000),
  }))

  const ESTADOS = ['prospecto', 'cotizacion', 'comprometido', 'cerrado', 'perdido']
  const porEstado = ESTADOS.map(e => ({
    estado: e,
    count: leads.filter(l => l.estado === e).length,
    valor: leads.filter(l => l.estado === e).reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
  })).filter(e => e.count > 0)

  const enRiesgo = leads
    .filter(l => !['cerrado','perdido'].includes(l.estado) && l.dias_sin_contacto >= 7)
    .sort((a, b) => b.dias_sin_contacto - a.dias_sin_contacto)
    .slice(0, 8)

  const topOportunidades = leads
    .filter(l => ['cotizacion','comprometido'].includes(l.estado))
    .sort((a, b) => (b.valor_mensual_estimado ?? 0) - (a.valor_mensual_estimado ?? 0))
    .slice(0, 5)

  // Tareas/recordatorios con fecha_vencimiento
  const urgentes = eventos
    .filter(e => e.metadata?.fecha_vencimiento && new Date(e.metadata.fecha_vencimiento) <= hoyFin)
    .slice(0, 10)

  const proximas2semanas = eventos
    .filter(e => {
      const fv = e.metadata?.fecha_vencimiento
      if (!fv) return false
      const d = new Date(fv)
      return d > hoyFin && d <= en14dias
    })
    .slice(0, 15)

  // Enriquecer con nombres de leads
  const leadMap = Object.fromEntries(leads.map(l => [l.id, l]))
  const enriquecerEvento = (e: any) => ({
    ...e,
    lead_nombre: leadMap[e.lead_id]?.nombre ?? 'Desconocido',
    lead_estado: leadMap[e.lead_id]?.estado ?? '',
  })

  return {
    resumen: {
      total_leads: leads.filter(l => l.estado !== 'perdido').length,
      valor_pipeline: leads.filter(l => !['cerrado','perdido'].includes(l.estado))
        .reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
      cerrados_mes: cerradosMesRes.data?.length ?? 0,
      valor_ganado_mes: (cerradosMesRes.data ?? []).reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
      sin_contacto_7d: enRiesgo.length,
    },
    porEstado,
    topOportunidades,
    enRiesgo,
    urgentes: urgentes.map(enriquecerEvento),
    proximas2semanas: proximas2semanas.map(enriquecerEvento),
  }
}

async function generarInsightsClaude(datos: any): Promise<string> {
  const { anthropic } = getClients()
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Eres el asistente de NOK Property Management. Analiza estos datos del CRM y escribe un resumen ejecutivo conciso en español (máximo 200 palabras) con los puntos más importantes, oportunidades y alertas para esta semana. Sé directo y accionable.

Datos:
${JSON.stringify(datos.resumen, null, 2)}

Por estado:
${datos.porEstado.map((e: any) => `- ${e.estado}: ${e.count} leads ($${e.valor.toLocaleString()}/mes)`).join('\n')}

Top oportunidades (cotización/comprometido):
${datos.topOportunidades.map((l: any) => `- ${l.nombre}: $${(l.valor_mensual_estimado ?? 0).toLocaleString()}/mes`).join('\n')}

Leads en riesgo (sin contacto 7d+): ${datos.enRiesgo.length}
Tareas urgentes (vencidas/hoy): ${datos.urgentes.length}
Próximas 2 semanas: ${datos.proximas2semanas.length} recordatorios`
    }]
  })
  return (msg.content[0] as any).text
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function generarHTML(datos: any, insights: string, fecha: string): string {
  const ESTADO_LABELS: Record<string, string> = {
    prospecto: 'Prospecto', cotizacion: 'Cotización',
    comprometido: 'Comprometido', cerrado: 'Cerrado', perdido: 'Perdido',
  }
  const ESTADO_COLORS: Record<string, string> = {
    prospecto: '#6B7280', cotizacion: '#2563EB', comprometido: '#D97706',
    cerrado: '#16A34A', perdido: '#DC2626',
  }

  const filaEstado = (e: any) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">
        <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;
          background:${ESTADO_COLORS[e.estado]}20;color:${ESTADO_COLORS[e.estado]}">
          ${ESTADO_LABELS[e.estado] ?? e.estado}
        </span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:600">${e.count}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:#C9A84C;font-weight:600">
        ${e.valor > 0 ? `$${e.valor.toLocaleString()}/mes` : '—'}
      </td>
    </tr>`

  const filaEvento = (e: any) => `
    <tr>
      <td style="padding:7px 12px;border-bottom:1px solid #f0f0f0;font-weight:500;color:#1A1A1A">${e.lead_nombre}</td>
      <td style="padding:7px 12px;border-bottom:1px solid #f0f0f0;color:#6B6B6B;font-size:12px">${e.descripcion}</td>
      <td style="padding:7px 12px;border-bottom:1px solid #f0f0f0;color:#6B6B6B;font-size:12px;white-space:nowrap">
        ${e.metadata?.fecha_vencimiento ? formatFecha(e.metadata.fecha_vencimiento) : '—'}
      </td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOK CRM — Reporte Semanal</title></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:680px;margin:0 auto;padding:24px 16px">

  <!-- Header -->
  <div style="background:#0b2922;border-radius:16px;padding:28px 32px;margin-bottom:20px">
    <div style="font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px">NOK</div>
    <div style="font-size:10px;font-weight:700;letter-spacing:3px;color:#d6a700;text-transform:uppercase;margin-top:2px">Growth CRM</div>
    <div style="margin-top:16px;font-size:14px;color:rgba(255,255,255,0.6)">Reporte Semanal · ${fecha}</div>
  </div>

  <!-- Métricas top -->
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
    ${[
      { label: 'Leads activos', val: String(datos.resumen.total_leads) },
      { label: 'Valor del pipeline', val: `$${datos.resumen.valor_pipeline.toLocaleString()}/mes` },
      { label: 'Cerrados este mes', val: String(datos.resumen.cerrados_mes), sub: datos.resumen.valor_ganado_mes > 0 ? `$${datos.resumen.valor_ganado_mes.toLocaleString()}/mes` : '' },
      { label: 'Sin contacto 7d+', val: String(datos.resumen.sin_contacto_7d), alert: datos.resumen.sin_contacto_7d > 0 },
    ].map(m => `
      <div style="background:white;border-radius:12px;padding:16px 20px;border:1px solid #E8E6E0">
        <div style="font-size:11px;color:#6B6B6B;margin-bottom:4px">${m.label}</div>
        <div style="font-size:22px;font-weight:700;color:${(m as any).alert ? '#d6a700' : '#1A1A1A'}">${m.val}</div>
        ${(m as any).sub ? `<div style="font-size:11px;color:#6B6B6B;margin-top:2px">${(m as any).sub}</div>` : ''}
      </div>`).join('')}
  </div>

  <!-- Insights Claude -->
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px;border-left:4px solid #C9A84C">
    <div style="font-size:12px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
      ✦ Resumen ejecutivo
    </div>
    <div style="font-size:14px;color:#1A1A1A;line-height:1.7;white-space:pre-wrap">${insights}</div>
  </div>

  <!-- Pipeline por estado -->
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:14px">Estado del pipeline</div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#F5F3EE">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6B6B6B;font-weight:600">Estado</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;color:#6B6B6B;font-weight:600">Leads</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6B6B6B;font-weight:600">Valor</th>
        </tr>
      </thead>
      <tbody>${datos.porEstado.map(filaEstado).join('')}</tbody>
    </table>
  </div>

  <!-- Top oportunidades -->
  ${datos.topOportunidades.length > 0 ? `
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:14px">🏆 Top oportunidades</div>
    ${datos.topOportunidades.map((l: any) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5F3EE">
        <div>
          <div style="font-size:13px;font-weight:500;color:#1A1A1A">${l.nombre}</div>
          <div style="font-size:11px;color:#6B6B6B">${l.propiedad ?? ''}</div>
        </div>
        <div style="font-size:14px;font-weight:700;color:#C9A84C">$${(l.valor_mensual_estimado ?? 0).toLocaleString()}/mes</div>
      </div>`).join('')}
  </div>` : ''}

  <!-- Tareas urgentes -->
  ${datos.urgentes.length > 0 ? `
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px;border-left:4px solid #EF4444">
    <div style="font-size:13px;font-weight:700;color:#EF4444;margin-bottom:14px">⚠ Tareas urgentes (${datos.urgentes.length})</div>
    <table style="width:100%;border-collapse:collapse">
      <tbody>${datos.urgentes.map(filaEvento).join('')}</tbody>
    </table>
  </div>` : ''}

  <!-- Próximas 2 semanas -->
  ${datos.proximas2semanas.length > 0 ? `
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:14px">📅 Próximas 2 semanas (${datos.proximas2semanas.length})</div>
    <table style="width:100%;border-collapse:collapse">
      <tbody>${datos.proximas2semanas.map(filaEvento).join('')}</tbody>
    </table>
  </div>` : ''}

  <!-- En riesgo -->
  ${datos.enRiesgo.length > 0 ? `
  <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#D97706;margin-bottom:14px">🔴 Leads en riesgo (sin contacto 7d+)</div>
    ${datos.enRiesgo.map((l: any) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F5F3EE">
        <div style="font-size:13px;font-weight:500;color:#1A1A1A">${l.nombre}</div>
        <div style="font-size:12px;color:#D97706;font-weight:600">${l.dias_sin_contacto}d sin contacto</div>
      </div>`).join('')}
  </div>` : ''}

  <!-- Footer -->
  <div style="text-align:center;padding:16px;color:#9B9B9B;font-size:11px">
    NOK Growth CRM · Reporte generado automáticamente · ${fecha}
  </div>
</div>
</body></html>`
}

export async function POST() {
  try {
    const datos = await recopilarDatos()
    const insights = await generarInsightsClaude(datos)
    const fecha = new Date().toLocaleDateString('es-DO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const html = generarHTML(datos, insights, fecha)

    const { resend } = getClients()
    const { error } = await resend.emails.send({
      from: 'NOK CRM <onboarding@resend.dev>',
      to: DESTINATARIOS,
      subject: `NOK CRM — Reporte Semanal ${new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}`,
      html,
    })

    if (error) return NextResponse.json({ error }, { status: 500 })

    return NextResponse.json({ ok: true, fecha, insights })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
