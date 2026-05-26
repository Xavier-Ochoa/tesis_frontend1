/**
 * pages/user/Chat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Página de chat del usuario con el admin.
 *
 * Arquitectura:
 *  - Carga el historial via GET /api/chat/mensajes (lógica HTTP existente)
 *  - Escucha nuevos mensajes del admin via Pusher (canal: chat-user-{userId})
 *  - Envía mensajes via POST /api/chat/mensaje (lógica HTTP existente)
 *  - El hook usePusherChat maneja toda la lógica realtime
 *
 * NO modifica la lógica HTTP existente, solo la complementa.
 */

import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import usePusherChat from '../../hooks/usePusherChat'

export default function Chat() {
  const { user } = useAuth()
  const [inputTexto, setInputTexto]   = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)
  const bottomRef = useRef(null)

  // ── Realtime: hook Pusher ─────────────────────────────────────────────────
  const { mensajes, setMensajes, pusherConectado } = usePusherChat({
    userId:  user?._id,
    esAdmin: false,
  })

  // ── Carga inicial del historial (HTTP) ────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return

    setCargando(true)
    api.get('/chat/mensajes')
      .then(({ data }) => {
        setMensajes(data?.data?.mensajes || [])
      })
      .catch(() => setError('No se pudo cargar la conversación.'))
      .finally(() => setCargando(false))
  }, [user?._id, setMensajes])

  // ── Auto-scroll al último mensaje ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // ── Enviar mensaje (HTTP) ─────────────────────────────────────────────────
  const handleEnviar = async () => {
    const texto = inputTexto.trim()
    if (!texto || enviando) return

    setEnviando(true)
    try {
      const { data } = await api.post('/chat/mensaje', { texto })
      // Agregar el mensaje propio al estado local inmediatamente
      setMensajes((prev) => [
        ...prev,
        {
          _id:       data.data._id,
          texto:     data.data.texto,
          esAdmin:   false,
          leido:     false,
          createdAt: data.data.fecha || new Date().toISOString(),
        },
      ])
      setInputTexto('')
    } catch {
      setError('Error al enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (cargando) return <Spinner />

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out', display: 'flex', flexDirection: 'column', maxWidth: 720, margin: '0 auto', height: 'calc(100vh - 130px)' }}>

      {/* Header */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
            💬 Chat con Administración
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            Consultas y soporte — POLIESFOT
          </p>
        </div>

        {/* Indicador de conexión Pusher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: pusherConectado ? '#10b981' : 'var(--text-3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: pusherConectado ? '#10b981' : 'var(--border2)', flexShrink: 0 }} />
          {pusherConectado ? 'En línea' : 'Conectando…'}
        </div>
      </div>

      {/* Área de mensajes */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: '0.75rem',
      }}>
        {mensajes.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-3)' }}>
            <span style={{ fontSize: 40 }}>💬</span>
            <p style={{ fontSize: 14, margin: 0 }}>Aún no hay mensajes. ¡Envía el primero!</p>
          </div>
        )}

        {mensajes.map((msg) => (
          <MensajeBurbuja key={msg._id} mensaje={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 8px', textAlign: 'center' }}>{error}</p>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={inputTexto}
          onChange={(e) => setInputTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje… (Enter para enviar)"
          rows={2}
          maxLength={2000}
          style={{
            flex: 1,
            resize: 'none',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-1)',
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleEnviar}
          disabled={!inputTexto.trim() || enviando}
          className="btn-primary"
          style={{ alignSelf: 'flex-end', padding: '10px 20px', borderRadius: 12, whiteSpace: 'nowrap' }}
        >
          {enviando ? '…' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-componente: burbuja de mensaje ────────────────────────────────────────

function MensajeBurbuja({ mensaje }) {
  const esAdmin = mensaje.esAdmin
  const hora = new Date(mensaje.createdAt).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: esAdmin ? 'flex-start' : 'flex-end',
    }}>
      {/* Etiqueta */}
      <span style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3, paddingInline: 4 }}>
        {esAdmin ? '🔵 Administración' : '🟣 Tú'}
      </span>

      {/* Burbuja */}
      <div style={{
        maxWidth: '75%',
        background: esAdmin ? 'var(--bg)' : 'var(--primary)',
        color: esAdmin ? 'var(--text-1)' : '#fff',
        border: esAdmin ? '1px solid var(--border)' : 'none',
        borderRadius: esAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding: '10px 14px',
        fontSize: 14,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {mensaje.texto}
      </div>

      {/* Hora */}
      <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, paddingInline: 4 }}>
        {hora}
      </span>
    </div>
  )
}
