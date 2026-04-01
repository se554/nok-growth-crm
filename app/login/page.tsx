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

  const inpStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    borderRadius: '10px',
    border: '1px solid var(--border-mid)',
    background: 'var(--surface-hi)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>

      <div className="w-full max-w-[380px] rounded-[22px] overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center"
          style={{ background: 'var(--surface-el)', borderBottom: '1px solid var(--border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nok_negro.png" alt="NOK" style={{ width: '140px', height: 'auto', filter: 'brightness(0) invert(1)' }} />
          <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mt-2"
            style={{ color: 'var(--gold)' }}>
            Growth CRM
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <h1 className="text-[18px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Bienvenido
          </h1>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>
            Ingresa con tu cuenta de equipo
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@nok.rent"
                required
                style={inpStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inpStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
            </div>

            {error && (
              <p className="text-[12px] px-3 py-2 rounded-[10px]"
                style={{ color: '#f87171', background: 'rgba(242,0,34,0.08)', border: '1px solid rgba(242,0,34,0.2)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-[11px] text-center mt-6" style={{ color: 'var(--text-dim)' }}>
            ¿No tienes acceso? Contacta a tu administrador
          </p>
        </div>
      </div>

      <p className="absolute bottom-6 text-[11px]" style={{ color: 'var(--text-dim)' }}>
        © 2026 NOK Property Management · República Dominicana
      </p>
    </div>
  )
}
