import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:39000/ws'
const TOKEN_KEY = 'auth_token'

let client: Client | null = null
let onAuthErrorCallback: (() => void) | null = null
const subscriptions = new Map<string, { unsubscribe: () => void }>()

export function connectWebSocket(token: string, onConnected?: () => void, onAuthError?: () => void) {
  if (client?.connected) return

  onAuthErrorCallback = onAuthError ?? null

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    // beforeConnect runs before every connection attempt (including reconnects),
    // so the token is always fresh from localStorage rather than frozen at creation time.
    beforeConnect: async () => {
      const freshToken = localStorage.getItem(TOKEN_KEY)
      if (!freshToken) {
        console.warn('[WS] No token available, stopping reconnect')
        await client?.deactivate()
        onAuthErrorCallback?.()
        return
      }
      client!.connectHeaders = { Authorization: `Bearer ${freshToken}` }
    },
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WS] Connected')
      onConnected?.()
    },
    onDisconnect: () => console.log('[WS] Disconnected'),
    onStompError: (frame) => {
      console.error('[WS] STOMP error', frame)
      const msg = frame.headers?.message ?? ''
      if (msg.includes('Invalid token') || msg.includes('Missing Authorization') || msg.includes('Unauthorized')) {
        console.warn('[WS] Auth error — stopping reconnect and logging out')
        client?.deactivate()
        onAuthErrorCallback?.()
      }
    },
    onWebSocketClose: (event) => {
      if (event.code === 1008 || event.code === 4001) {
        console.warn('[WS] Connection closed with auth error code', event.code)
        client?.deactivate()
        onAuthErrorCallback?.()
      }
    },
  })
  client.activate()
}

export function disconnectWebSocket() {
  client?.deactivate()
  client = null
  subscriptions.clear()
}

export function subscribe(topic: string, callback: (body: any) => void): () => void {
  if (!client?.connected) {
    console.warn('[WS] Cannot subscribe, not connected:', topic)
    return () => {}
  }
  const existing = subscriptions.get(topic)
  if (existing) return existing.unsubscribe

  const sub = client.subscribe(topic, (message) => {
    try {
      callback(JSON.parse(message.body))
    } catch (e) {
      console.error('[WS] Failed to parse message', e)
    }
  })

  const unsub = () => {
    sub.unsubscribe()
    subscriptions.delete(topic)
  }
  subscriptions.set(topic, { unsubscribe: unsub })
  return unsub
}

export function isConnected(): boolean {
  return client?.connected ?? false
}
