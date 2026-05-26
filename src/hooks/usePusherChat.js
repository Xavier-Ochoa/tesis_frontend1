/**
 * hooks/usePusherChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook reutilizable que encapsula toda la lógica realtime de Pusher
 * para el chat usuario ↔ admin.
 *
 * Principios:
 *  - No reemplaza la lógica HTTP (GET historial, POST mensaje).
 *  - Solo añade mensajes nuevos al estado existente via eventos Pusher.
 *  - Limpia suscripciones al desmontar (evita memory leaks).
 *  - Es agnóstico de UI: no renderiza nada, solo gestiona estado y eventos.
 *
 * @param {object} options
 * @param {string|null} options.userId   - _id del usuario autenticado
 * @param {boolean}     options.esAdmin  - true si el usuario es admin
 * @param {string|null} [options.selectedUserId] - (solo admin) userId del chat abierto
 *
 * @returns {{
 *   mensajes: array,
 *   setMensajes: function,
 *   pusherConectado: boolean,
 * }}
 *
 * Uso en componente de usuario:
 *   const { mensajes, setMensajes, pusherConectado } = usePusherChat({ userId: user._id, esAdmin: false })
 *
 * Uso en componente de admin:
 *   const { mensajes, setMensajes } = usePusherChat({ userId: adminId, esAdmin: true, selectedUserId: userId })
 */

import { useState, useEffect, useCallback } from 'react'
import pusherClient, { CHANNELS, EVENTS } from '../services/pusher'

export default function usePusherChat({ userId, esAdmin, selectedUserId = null }) {
  const [mensajes, setMensajes]             = useState([])
  const [pusherConectado, setPusherConectado] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Agrega un mensaje al estado evitando duplicados por _id.
   * Se usa como callback estable para los event handlers de Pusher.
   */
  const agregarMensaje = useCallback((nuevoMensaje) => {
    setMensajes((prev) => {
      // Evitar duplicados: si ya existe un mensaje con el mismo _id, ignorar
      const yaExiste = prev.some((m) => m._id === nuevoMensaje._id)
      if (yaExiste) return prev
      return [...prev, nuevoMensaje]
    })
  }, [])

  // ── Suscripción Pusher ─────────────────────────────────────────────────────

  useEffect(() => {
    // No suscribir si no hay userId válido
    if (!userId) return

    let channel = null

    if (esAdmin) {
      // ── ADMIN: escucha el canal global 'admin-chat' ──
      // Recibe mensajes nuevos de cualquier usuario
      channel = pusherClient.subscribe(CHANNELS.ADMIN_CHAT)

      /**
       * Evento: new-message
       * Payload del backend:
       *   { mensajeId, userId, userName, texto, fecha, canal }
       *
       * El admin solo actualiza el estado del chat si el mensaje
       * corresponde al usuario que tiene actualmente seleccionado.
       */
      channel.bind(EVENTS.NEW_MESSAGE, (data) => {
        // Si hay un usuario seleccionado, solo agregar si es su mensaje
        if (selectedUserId && data.userId !== selectedUserId) return

        agregarMensaje({
          _id:      data.mensajeId,
          texto:    data.texto,
          esAdmin:  false,
          leido:    false,
          createdAt: data.fecha,
          usuario:  data.userId,
          // Metadatos adicionales útiles para la UI del admin
          _userName: data.userName,
          _canal:    data.canal,
        })
      })

    } else {
      // ── USUARIO: escucha su canal privado 'chat-user-{userId}' ──
      // Recibe respuestas del admin
      channel = pusherClient.subscribe(CHANNELS.USER_CHAT(userId))

      /**
       * Evento: admin-reply
       * Payload del backend:
       *   { mensajeId, adminNombre, texto, fecha }
       */
      channel.bind(EVENTS.ADMIN_REPLY, (data) => {
        agregarMensaje({
          _id:       data.mensajeId,
          texto:     data.texto,
          esAdmin:   true,
          leido:     false,
          createdAt: data.fecha,
        })
      })
    }

    // ── Estado de conexión ─────────────────────────────────────────────────
    channel.bind('pusher:subscription_succeeded', () => {
      setPusherConectado(true)
    })

    channel.bind('pusher:subscription_error', (err) => {
      console.error('[Pusher] Error de suscripción:', err)
      setPusherConectado(false)
    })

    // ── Cleanup al desmontar o cuando cambian las dependencias ─────────────
    return () => {
      if (channel) {
        // Remover todos los listeners antes de desuscribir
        channel.unbind_all()
        pusherClient.unsubscribe(
          esAdmin ? CHANNELS.ADMIN_CHAT : CHANNELS.USER_CHAT(userId)
        )
      }
      setPusherConectado(false)
    }
  }, [userId, esAdmin, selectedUserId, agregarMensaje])

  return {
    mensajes,
    setMensajes,
    pusherConectado,
  }
}
