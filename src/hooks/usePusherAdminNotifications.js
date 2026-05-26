/**
 * hooks/usePusherAdminNotifications.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook exclusivo para el admin que escucha el canal 'admin-chat' y
 * notifica cuando llega un nuevo mensaje de CUALQUIER usuario,
 * independientemente del chat que tenga abierto.
 *
 * Útil para:
 *  - Mostrar un badge/contador de mensajes sin leer en la lista de conversaciones.
 *  - Reproducir un sonido o mostrar una notificación toast al admin.
 *  - Actualizar la lista de conversaciones en tiempo real.
 *
 * @param {object} options
 * @param {boolean} options.activo - true solo si el usuario es admin
 * @param {function} [options.onNuevoMensaje] - callback opcional (data) => void
 *
 * @returns {{
 *   notificaciones: array,           // lista de payloads recibidos
 *   limpiarNotificaciones: function, // resetear el contador
 *   pusherConectado: boolean,
 * }}
 *
 * Uso:
 *   const { notificaciones, limpiarNotificaciones } = usePusherAdminNotifications({
 *     activo: isAdmin,
 *     onNuevoMensaje: (data) => toast(`Nuevo mensaje de ${data.userName}`),
 *   })
 */

import { useState, useEffect, useCallback } from 'react'
import pusherClient, { CHANNELS, EVENTS } from '../services/pusher'

export default function usePusherAdminNotifications({ activo, onNuevoMensaje } = {}) {
  const [notificaciones, setNotificaciones] = useState([])
  const [pusherConectado, setPusherConectado] = useState(false)

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([])
  }, [])

  useEffect(() => {
    // Solo suscribir si es admin y está activo
    if (!activo) return

    const channel = pusherClient.subscribe(CHANNELS.ADMIN_CHAT)

    channel.bind(EVENTS.NEW_MESSAGE, (data) => {
      // Agregar a la lista de notificaciones
      setNotificaciones((prev) => [...prev, data])

      // Llamar al callback externo si se proporcionó
      if (typeof onNuevoMensaje === 'function') {
        onNuevoMensaje(data)
      }
    })

    channel.bind('pusher:subscription_succeeded', () => setPusherConectado(true))
    channel.bind('pusher:subscription_error', ()  => setPusherConectado(false))

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(CHANNELS.ADMIN_CHAT)
      setPusherConectado(false)
    }
  }, [activo, onNuevoMensaje])

  return {
    notificaciones,
    limpiarNotificaciones,
    pusherConectado,
  }
}
