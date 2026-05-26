/**
 * services/pusher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Instancia singleton de Pusher para el frontend.
 *
 * Variables de entorno requeridas en .env:
 *   VITE_PUSHER_KEY      → Clave pública de Pusher (misma que PUSHER_KEY en backend)
 *   VITE_PUSHER_CLUSTER  → Cluster de Pusher (ej: us2, eu, ap1...)
 *
 * Uso:
 *   import pusherClient from '../services/pusher'
 *   const channel = pusherClient.subscribe('admin-chat')
 */

import Pusher from 'pusher-js'

// ── Constantes de canales y eventos (espejo del backend) ──────────────────────

export const CHANNELS = {
  /** Canal que escucha el admin para recibir mensajes de todos los usuarios */
  ADMIN_CHAT: 'admin-chat',

  /**
   * Canal privado por usuario para recibir respuestas del admin.
   * @param {string} userId - MongoDB _id del usuario
   * @returns {string}
   */
  USER_CHAT: (userId) => `chat-user-${userId}`,
}

export const EVENTS = {
  /** Mensaje nuevo de usuario → notificado al admin */
  NEW_MESSAGE: 'new-message',

  /** Respuesta del admin → notificada al usuario */
  ADMIN_REPLY: 'admin-reply',
}

// ── Validación de variables de entorno ────────────────────────────────────────

const PUSHER_KEY     = import.meta.env.VITE_PUSHER_KEY
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER

if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  console.warn(
    '⚠️ [Pusher] Variables de entorno faltantes: VITE_PUSHER_KEY y/o VITE_PUSHER_CLUSTER. ' +
    'El chat en tiempo real no funcionará hasta que se configuren en el archivo .env'
  )
}

// ── Instancia singleton ───────────────────────────────────────────────────────

const pusherClient = new Pusher(PUSHER_KEY || '', {
  cluster: PUSHER_CLUSTER || 'us2',
  forceTLS: true,
  // Nivel de log: 'debug' en desarrollo, silencioso en producción
  logToConsole: import.meta.env.DEV,
})

export default pusherClient
