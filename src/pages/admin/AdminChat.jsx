/**
 * pages/admin/AdminChat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Panel de chat del administrador.
 *
 * Arquitectura:
 *  - Lista todas las conversaciones via GET /api/chat/admin/conversaciones
 *  - Al seleccionar un usuario, carga su historial via GET /api/chat/admin/mensajes/:userId
 *  - Escucha mensajes nuevos de todos los usuarios via Pusher (canal: admin-chat)
 *  - Al tener un usuario seleccionado, también actualiza el chat en tiempo real
 *  - Responde via POST /api/chat/admin/responder
 *
 * La lógica realtime está completamente delegada a usePusherChat y
 * usePusherAdminNotifications. Este componente solo maneja UI y HTTP.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import usePusherChat from '../../hooks/usePusherChat'
import usePusherAdminNotifications from '../../hooks/usePusherAdminNotifications'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminChat() {
  const { user }                                    = useAuth()
  const [conversaciones, setConversaciones]         = useState([])
  const [selectedUserId, setSelectedUserId]         = useState(null)
  const [selectedUserInfo, setSelectedUserInfo]     = useState(null)
  const [inputTexto, setInputTexto]                 = useState('')
  const [enviando, setEnviando]                     = useState(false)
  const [cargandoLista, setCargandoLista]           = useState(true)
  const [cargandoChat, setCargandoChat]             = useState(false)
  const bottomRef = useRef(null)

  // ── Realtime: mensajes del chat seleccionado ──────────────────────────────
  const { mensajes, setMensajes } = usePusherChat({
    userId:         user?._id,
    esAdmin:        true,
    selectedUserId, // Solo agrega mensajes del usuario seleccionado al estado
  })

  // ── Realtime: notificaciones globales (cualquier usuario) ─────────────────
  const { notificaciones, limpiarNotificaciones } = usePusherAdminNotifications({
    activo: true,
    onNuevoMensaje: useCallback((data) => {
      // Toast de notificación si el mensaje es de otro usuario (no el seleccionado)
      if (data.userId !== selectedUserId) {
        toast(`💬 Nuevo mensaje de ${data.userName}`, {
          duration: 4000,
          style: { background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)' },
        })
      }

      // Actualizar el contador en la lista de conversaciones
      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.userId === data.userId
            ? { ...conv, ultimoMensaje: data.texto, ultimaFecha: data.fecha, sinLeer: (conv.sinLeer || 0) + (data.userId !== selectedUserId ? 1 : 0) }
            : conv
        )
      )
    }, [selectedUserId])
  })

  // ── Cargar lista de conversaciones ────────────────────────────────────────
  useEffect(() => {
    setCargandoLista(true)
    api.get('/chat/admin/conversaciones')
      .then(({ data }) => setConversaciones(data?.data || []))
      .catch(() => toast.error('Error al cargar conversaciones'))
      .finally(() => setCargandoLista(false))
  }, [])

  // ── Seleccionar usuario: cargar historial ─────────────────────────────────
  const seleccionarUsuario = async (conv) => {
    if (conv.userId === selectedUserId) return

    setSelectedUserId(conv.userId)
    setSelectedUserInfo(conv)
    setMensajes([])
    setCargandoChat(true)
    limpiarNotificaciones()

    // Limpiar badge de sinLeer del usuario seleccionado
    setConversaciones((prev) =>
      prev.map((c) => c.userId === conv.userId ? { ...c, sinLeer: 0 } : c)
    )

    try {
      const { data } = await api.get(`/chat/admin/mensajes/${conv.userId}`)
      setMensajes(data?.data?.mensajes || [])
    } catch {
      toast.error('Error al cargar el historial')
    } finally {
      setCargandoChat(false)
    }
  }

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // ── Enviar respuesta (HTTP) ────────────────────────────────────────────────
  const handleResponder = async () => {
    const texto = inputTexto.trim()
    if (!texto || enviando || !selectedUserId) return

    setEnviando(true)
    try {
      const { data } = await api.post('/chat/admin/responder', {
        userId: selectedUserId,
        texto,
      })
      // Agregar la respuesta al estado local del chat activo
      setMensajes((prev) => [
        ...prev,
        {
          _id:       data.data._id,
          texto:     data.data.texto,
          esAdmin:   true,
          leido:     false,
          createdAt: data.data.fecha || new Date().toISOString(),
        },
      ])
      setInputTexto('')
    } catch {
      toast.error('Error al enviar la respuesta')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleResponder()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
            💬 Chat — Panel Admin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            Conversaciones en tiempo real con usuarios
          </p>
        </div>
        {notificaciones.length > 0 && (
          <div style={{ background: '#ef4444', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
            {notificaciones.length} nuevo{notificaciones.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Layout: lista + chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 'calc(100vh - 220px)', minHeight: 400 }}>

        {/* ── Lista de conversaciones ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Conversaciones
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cargandoLista ? (
              <div style={{ padding: 24, textAlign: 'center' }}><Spinner /></div>
            ) : conversaciones.length === 0 ? (
              <p style={{ padding: 24, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>Sin conversaciones aún</p>
            ) : (
              conversaciones.map((conv) => (
                <ConversacionItem
                  key={conv.userId}
                  conv={conv}
                  activa={conv.userId === selectedUserId}
                  onClick={() => seleccionarUsuario(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Panel de chat ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chat header */}
          {selectedUserInfo && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  {selectedUserInfo.nombre} {selectedUserInfo.apellido}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{selectedUserInfo.email}</p>
              </div>
            </div>
          )}

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selectedUserId && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-3)' }}>
                <span style={{ fontSize: 40 }}>👈</span>
                <p style={{ fontSize: 14, margin: 0 }}>Selecciona una conversación</p>
              </div>
            )}

            {cargandoChat && <Spinner />}

            {!cargandoChat && mensajes.map((msg) => (
              <MensajeBurbuja key={msg._id} mensaje={msg} />
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input respuesta */}
          {selectedUserId && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <textarea
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu respuesta… (Enter para enviar)"
                rows={2}
                maxLength={2000}
                style={{
                  flex: 1, resize: 'none', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  color: 'var(--text-1)', padding: '8px 12px',
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button
                onClick={handleResponder}
                disabled={!inputTexto.trim() || enviando}
                className="btn-primary"
                style={{ alignSelf: 'flex-end', padding: '8px 18px', borderRadius: 10, whiteSpace: 'nowrap', fontSize: 14 }}
              >
                {enviando ? '…' : 'Responder'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function ConversacionItem({ conv, activa, onClick }) {
  const fecha = conv.ultimaFecha
    ? new Date(conv.ultimaFecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
    : ''

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
        background: activa ? 'rgba(99,102,241,0.08)' : 'transparent',
        borderLeft: activa ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!activa) e.currentTarget.style.background = 'var(--bg)' }}
      onMouseLeave={e => { if (!activa) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
          {conv.nombre} {conv.apellido}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{fecha}</span>
          {conv.sinLeer > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {conv.sinLeer}
            </span>
          )}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {conv.ultimoMensaje}
      </p>
    </div>
  )
}

function MensajeBurbuja({ mensaje }) {
  const esAdmin = mensaje.esAdmin
  const hora = new Date(mensaje.createdAt).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: esAdmin ? 'flex-end' : 'flex-start' }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3, paddingInline: 4 }}>
        {esAdmin ? '🔵 Tú (Admin)' : '🟣 Usuario'}
      </span>
      <div style={{
        maxWidth: '70%',
        background: esAdmin ? 'var(--primary)' : 'var(--bg)',
        color: esAdmin ? '#fff' : 'var(--text-1)',
        border: esAdmin ? 'none' : '1px solid var(--border)',
        borderRadius: esAdmin ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        padding: '9px 13px',
        fontSize: 14,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {mensaje.texto}
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, paddingInline: 4 }}>{hora}</span>
    </div>
  )
}
