/**
 * pages/admin/AdminChat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Widget flotante de chat para el administrador — mismo estilo que Chat.jsx
 * (estudiante/docente). Aparece como botón fijo en la esquina inferior derecha
 * de cualquier página del admin. Al abrir muestra un popup con:
 *   · columna izquierda → lista de conversaciones
 *   · columna derecha   → hilo de mensajes del usuario seleccionado
 *
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
        maxWidth:'78%',
        background: esAdmin ? '#0084ff' : '#f0f2f5',
        color: esAdmin ? '#fff' : '#050505',
        borderRadius: esAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding:'9px 13px',
        fontSize:14,
        lineHeight:1.45,
        wordBreak:'break-word',
        boxShadow:'0 1px 2px rgba(0,0,0,0.08)',
      }}>
        {mensaje.texto}
      </div>
      <span style={{ fontSize:10, color:'#8a8d91', marginTop:2, paddingInline:3 }}>{hora}</span>
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
        padding:'8px 10px',
        cursor:'pointer',
        display:'flex', alignItems:'center', gap:8,
        background: activa ? '#e7f3ff' : 'transparent',
        borderRadius:8,
        margin:'1px 4px',
        borderLeft: activa ? '3px solid #0084ff' : '3px solid transparent',
        transition:'background 0.15s',
      }}
      onMouseEnter={e => { if (!activa) e.currentTarget.style.background = '#f0f2f5' }}
      onMouseLeave={e => { if (!activa) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width:36, height:36, borderRadius:'50%', flexShrink:0,
        background: activa ? '#0084ff' : '#ccd0d5',
        color: activa ? '#fff' : '#444',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:700,
      }}>
        {iniciales || '👤'}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:4 }}>
          <p style={{ margin:0, fontSize:13, fontWeight: conv.sinLeer > 0 ? 700 : 600, color:'#050505', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100 }}>
            {conv.nombre} {conv.apellido}
          </p>
          <span style={{ fontSize:10, color:'#8a8d91', flexShrink:0 }}>{fecha}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:4 }}>
          <p style={{ margin:0, fontSize:11, color: conv.sinLeer > 0 ? '#050505' : '#8a8d91', fontWeight: conv.sinLeer > 0 ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110 }}>
            {conv.ultimoMensaje || 'Sin mensajes'}
          </p>
          {conv.sinLeer > 0 && (
            <span style={{ background:'#0084ff', color:'#fff', borderRadius:10, padding:'1px 6px', fontSize:10, fontWeight:700, flexShrink:0 }}>
              {conv.sinLeer}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal (widget flotante) ────────────────────────────────────
export default function AdminChat() {
  const { user }                                    = useAuth()
  const [abierto, setAbierto]                       = useState(false)
  const [vistaMovil, setVistaMovil]                 = useState('lista') // 'lista' | 'chat'
  const [conversaciones, setConversaciones]         = useState([])
  const [selectedUserId, setSelectedUserId]         = useState(null)
  const [selectedUserInfo, setSelectedUserInfo]     = useState(null)
  const [inputTexto, setInputTexto]                 = useState('')
  const [enviando, setEnviando]                     = useState(false)
  const [cargandoLista, setCargandoLista]           = useState(true)
  const [cargandoChat, setCargandoChat]             = useState(false)
  const bottomRef = useRef(null)

  // ── Realtime: mensajes del chat seleccionado ────────────────────────────
  const { mensajes, setMensajes } = usePusherChat({
    userId:         user?._id,
    esAdmin:        true,
    selectedUserId,
  })

  // ── Realtime: notificaciones globales ───────────────────────────────────
  const { limpiarNotificaciones } = usePusherAdminNotifications({
    activo: true,
    onNuevoMensaje: useCallback((data) => {
      if (data.userId !== selectedUserId) {
        toast(`💬 Nuevo mensaje de ${data.userName}`, {
          duration: 4000,
          style: { background:'#fff', color:'#050505', border:'1px solid #e4e6ea' },
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

  // ── Cargar lista de conversaciones al abrir ────────────────────────────
  useEffect(() => {
    if (!abierto) return
    setCargandoLista(true)
    api.get('/chat/admin/conversaciones')
      .then(({ data }) => setConversaciones(data?.data || []))
      .catch(() => toast.error('Error al cargar conversaciones'))
      .finally(() => setCargandoLista(false))
  }, [abierto])

  // ── Seleccionar usuario ────────────────────────────────────────────────
  const seleccionarUsuario = async (conv) => {
    if (conv.userId === selectedUserId) { setVistaMovil('chat'); return }
    setSelectedUserId(conv.userId)
    setSelectedUserInfo(conv)
    setMensajes([])
    setCargandoChat(true)
    setVistaMovil('chat')
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

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // ── Enviar respuesta ───────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes adminChatSlideUp {
          from { opacity:0; transform:translateY(20px) scale(0.97) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes adminChatPulse {
          0%,100% { transform:scale(1) }
          50%      { transform:scale(1.12) }
        }
        .adm-msg-input::placeholder { color:#bcc0c4 }
        .adm-msg-input:focus { outline:none }
        .adm-send-btn:hover:not(:disabled) { background:#006ddb !important }
        .adm-send-btn:disabled { opacity:0.45; cursor:default }
        .adm-conv-scroll::-webkit-scrollbar { width:3px }
        .adm-conv-scroll::-webkit-scrollbar-thumb { background:#ccd0d5; border-radius:3px }
        .adm-msgs-scroll::-webkit-scrollbar { width:4px }
        .adm-msgs-scroll::-webkit-scrollbar-thumb { background:#ccd0d5; border-radius:4px }
      `}</style>

      {/* ── Ventana flotante ── */}
      {abierto && (
        <div style={{
          position:'fixed', bottom:84, right:20, zIndex:9999,
          width:660, maxWidth:'calc(100vw - 40px)',
          height:500, maxHeight:'calc(100vh - 120px)',
          background:'#fff',
          borderRadius:16,
          boxShadow:'0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          animation:'adminChatSlideUp 0.22s ease-out',
        }}>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#0084ff 0%,#0066cc 100%)',
            padding:'11px 14px',
            display:'flex', alignItems:'center', gap:10,
            flexShrink:0,
          }}>
            {/* Botón volver en móvil */}
            {vistaMovil === 'chat' && selectedUserInfo && (
              <button
                onClick={() => setVistaMovil('lista')}
                style={{
                  background:'rgba(255,255,255,0.18)', border:'none', borderRadius:'50%',
                  width:28, height:28, cursor:'pointer', color:'#fff', fontSize:15,
                  display:'none', alignItems:'center', justifyContent:'center',
                  flexShrink:0,
                }}
                className="adm-back-btn"
              >←</button>
            )}
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'rgba(255,255,255,0.22)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, flexShrink:0,
            }}>🛡️</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.2 }}>
                Chat — Panel Admin
              </p>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.8)' }}>
                {conversaciones.length} conversaciones
                {totalNoLeidos > 0 && ` · ${totalNoLeidos} sin leer`}
              </p>
            </div>
            <button onClick={() => setAbierto(false)} style={{
              background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%',
              width:28, height:28, cursor:'pointer', color:'#fff', fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background 0.15s',
            }}>×</button>
          </div>

          {/* Cuerpo: dos columnas */}
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

            {/* ── Columna izquierda: lista de conversaciones ── */}
            <div style={{
              width:220, flexShrink:0,
              borderRight:'1px solid #e4e6ea',
              display:'flex', flexDirection:'column',
              background:'#fff',
              overflowY:'hidden',
            }}>
              <p style={{
                fontSize:10, fontWeight:700, color:'#8a8d91',
                textTransform:'uppercase', letterSpacing:'0.06em',
                padding:'8px 14px 4px', margin:0, flexShrink:0,
              }}>
                Conversaciones
              </p>
              <div className="adm-conv-scroll" style={{ flex:1, overflowY:'auto', paddingBottom:6 }}>
                {cargandoLista ? (
                  <div style={{ padding:20, textAlign:'center' }}><Spinner /></div>
                ) : conversaciones.length === 0 ? (
                  <p style={{ padding:16, fontSize:12, color:'#8a8d91', textAlign:'center' }}>Sin conversaciones</p>
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

            {/* ── Columna derecha: chat activo ── */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#f0f2f5', overflow:'hidden' }}>

              {/* Sub-header del usuario seleccionado */}
              {selectedUserInfo ? (
                <div style={{
                  padding:'8px 12px',
                  borderBottom:'1px solid #e4e6ea',
                  display:'flex', alignItems:'center', gap:8,
                  background:'#fff', flexShrink:0,
                }}>
                  <div style={{
                    width:30, height:30, borderRadius:'50%',
                    background:'#0084ff', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700, flexShrink:0,
                  }}>
                    {`${selectedUserInfo.nombre?.[0] || ''}${selectedUserInfo.apellido?.[0] || ''}`.toUpperCase() || '👤'}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#050505', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {selectedUserInfo.nombre} {selectedUserInfo.apellido}
                    </p>
                    <p style={{ margin:0, fontSize:11, color:'#8a8d91', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {selectedUserInfo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding:'8px 12px', borderBottom:'1px solid #e4e6ea', background:'#fff', flexShrink:0, height:47, display:'flex', alignItems:'center' }}>
                  <p style={{ margin:0, fontSize:13, color:'#8a8d91' }}>Selecciona una conversación</p>
                </div>
              )}

              {/* Mensajes */}
              <div className="adm-msgs-scroll" style={{
                flex:1, overflowY:'auto',
                padding:'12px 12px 6px',
                display:'flex', flexDirection:'column', gap:5,
              }}>
                {!selectedUserId && (
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:'#8a8d91', paddingTop:40 }}>
                    <span style={{ fontSize:36 }}>💬</span>
                    <p style={{ fontSize:13, margin:0, fontWeight:600, color:'#444', textAlign:'center' }}>Elige una conversación</p>
                    <p style={{ fontSize:12, margin:0, color:'#8a8d91', textAlign:'center' }}>Selecciona un usuario de la lista</p>
                  </div>
                )}
                {cargandoChat && (
                  <div style={{ display:'flex', justifyContent:'center', paddingTop:30 }}><Spinner /></div>
                )}
                {!cargandoChat && mensajes.map((msg) => (
                  <MensajeBurbuja key={msg._id} mensaje={msg} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input respuesta */}
              {selectedUserId && (
                <div style={{
                  padding:'8px 10px',
                  borderTop:'1px solid #e4e6ea',
                  display:'flex', alignItems:'flex-end', gap:6,
                  background:'#fff', flexShrink:0,
                }}>
                  <textarea
                    className="adm-msg-input"
                    value={inputTexto}
                    onChange={(e) => setInputTexto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Aa"
                    rows={1}
                    maxLength={2000}
                    style={{
                      flex:1, resize:'none',
                      border:'none',
                      background:'#f0f2f5',
                      borderRadius:20,
                      padding:'8px 14px',
                      fontSize:14,
                      fontFamily:'inherit',
                      lineHeight:1.45,
                      maxHeight:80,
                      overflowY:'auto',
                      color:'#050505',
                    }}
                    onInput={e => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
                    }}
                  />
                  <button
                    className="adm-send-btn"
                    onClick={handleResponder}
                    disabled={!inputTexto.trim() || enviando}
                    style={{
                      width:34, height:34, borderRadius:'50%',
                      background:'#0084ff', border:'none', cursor:'pointer',
                      color:'#fff', fontSize:16,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, transition:'background 0.15s',
                    }}
                  >
                    {enviando ? '…' : '➤'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Botón flotante ── */}
      <button
        onClick={() => setAbierto(o => !o)}
        title="Chat Admin"
        style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          width:56, height:56, borderRadius:'50%',
          background:'linear-gradient(135deg,#0084ff 0%,#0055cc 100%)',
          border:'none', cursor:'pointer',
          boxShadow:'0 4px 16px rgba(0,132,255,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24,
          transition:'transform 0.2s, box-shadow 0.2s',
          animation: totalNoLeidos > 0 && !abierto ? 'adminChatPulse 1.5s infinite' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {abierto ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.921 1.406 5.53 3.608 7.28V22l3.37-1.853A10.8 10.8 0 0012 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
          </svg>
        )}
        {totalNoLeidos > 0 && !abierto && (
          <span style={{
            position:'absolute', top:0, right:0,
            width:18, height:18, borderRadius:'50%',
            background:'#fa3e3e', color:'#fff',
            fontSize:10, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'2px solid #fff',
          }}>{totalNoLeidos > 9 ? '9+' : totalNoLeidos}</span>
        )}
      </button>
    </>
  )
}
