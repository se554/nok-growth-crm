export type Estado =
  | 'prospecto'
  | 'pendiente_contacto'
  | 'contactado'
  | 'pendiente_respuesta'
  | 'en_espera'
  | 'pendiente_reunion'
  | 'cotizacion'
  | 'comprometido'
  | 'cerrado'
  | 'perdido'

export type Fuente = 'referido' | 'instagram' | 'web' | 'llamada' | 'whatsapp' | 'otro'
export type TipoEvento =
  | 'llamada' | 'whatsapp' | 'email' | 'reunion' | 'propuesta_enviada'
  | 'contrato' | 'nota' | 'estado_cambiado' | 'creacion' | 'tarea'
export type TipoPropiedad = 'apartamento' | 'villa' | 'penthouse' | 'local_comercial' | 'casa' | 'otro'
export type Tipologia = 'studio' | '1_hab' | '2_hab' | '3_hab' | '4_hab_plus' | 'villa_pequena' | 'villa_grande' | 'penthouse' | 'local' | 'otro'
export type Prioridad = 'alta' | 'media' | 'baja' | 'na'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  nombre: string
  telefono: string | null
  email: string | null
  whatsapp: string | null
  cedula: string | null
  nacionalidad: string | null
  propiedad: string
  zona: string | null
  pais: string | null
  valor_mensual_estimado: number | null
  estado: Estado
  fuente: Fuente
  probabilidad: number
  fecha_ultimo_contacto: string | null
  notas_rapidas: string | null
  asignado_a: string
  numero_unidades: number
  tipo_propiedad: TipoPropiedad | null
  tipologia: Tipologia | null
  ejecucion_nok: boolean
  banco: string | null
  numero_cuenta: string | null
  proyecto: string | null
  apartamento: string | null
  prioridad: Prioridad | null
  pendientes: string | null
}

export interface LeadConActividad extends Lead {
  dias_sin_contacto: number
  total_eventos: number
  ultimo_evento: string | null
}

export interface LeadEvento {
  id: string
  created_at: string
  lead_id: string
  fecha: string
  tipo: TipoEvento
  descripcion: string
  autor: string
  estado_anterior: Estado | null
  estado_nuevo: Estado | null
  metadata: Record<string, unknown>
}

export interface LeadDetalle extends Lead {
  eventos: LeadEvento[]
  dias_sin_contacto?: number
}

export interface PipelineMetrics {
  total_activos: number
  valor_pipeline: number
  leads_negociacion: number
  valor_negociacion: number
  leads_sin_contacto_7d: number
  ganados_este_mes: number
  valor_ganado_mes: number
}

export interface EstadoMetric {
  estado: Estado
  count: number
  valor_total: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const ZONAS = [
  'Piantini', 'Naco', 'Bella Vista', 'Gazcue',
  'Evaristo Morales', 'Los Prados', 'Serrallés', 'Punta Cana', 'Otra',
] as const
export type Zona = (typeof ZONAS)[number]

export const TIPO_PROPIEDAD_LABELS: Record<TipoPropiedad, string> = {
  apartamento:     'Apartamento',
  villa:           'Villa',
  penthouse:       'Penthouse',
  local_comercial: 'Local Comercial',
  casa:            'Casa',
  otro:            'Otro',
}

export const TIPOLOGIA_LABELS: Record<Tipologia, string> = {
  studio:       'Studio',
  '1_hab':      '1 Habitación',
  '2_hab':      '2 Habitaciones',
  '3_hab':      '3 Habitaciones',
  '4_hab_plus': '4+ Habitaciones',
  villa_pequena:'Villa Pequeña',
  villa_grande: 'Villa Grande',
  penthouse:    'Penthouse',
  local:        'Local',
  otro:         'Otro',
}

export const ESTADO_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  prospecto:           { bg: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-300',    label: 'Prospecto'          },
  pendiente_contacto:  { bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  label: 'Pendiente Contacto' },
  contactado:          { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    label: 'Contactado'         },
  pendiente_respuesta: { bg: 'bg-sky-50',      text: 'text-sky-700',     border: 'border-sky-200',     label: 'Pendiente Respuesta'},
  en_espera:           { bg: 'bg-slate-50',    text: 'text-slate-600',   border: 'border-slate-200',   label: 'En Espera'          },
  pendiente_reunion:   { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-200',  label: 'Pendiente Reunión'  },
  cotizacion:          { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200',  label: 'Cotización'         },
  comprometido:        { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   label: 'Comprometido'       },
  cerrado:             { bg: 'bg-green-50',    text: 'text-green-700',   border: 'border-green-300',   label: 'Cerrado'            },
  perdido:             { bg: 'bg-red-50',      text: 'text-red-600',     border: 'border-red-200',     label: 'Perdido'            },
  // Fallbacks para estados legacy en la DB
  propuesta:           { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200',  label: 'Cotización'         },
  negociacion:         { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   label: 'Comprometido'       },
  ganado:              { bg: 'bg-green-50',    text: 'text-green-700',   border: 'border-green-300',   label: 'Cerrado'            },
}

// Helper seguro para obtener el estilo de un estado (nunca crashea)
export function getEstadoStyle(estado: string) {
  return ESTADO_STYLES[estado] ?? { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: estado }
}

export const ESTADOS_ORDEN: Estado[] = [
  'prospecto',
  'pendiente_contacto',
  'contactado',
  'pendiente_respuesta',
  'en_espera',
  'pendiente_reunion',
  'cotizacion',
  'comprometido',
  'cerrado',
  'perdido',
]

export const PRIORIDAD_STYLES: Record<Prioridad, { bg: string; text: string; label: string }> = {
  alta:  { bg: 'bg-red-100',    text: 'text-red-700',    label: '🔴 Alta'  },
  media: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: '🟡 Media' },
  baja:  { bg: 'bg-gray-100',   text: 'text-gray-500',   label: '⚪ Baja'  },
  na:    { bg: 'bg-gray-50',    text: 'text-gray-400',   label: 'N/A'      },
}

export const EVENTO_ICONS: Record<TipoEvento, string> = {
  llamada: '📞', whatsapp: '💬', email: '📧', reunion: '🤝',
  propuesta_enviada: '📄', contrato: '✅', nota: '📝',
  estado_cambiado: '🔄', creacion: '🌱', tarea: '⏰',
}

export const EVENTO_LABELS: Record<TipoEvento, string> = {
  llamada: 'Llamada', whatsapp: 'WhatsApp', email: 'Email', reunion: 'Reunión',
  propuesta_enviada: 'Propuesta enviada', contrato: 'Contrato', nota: 'Nota',
  estado_cambiado: 'Cambio de estado', creacion: 'Creación', tarea: 'Tarea',
}
