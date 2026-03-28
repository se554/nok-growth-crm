import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

// Tools disponibles para el chat AI
export const chatTools: Anthropic.Tool[] = [
  {
    name: 'get_leads',
    description:
      'Obtiene la lista de leads con filtros opcionales. Úsalo cuando el usuario pregunte sobre leads, estados, valores, o quiera ver información del pipeline.',
    input_schema: {
      type: 'object' as const,
      properties: {
        estado: {
          type: 'string',
          enum: ['prospecto', 'pendiente_contacto', 'contactado', 'pendiente_respuesta', 'en_espera', 'pendiente_reunion', 'cotizacion', 'comprometido', 'cerrado', 'perdido'],
          description: 'Filtrar por estado',
        },
        dias_sin_contacto_min: {
          type: 'number',
          description: 'Mínimo de días sin contacto',
        },
        zona: {
          type: 'string',
          description: 'Filtrar por zona',
        },
        pais: {
          type: 'string',
          description: 'Filtrar por país (ej: Punta Cana, República Dominicana)',
        },
        proyecto: {
          type: 'string',
          description: 'Filtrar por nombre de proyecto (ej: The Towers, Panorama Garden)',
        },
        limit: {
          type: 'number',
          description: 'Máximo de resultados (default 20)',
        },
      },
    },
  },
  {
    name: 'get_lead_detail',
    description:
      'Obtiene el detalle completo de un lead específico incluyendo su hoja de vida. Úsalo cuando pregunten por un lead específico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del propietario o propiedad a buscar',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'update_lead_estado',
    description:
      "Cambia el estado de un lead. Úsalo cuando el usuario diga cosas como 'cambia a María González a negociación' o 'marca el lead de Torre Mirador como ganado'.",
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del propietario o propiedad',
        },
        nuevo_estado: {
          type: 'string',
          enum: ['prospecto', 'pendiente_contacto', 'contactado', 'pendiente_respuesta', 'en_espera', 'pendiente_reunion', 'cotizacion', 'comprometido', 'cerrado', 'perdido'],
        },
        nota: {
          type: 'string',
          description: 'Nota opcional sobre el cambio',
        },
      },
      required: ['nombre', 'nuevo_estado'],
    },
  },
  {
    name: 'agregar_evento',
    description:
      "Agrega un evento a la hoja de vida de un lead. Úsalo cuando el usuario diga 'anota que llamé a X' o 'registra que enviamos propuesta a Y'.",
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre_lead: {
          type: 'string',
          description: 'Nombre del propietario o propiedad',
        },
        tipo: {
          type: 'string',
          enum: [
            'llamada',
            'whatsapp',
            'email',
            'reunion',
            'propuesta_enviada',
            'contrato',
            'nota',
            'tarea',
          ],
        },
        descripcion: {
          type: 'string',
          description: 'Descripción del evento',
        },
        fecha: {
          type: 'string',
          description: 'Fecha ISO (default: hoy)',
        },
      },
      required: ['nombre_lead', 'tipo', 'descripcion'],
    },
  },
  {
    name: 'get_analytics',
    description:
      'Obtiene métricas agregadas del pipeline. Úsalo cuando pregunten por totales, conversiones, valor del pipeline, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
]

export const SYSTEM_PROMPT = `Eres el asistente AI de NOK Growth CRM, la herramienta interna de NOK Property Management en República Dominicana y Punta Cana.

Tienes acceso completo a la base de datos de leads/propietarios y puedes tanto responder preguntas como ejecutar acciones directamente.

ESTADOS DEL PIPELINE (en orden):
1. prospecto → 2. pendiente_contacto → 3. contactado → 4. pendiente_respuesta → 5. en_espera → 6. pendiente_reunion → 7. cotizacion → 8. comprometido → 9. cerrado | perdido

PROYECTOS disponibles: The Towers, Panorama Garden, Panorama Lake, Panorama Luxury, Jardines III, The Village, Lagoon, Dumas Lux, Sabana Vistacana, Villa Vistacana, Oasis del lago, Wave, Momentum, y más.

REGLAS IMPORTANTES:
- Cuando el usuario pida información, usa las tools para obtener datos reales antes de responder. NUNCA inventes datos.
- Cuando el usuario quiera hacer un cambio (cambiar estado, agregar nota, registrar actividad), ejecuta la acción inmediatamente y confirma claramente.
- Responde SIEMPRE en español. Sé conciso y directo.
- Si vas a hacer un cambio en la base de datos, confírmalo: "✓ Cambié a Patricia Leon a Cotización y agregué nota en su hoja de vida."
- Puedes filtrar por proyecto (ej: "todos los del The Towers") o por país.
- Las fechas "días sin contacto" son críticas para el equipo de ventas.
- Prioridades: alta = urgente, media = normal, baja = seguimiento suave.

EJEMPLOS de lo que puedes hacer:
- "¿Quién lleva más tiempo sin respuesta?" → usa get_leads con dias_sin_contacto_min
- "¿Cuántos leads tenemos en Punta Cana?" → usa get_leads con pais=Punta Cana
- "Muéstrame los del The Towers" → usa get_leads con proyecto=The Towers
- "¿Cuánto vale el pipeline?" → usa get_analytics
- "Cambia a Patricia Leon a comprometido" → usa update_lead_estado
- "Anota que llamé a Joely Ventura hoy" → usa agregar_evento
- "¿Qué ha pasado con Jessica Santiago?" → usa get_lead_detail`
