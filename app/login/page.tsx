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
          <svg viewBox="27 16 192 72" xmlns="http://www.w3.org/2000/svg" style={{ width: '160px', height: 'auto' }} fill="white">
            <g>
              <path d="M123.5,54.41v23.2h-13.1V56.22c0-4.43-1.66-6.62-4.96-6.62c-4.09,0-6.44,2.85-6.44,7.7V77.6h-13.1V39.56h9.19l1.8,3.92c2.83-3.16,7.06-5.05,11.98-5.05C117.69,38.44,123.5,44.71,123.5,54.41z"/>
              <path d="M129.12,58.58c0-11.79,8.93-20.27,21.33-20.27c12.36,0,21.33,8.48,21.33,20.27c0,11.75-8.97,20.27-21.33,20.27C138.04,78.85,129.12,70.33,129.12,58.58z M150.45,67.08c4.78,0,8.2-3.47,8.2-8.5c0-5-3.43-8.5-8.2-8.5s-8.2,3.47-8.2,8.5S145.67,67.08,150.45,67.08z"/>
              <path d="M201.03,77.6l-9.53-16.09V77.6h-13.1V25.82h13.1v28.64l9.06-14.9h14.71l-11.86,18.13l13.06,19.91H201.03z"/>
            </g>
            <path d="M50.19,33.51c0,0,0.01,0,0.01,0c6.85,0.01,12.4,5.43,12.4,12.12c0,4.25-2.25,7.98-5.64,10.14c-0.88,0.56-1.2,1.68-0.84,2.66l6.02,16.11c0.74,1.74-0.64,3.63-2.65,3.63H40.38c-2.08,0-3.46-2-2.6-3.75l6.7-15.92c0.42-1,0.08-2.18-0.84-2.76c-3.89-2.44-6.48-6.86-5.73-11.8C38.8,38.04,44.08,33.51,50.19,33.51 M50.21,26.51h-0.02c-9.54,0-17.79,7.04-19.21,16.38c-0.91,5.99,1.32,11.99,5.65,16.19l-5.25,12.49c-1.33,2.91-1.12,6.25,0.59,8.98c1.8,2.89,4.95,4.62,8.41,4.62h19.11c3.35,0,6.44-1.64,8.27-4.4c1.73-2.61,2.06-5.88,0.91-8.78l-4.79-12.83c3.6-3.53,5.73-8.39,5.73-13.54C69.61,35.1,60.9,26.52,50.21,26.51z"/>
          </svg>
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
