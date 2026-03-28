import { NextRequest, NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL, chatTools, SYSTEM_PROMPT } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { ChatMessage } from '@/lib/types'

// Ejecutar una tool y retornar el resultado
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_leads': {
      let query = supabaseAdmin
        .from('leads_con_actividad')
        .select('*')
        .order('dias_sin_contacto', { ascending: false })
        .limit((input.limit as number) ?? 20)

      if (input.estado) query = query.eq('estado', input.estado)
      if (input.zona) query = query.ilike('zona', `%${input.zona}%`)
      if (input.pais) query = query.ilike('pais', `%${input.pais}%`)
      if (input.proyecto) query = query.ilike('proyecto', `%${input.proyecto}%`)
      if (input.dias_sin_contacto_min)
        query = query.gte('dias_sin_contacto', input.dias_sin_contacto_min)

      const { data, error } = await query
      if (error) return `Error: ${error.message}`
      if (!data?.length) return 'No se encontraron leads con esos filtros.'

      return JSON.stringify(
        data.map((l) => ({
          nombre: l.nombre,
          propiedad: l.propiedad,
          proyecto: l.proyecto,
          apartamento: l.apartamento,
          zona: l.zona,
          pais: l.pais,
          estado: l.estado,
          valor: l.valor_mensual_estimado,
          dias_sin_contacto: l.dias_sin_contacto,
          ultimo_evento: l.ultimo_evento,
          probabilidad: l.probabilidad,
          prioridad: l.prioridad,
          pendientes: l.pendientes,
        }))
      )
    }

    case 'get_lead_detail': {
      const { data: leads } = await supabaseAdmin
        .from('leads_con_actividad')
        .select('*')
        .or(`nombre.ilike.%${input.nombre}%,propiedad.ilike.%${input.nombre}%`)
        .limit(1)

      if (!leads?.length) return `No encontré ningún lead con el nombre "${input.nombre}".`

      const lead = leads[0]
      const { data: eventos } = await supabaseAdmin
        .from('lead_eventos')
        .select('*')
        .eq('lead_id', lead.id)
        .order('fecha', { ascending: false })
        .limit(10)

      return JSON.stringify({ ...lead, eventos })
    }

    case 'update_lead_estado': {
      const { data: leads } = await supabaseAdmin
        .from('leads')
        .select('*')
        .or(`nombre.ilike.%${input.nombre}%,propiedad.ilike.%${input.nombre}%`)
        .limit(1)

      if (!leads?.length) return `No encontré ningún lead con el nombre "${input.nombre}".`

      const lead = leads[0]
      const estadoAnterior = lead.estado

      await supabaseAdmin
        .from('leads')
        .update({
          estado: input.nuevo_estado,
          fecha_ultimo_contacto: new Date().toISOString(),
        })
        .eq('id', lead.id)

      await supabaseAdmin.from('lead_eventos').insert({
        lead_id: lead.id,
        tipo: 'estado_cambiado',
        descripcion: (input.nota as string) || `Estado cambiado a ${input.nuevo_estado} desde el chat AI`,
        autor: 'NOK Team (AI)',
        estado_anterior: estadoAnterior,
        estado_nuevo: input.nuevo_estado,
      })

      return `✓ Estado de "${lead.nombre}" cambiado de ${estadoAnterior} → ${input.nuevo_estado}`
    }

    case 'agregar_evento': {
      const { data: leads } = await supabaseAdmin
        .from('leads')
        .select('*')
        .or(`nombre.ilike.%${input.nombre_lead}%,propiedad.ilike.%${input.nombre_lead}%`)
        .limit(1)

      if (!leads?.length) return `No encontré ningún lead con el nombre "${input.nombre_lead}".`

      const lead = leads[0]

      await supabaseAdmin.from('lead_eventos').insert({
        lead_id: lead.id,
        tipo: input.tipo,
        descripcion: input.descripcion,
        autor: 'NOK Team',
        fecha: (input.fecha as string) || new Date().toISOString(),
      })

      await supabaseAdmin
        .from('leads')
        .update({ fecha_ultimo_contacto: new Date().toISOString() })
        .eq('id', lead.id)

      return `✓ Evento registrado en la hoja de vida de "${lead.nombre}"`
    }

    case 'get_analytics': {
      const { data: leads } = await supabaseAdmin.from('leads_con_actividad').select('*')
      if (!leads) return 'Error obteniendo métricas.'

      const activos = leads.filter((l) => l.estado !== 'perdido')
      const porEstado = ['prospecto', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido'].map(
        (e) => ({
          estado: e,
          count: leads.filter((l) => l.estado === e).length,
          valor: leads.filter((l) => l.estado === e).reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
        })
      )

      return JSON.stringify({
        total_activos: activos.length,
        valor_pipeline: activos.reduce((s, l) => s + (l.valor_mensual_estimado ?? 0), 0),
        leads_sin_contacto_7d: activos.filter((l) => (l.dias_sin_contacto ?? 0) >= 7).length,
        por_estado: porEstado,
      })
    }

    default:
      return 'Tool no reconocida.'
  }
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: ChatMessage[] } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Loop de agentic: Claude puede llamar múltiples tools
        const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        let continueLoop = true

        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: chatTools,
            messages: apiMessages,
          })

          // Procesar bloques de respuesta
          for (const block of response.content) {
            if (block.type === 'text') {
              send({ type: 'text', text: block.text })
            } else if (block.type === 'tool_use') {
              // Mostrar indicador de tool
              const toolLabels: Record<string, string> = {
                get_leads: 'Consultando pipeline...',
                get_lead_detail: 'Buscando lead...',
                update_lead_estado: 'Actualizando estado...',
                agregar_evento: 'Registrando evento...',
                get_analytics: 'Calculando métricas...',
              }
              send({ type: 'tool_use', label: toolLabels[block.name] || 'Procesando...' })

              // Ejecutar la tool
              const toolResult = await executeTool(block.name, block.input as Record<string, unknown>)

              // Agregar resultado al historial
              apiMessages.push({ role: 'assistant', content: response.content })
              apiMessages.push({
                role: 'user',
                content: [{ type: 'tool_result', tool_use_id: block.id, content: toolResult }],
              })
            }
          }

          // Continuar si hay tool_use, terminar si stop_reason es end_turn
          continueLoop = response.stop_reason === 'tool_use'
        }
      } catch (err) {
        send({ type: 'text', text: 'Error procesando tu solicitud. Intenta de nuevo.' })
        console.error(err)
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// Importar tipo de Anthropic para los mensajes
import type Anthropic from '@anthropic-ai/sdk'
