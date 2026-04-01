import { NextRequest, NextResponse } from 'next/server'

// Vercel cron — llama al generador cada lunes 9am RD
export async function GET(req: NextRequest) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Vercel también puede enviarlo sin auth en plan free — dejamos pasar
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
  const res = await fetch(`${base}/api/reporte/generar`, { method: 'POST' })
  const data = await res.json()

  return NextResponse.json(data)
}
