'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/pipeline')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#f7f7f3' }}>

      {/* Card login */}
      <div className="bg-white rounded-[22px] w-full max-w-[380px] overflow-hidden shadow-nok">

        {/* Header verde bosque */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center"
          style={{ backgroundColor: '#0b2922' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nok-16.jpg" alt="NOK" style={{ width: '160px', height: 'auto', mixBlendMode: 'screen' }} />
          <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mt-2"
            style={{ color: '#d6a700' }}>
            Growth CRM
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <h1 className="text-[18px] font-semibold mb-1" style={{ color: '#1d1d1b' }}>
            Bienvenido
          </h1>
          <p className="text-[13px] mb-6" style={{ color: '#6c6c6c' }}>
            Ingresa con tu cuenta de equipo
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#1d1d1b' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@nok.rent"
                required
                className="w-full px-3 py-2.5 text-[13px] rounded-[10px] outline-none transition-all"
                style={{
                  border: '1px solid #d4d4d4',
                  color: '#1d1d1b',
                  backgroundColor: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#d6a700'}
                onBlur={e => e.target.style.borderColor = '#d4d4d4'}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#1d1d1b' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 text-[13px] rounded-[10px] outline-none transition-all"
                style={{
                  border: '1px solid #d4d4d4',
                  color: '#1d1d1b',
                  backgroundColor: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#d6a700'}
                onBlur={e => e.target.style.borderColor = '#d4d4d4'}
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-[10px]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-[13px] font-semibold py-3 rounded-[10px] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#833b0e' }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#d6a700', (e.target as HTMLElement).style.color = '#1d1d1b')}
              onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = '#833b0e', (e.target as HTMLElement).style.color = 'white')}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-[11px] text-center mt-6" style={{ color: '#8b8b8b' }}>
            ¿No tienes acceso? Contacta a tu administrador
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[11px]" style={{ color: '#8b8b8b' }}>
        © 2026 NOK Property Management · República Dominicana
      </p>
    </div>
  )
}
