'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'

const SUGERENCIAS = [
  'Sin contacto esta semana',
  'Valor del pipeline',
  'Leads en negociación',
]

const PLACEHOLDERS = [
  '¿Quién no ha respondido?',
  'Cambia X a negociación',
  '¿Cuánto vale el pipeline?',
  'Anota que llamé a Ana...',
]

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente NOK. Puedo consultar leads, actualizar estados y registrar actividad. ¿En qué te ayudo?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setLoadingText('Pensando...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.ok) throw new Error('Error en el servidor')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      if (reader) {
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'tool_use') {
                  setLoadingText(parsed.label || 'Consultando...')
                } else if (parsed.type === 'text') {
                  assistantText += parsed.text
                  setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'assistant', content: assistantText }
                    return updated
                  })
                }
              } catch {
                // ignorar líneas no JSON
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Hubo un error. Intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }

  return (
    <aside className="w-[300px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-50" />
          </div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Asistente NOK</p>
        </div>
        <p className="text-[10px] mt-0.5 ml-4.5 tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Powered by Claude
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[88%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed"
              style={msg.role === 'user'
                ? { background: 'var(--gold)', color: '#1D1D1B', borderBottomRightRadius: '4px' }
                : { background: 'var(--surface-el)', color: 'var(--text-primary)', borderBottomLeftRadius: '4px', border: '1px solid var(--border)' }
              }
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                </span>
              ) : '')}
            </div>
          </div>
        ))}

        {loading && loadingText && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3 py-2 text-[11px] italic"
              style={{ background: 'var(--surface-el)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
              {loadingText}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-[10px] px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
            style={{ background: 'var(--surface-hi)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-4 shrink-0">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
          style={{ background: 'var(--surface-el)', border: '1px solid var(--border-mid)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            disabled={loading}
            className="flex-1 text-[12.5px] bg-transparent outline-none disabled:opacity-50"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all shrink-0"
            style={{ background: 'var(--gold)' }}
          >
            <Send size={13} style={{ color: '#1D1D1B' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
