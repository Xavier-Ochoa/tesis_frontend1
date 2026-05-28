/**
 * pages/user/Chat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Chat de soporte con el admin — estilo Messenger flotante.
 *
 * El widget aparece como botón fijo en la esquina inferior derecha de toda la
 * página (position: fixed). Al hacer clic se abre la ventana de chat.
 *
 * La lógica HTTP y Pusher se mantiene exactamente igual que antes.
 */

import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import usePusherChat from '../../hooks/usePusherChat'

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
function MensajeBurbuja({ mensaje }) {
  const esAdmin = mensaje.esAdmin
  const hora = new Date(mensaje.createdAt).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  })
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: esAdmin ? 'flex-start' : 'flex-end', marginBottom:2 }}>
      <div style={{
        maxWidth:'78%',
        background: esAdmin ? '#f0f0f0' : '#0084ff',
        color: esAdmin ? '#050505' : '#fff',
        borderRadius: esAdmin ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
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

// ── Widget principal ──────────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useAuth()
  const [abierto, setAbierto]         = useState(false)
  const [inputTexto, setInputTexto]   = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState(null)
  const [noLeidos, setNoLeidos]       = useState(0)
  const bottomRef = useRef(null)

  // ── Realtime: hook Pusher ─────────────────────────────────────────────────
  const { mensajes, setMensajes, pusherConectado } = usePusherChat({
    userId:  user?._id,
    esAdmin: false,
  })

  // ── Carga inicial del historial (HTTP) ────────────────────────────────────
  useEffect(() => {
    if (!user?._id || !abierto) return
    setCargando(true)
    setError(null)
    api.get('/chat/mensajes')
      .then(({ data }) => {
        setMensajes(data?.data?.mensajes || [])
        setNoLeidos(0)
      })
      .catch(() => setError('No se pudo cargar la conversación.'))
      .finally(() => setCargando(false))
  }, [user?._id, abierto, setMensajes])

  // ── Incrementar contador de no leídos cuando llega mensaje admin y chat cerrado
  useEffect(() => {
    if (!abierto && mensajes.length > 0) {
      const ultimo = mensajes[mensajes.length - 1]
      if (ultimo?.esAdmin) setNoLeidos(n => n + 1)
    }
  }, [mensajes])

  // Limpiar no leídos al abrir
  useEffect(() => {
    if (abierto) setNoLeidos(0)
  }, [abierto])

  // ── Auto-scroll al último mensaje ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto])

  // ── Enviar mensaje (HTTP) ─────────────────────────────────────────────────
  const handleEnviar = async () => {
    const texto = inputTexto.trim()
    if (!texto || enviando) return
    setEnviando(true)
    try {
      const { data } = await api.post('/chat/mensaje', { texto })
      setMensajes(prev => [...prev, {
        _id:       data.data._id,
        texto:     data.data.texto,
        esAdmin:   false,
        leido:     false,
        createdAt: data.data.fecha || new Date().toISOString(),
      }])
      setInputTexto('')
    } catch {
      setError('Error al enviar el mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar() }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Ventana de chat ── */}
      {abierto && (
        <div style={{
          position:'fixed', bottom:84, right:20, zIndex:9999,
          width:340, maxWidth:'calc(100vw - 40px)',
          height:480, maxHeight:'calc(100vh - 120px)',
          background:'#fff',
          borderRadius:16,
          boxShadow:'0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          animation:'messengerSlideUp 0.22s ease-out',
        }}>
          <style>{`
            @keyframes messengerSlideUp {
              from { opacity:0; transform:translateY(20px) scale(0.97) }
              to   { opacity:1; transform:translateY(0) scale(1) }
            }
            @keyframes messengerPulse {
              0%,100% { transform:scale(1) }
              50%      { transform:scale(1.12) }
            }
            .msg-input::placeholder { color:#bcc0c4 }
            .msg-input:focus { outline:none }
            .msg-send-btn:hover:not(:disabled) { background:#006ddb !important }
            .msg-send-btn:disabled { opacity:0.45; cursor:default }
          `}</style>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#0084ff 0%,#0066cc 100%)',
            padding:'12px 14px',
            display:'flex', alignItems:'center', gap:10,
            flexShrink:0,
          }}>
            <div style={{
              width:38, height:38, borderRadius:'50%',
              background:'rgba(255,255,255,0.22)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, flexShrink:0,
            }}>🎓</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.2 }}>
                Soporte POLIESFOT
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <div style={{
                  width:7, height:7, borderRadius:'50%',
                  background: pusherConectado ? '#4ade80' : 'rgba(255,255,255,0.4)',
                  flexShrink:0,
                }}/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>
                  {pusherConectado ? 'En línea' : 'Conectando…'}
                </span>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} style={{
              background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%',
              width:28, height:28, cursor:'pointer', color:'#fff', fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background 0.15s',
            }}>×</button>
          </div>

          {/* Área de mensajes */}
          <div style={{
            flex:1, overflowY:'auto',
            padding:'12px 12px 4px',
            display:'flex', flexDirection:'column', gap:6,
            background:'#fff',
          }}>
            {cargando && (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
                <Spinner />
              </div>
            )}
            {!cargando && mensajes.length === 0 && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:'#8a8d91', paddingTop:30 }}>
                <span style={{ fontSize:36 }}>💬</span>
                <p style={{ fontSize:13, margin:0, textAlign:'center', lineHeight:1.4 }}>
                  ¡Hola! ¿En qué podemos ayudarte?<br/>
                  <span style={{ fontSize:12 }}>Escribe tu mensaje y te responderemos pronto.</span>
                </p>
              </div>
            )}
            {mensajes.map(msg => (
              <MensajeBurbuja key={msg._id} mensaje={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize:12, color:'#ef4444', margin:'0 12px 4px', textAlign:'center' }}>{error}</p>
          )}

          {/* Input */}
          <div style={{
            padding:'8px 10px',
            borderTop:'1px solid #e4e6ea',
            display:'flex', alignItems:'flex-end', gap:6,
            background:'#fff',
            flexShrink:0,
          }}>
            <textarea
              className="msg-input"
              value={inputTexto}
              onChange={e => setInputTexto(e.target.value)}
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
                maxHeight:90,
                overflowY:'auto',
                color:'#050505',
              }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px'
              }}
            />
            <button
              className="msg-send-btn"
              onClick={handleEnviar}
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
        </div>
      )}

      {/* ── Botón flotante ── */}
      <button
        onClick={() => setAbierto(o => !o)}
        title="Chat con Administración"
        style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          width:56, height:56, borderRadius:'50%',
          background:'linear-gradient(135deg,#0084ff 0%,#0055cc 100%)',
          border:'none', cursor:'pointer',
          boxShadow:'0 4px 16px rgba(0,132,255,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24,
          transition:'transform 0.2s, box-shadow 0.2s',
          animation: noLeidos > 0 && !abierto ? 'messengerPulse 1.5s infinite' : 'none',
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
        {/* Badge no leídos */}
        {noLeidos > 0 && !abierto && (
          <span style={{
            position:'absolute', top:0, right:0,
            width:18, height:18, borderRadius:'50%',
            background:'#fa3e3e', color:'#fff',
            fontSize:10, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'2px solid #fff',
          }}>{noLeidos > 9 ? '9+' : noLeidos}</span>
        )}
      </button>
    </>
  )
}
