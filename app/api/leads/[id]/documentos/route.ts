import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/leads/[id]/documentos — subir documento al Storage y crear evento
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const autor = (formData.get('autor') as string) || 'NOK Team'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const storagePath = `${params.id}/${timestamp}_${file.name}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabaseAdmin.storage
    .from('contratos')
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage
    .from('contratos')
    .getPublicUrl(storagePath)

  const docUrl = urlData.publicUrl

  // Crear evento documento_adjunto
  const { data, error } = await supabaseAdmin
    .from('lead_eventos')
    .insert({
      lead_id: params.id,
      tipo: 'documento_adjunto',
      descripcion: `Documento adjunto: ${file.name}`,
      autor,
      fecha: new Date().toISOString(),
      metadata: {
        doc_nombre: file.name,
        doc_url: docUrl,
        doc_tamano: file.size,
      },
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Actualizar fecha_ultimo_contacto
  await supabaseAdmin
    .from('leads')
    .update({ fecha_ultimo_contacto: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json(data, { status: 201 })
}
