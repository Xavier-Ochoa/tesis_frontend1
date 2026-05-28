/**
 * pages/admin/AdminChat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Panel de chat del administrador — estilo Messenger, tema coherente con la app.
 * La lógica HTTP y Pusher se mantiene exactamente igual que antes.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import usePusherChat from '../../hooks/usePusherChat'
import usePusherAdminNotifications from '../../hooks/usePusherAdminNotifications'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
function MensajeBurbuja({ mensaje }) {
  const esAdmin = mensaje.esAdmin
  const hora = new Date(mensaje.createdAt).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  })
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: esAdmin ? 'flex-end' : 'flex-start', marginBottom:2 }}>
      <div style={{
        maxWidth:'72%',
        background: esAdmin ? 'var(--primary)' : 'var(--surface2)',
        color: esAdmin ? '#fff' : 'var(--text-1)',
        border: esAdmin ? 'none' : '1px solid var(--border)',
        borderRadius: esAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding:'9px 13px',
        fontSize:14,
        lineHeight:1.45,
        wordBreak:'break-word',
        boxShadow:'0 1px 2px rgba(0,0,0,0.07)',
      }}>
        {mensaje.texto}
      </div>
      <span style={{ fontSize:10, color:'var(--text-3)', marginTop:2, paddingInline:3 }}>{hora}</span>
    </div>
  )
}

// ── Item de conversación ──────────────────────────────────────────────────────
function ConversacionItem({ conv, activa, onClick }) {
  const fecha = conv.ultimaFecha
    ? new Date(conv.ultimaFecha).toLocaleDateString('es-EC', { day:'2-digit', month:'short' })
    : ''
  const iniciales = `${conv.nombre?.[0] || ''}${conv.apellido?.[0] || ''}`.toUpperCase()

  return (
    <div
      onClick={onClick}
      style={{
        padding:'10px 12px',
        cursor:'pointer',
        display:'flex', alignItems:'center', gap:10,
        background: activa ? 'var(--primary-l)' : 'transparent',
        borderRadius:10,
        margin:'2px 6px',
        borderLeft: activa ? '3px solid var(--primary)' : '3px solid transparent',
        transition:'background 0.15s',
      }}
      onMouseEnter={e => { if (!activa) e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { if (!activa) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div style={{
        width:44, height:44, borderRadius:'50%', flexShrink:0,
        background: activa ? 'var(--primary)' : 'var(--border2)',
        color: activa ? '#fff' : 'var(--text-2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:15, fontWeight:700, fontFamily:'Syne,sans-serif',
        transition:'background 0.15s',
      }}>
        {iniciales || '👤'}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:4 }}>
          <p style={{ margin:0, fontSize:14, fontWeight: conv.sinLeer > 0 ? 700 : 600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:130 }}>
            {conv.nombre} {conv.apellido}
          </p>
          <span style={{ fontSize:11, color:'var(--text-3)', flexShrink:0 }}>{fecha}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:4 }}>
          <p style={{ margin:0, fontSize:12, color: conv.sinLeer > 0 ? 'var(--text-1)' : 'var(--text-3)', fontWeight: conv.sinLeer > 0 ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:150 }}>
            {conv.ultimoMensaje || 'Sin mensajes'}
          </p>
          {conv.sinLeer > 0 && (
            <span style={{ background:'var(--primary)', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:11, fontWeight:700, flexShrink:0 }}>
              {conv.sinLeer}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
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
    selectedUserId,
  })

  // ── Realtime: notificaciones globales ─────────────────────────────────────
  const { notificaciones, limpiarNotificaciones } = usePusherAdminNotifications({
    activo: true,
    onNuevoMensaje: useCallback((data) => {
      if (data.userId !== selectedUserId) {
        toast(`💬 Nuevo mensaje de ${data.userName}`, {
          duration: 4000,
          style: { background:'var(--surface)', color:'var(--text-1)', border:'1px solid var(--border)' },
        })
      }
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

  // ── Seleccionar usuario ────────────────────────────────────────────────────
  const seleccionarUsuario = async (conv) => {
    if (conv.userId === selectedUserId) return
    setSelectedUserId(conv.userId)
    setSelectedUserInfo(conv)
    setMensajes([])
    setCargandoChat(true)
    limpiarNotificaciones()
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

  // ── Enviar respuesta ───────────────────────────────────────────────────────
  const handleResponder = async () => {
    const texto = inputTexto.trim()
    if (!texto || enviando || !selectedUserId) return
    setEnviando(true)
    try {
      const { data } = await api.post('/chat/admin/responder', { userId: selectedUserId, texto })
      setMensajes((prev) => [...prev, {
        _id:       data.data._id,
        texto:     data.data.texto,
        esAdmin:   true,
        leido:     false,
        createdAt: data.data.fecha || new Date().toISOString(),
      }])
      setInputTexto('')
    } catch {
      toast.error('Error al enviar la respuesta')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResponder() }
  }

  const totalNoLeidos = conversaciones.reduce((acc, c) => acc + (c.sinLeer || 0), 0)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ animation:'slideUp 0.4s ease-out' }}>
      <style>{`
        .admin-msg-input::placeholder { color:var(--text-3) }
        .admin-msg-input:focus { outline:none }
        .admin-send-btn:hover:not(:disabled) { opacity:0.85 }
        .admin-send-btn:disabled { opacity:0.4; cursor:default }
        .conv-scroll::-webkit-scrollbar { width:4px }
        .conv-scroll::-webkit-scrollbar-track { background:transparent }
        .conv-scroll::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px }
        .msgs-scroll::-webkit-scrollbar { width:5px }
        .msgs-scroll::-webkit-scrollbar-track { background:transparent }
        .msgs-scroll::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px }
      `}</style>

      {/* ── Cabecera ── */}
      <div style={{ marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'var(--text-1)', margin:'0 0 2px', letterSpacing:'-0.03em' }}>
            💬 Chat — Panel Admin
          </h1>
          <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>Conversaciones en tiempo real con usuarios</p>
        </div>
        {totalNoLeidos > 0 && (
          <div style={{ background:'var(--primary)', color:'#fff', borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:700 }}>
            {totalNoLeidos} sin leer
          </div>
        )}
      </div>

      {/* ── Layout Messenger ── */}
      <div style={{
        display:'grid', gridTemplateColumns:'300px 1fr',
        height:'calc(100vh - 210px)', minHeight:440,
        background:'var(--surface)',
        border:'1px solid var(--border)',
        borderRadius:16,
        overflow:'hidden',
        boxShadow:'var(--shadow-lg)',
      }}>

        {/* ── Sidebar: lista de conversaciones ── */}
        <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--surface)' }}>

          {/* Buscador decorativo */}
          <div style={{ padding:'12px 12px 8px' }}>
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'7px 14px', fontSize:13, color:'var(--text-3)', display:'flex', alignItems:'center', gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="var(--text-3)" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/></svg>
              Buscar conversación
            </div>
          </div>

          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'4px 18px 6px', margin:0 }}>
            Conversaciones
          </p>

          <div className="conv-scroll" style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
            {cargandoLista ? (
              <div style={{ padding:24, textAlign:'center' }}><Spinner /></div>
            ) : conversaciones.length === 0 ? (
              <p style={{ padding:24, fontSize:13, color:'var(--text-3)', textAlign:'center' }}>Sin conversaciones aún</p>
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
        <div style={{ display:'flex', flexDirection:'column', background:'var(--bg)' }}>

          {/* Header del chat activo */}
          {selectedUserInfo ? (
            <div style={{
              padding:'10px 16px',
              borderBottom:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:10,
              background:'var(--surface)',
            }}>
              <div style={{
                width:38, height:38, borderRadius:'50%',
                background:'var(--primary)',
                color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:700, fontFamily:'Syne,sans-serif', flexShrink:0,
              }}>
                {`${selectedUserInfo.nombre?.[0] || ''}${selectedUserInfo.apellido?.[0] || ''}`.toUpperCase() || '👤'}
              </div>
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:'var(--text-1)', fontFamily:'Syne,sans-serif' }}>
                  {selectedUserInfo.nombre} {selectedUserInfo.apellido}
                </p>
                <p style={{ margin:0, fontSize:12, color:'var(--text-3)' }}>{selectedUserInfo.email}</p>
              </div>
            </div>
          ) : (
            <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', height:59, display:'flex', alignItems:'center', background:'var(--surface)' }}>
              <p style={{ margin:0, fontSize:14, color:'var(--text-3)' }}>Selecciona una conversación</p>
            </div>
          )}

          {/* Área de mensajes */}
          <div className="msgs-scroll" style={{
            flex:1, overflowY:'auto',
            padding:'16px 16px 8px',
            display:'flex', flexDirection:'column', gap:6,
          }}>
            {!selectedUserId && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, color:'var(--text-3)', paddingTop:60 }}>
                <span style={{ fontSize:48 }}>💬</span>
                <p style={{ fontSize:14, margin:0, fontWeight:600, color:'var(--text-2)' }}>Elige una conversación</p>
                <p style={{ fontSize:12, margin:0, color:'var(--text-3)' }}>Selecciona un usuario de la lista para ver sus mensajes</p>
              </div>
            )}

            {cargandoChat && (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}><Spinner /></div>
            )}

            {!cargandoChat && mensajes.map((msg) => (
              <MensajeBurbuja key={msg._id} mensaje={msg} />
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input respuesta */}
          {selectedUserId && (
            <div style={{
              padding:'8px 12px',
              borderTop:'1px solid var(--border)',
              display:'flex', alignItems:'flex-end', gap:8,
              background:'var(--surface)',
              flexShrink:0,
            }}>
              <textarea
                className="admin-msg-input"
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu respuesta… (Enter para enviar)"
                rows={1}
                maxLength={2000}
                style={{
                  flex:1, resize:'none',
                  border:'1px solid var(--border)',
                  background:'var(--surface2)',
                  borderRadius:20,
                  padding:'9px 16px',
                  fontSize:14,
                  fontFamily:'inherit',
                  lineHeight:1.45,
                  maxHeight:90,
                  overflowY:'auto',
                  color:'var(--text-1)',
                }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px'
                }}
              />
              <button
                className="admin-send-btn"
                onClick={handleResponder}
                disabled={!inputTexto.trim() || enviando}
                className="btn-primary"
                style={{
                  width:36, height:36, borderRadius:'50%',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, fontSize:16, padding:0,
                }}
              >
                {enviando ? '…' : '➤'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
