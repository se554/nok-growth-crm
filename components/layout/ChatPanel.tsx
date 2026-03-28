'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { clsx } from 'clsx'
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

  // Rotar placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto scroll
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
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantText,
                    }
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
    <aside className="w-[320px] shrink-0 bg-white border-l border-[#E8E6E0] flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E8E6E0]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="w-2 h-2 rounded-full bg-green-500 absolute inset-0 animate-ping opacity-60" />
          </div>
          <p className="text-[13px] font-medium text-[#1A1A1A]">Asistente NOK</p>
        </div>
        <p className="text-[11px] text-[#6B6B6B] mt-0.5 ml-4">Powered by Claude</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[#C9A84C] text-white rounded-tr-sm'
                  : 'bg-[#F5F3EE] text-[#1A1A1A] rounded-tl-sm'
              )}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : '')}
            </div>
          </div>
        ))}

        {/* Tool use indicator */}
        {loading && loadingText && (
          <div className="flex justify-start">
            <div className="bg-[#F5F3EE] rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-[#6B6B6B] italic">
              {loadingText}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugerencias */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1 rounded-full border border-[#E8E6E0] text-[#6B6B6B] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 border border-[#E8E6E0] rounded-xl px-3 py-2 focus-within:border-[#C9A84C] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            disabled={loading}
            className="flex-1 text-[13px] bg-transparent outline-none text-[#1A1A1A] placeholder-[#6B6B6B] disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg bg-[#C9A84C] flex items-center justify-center disabled:opacity-30 hover:bg-[#b8963f] transition-all"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </aside>
  )
}
