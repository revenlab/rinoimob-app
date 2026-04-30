import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:39000/ws'

let client: Client | null = null
const subscriptions = new Map<string, { unsubscribe: () => void }>()

export function connectWebSocket(token: string, onConnected?: () => void) {
  if (client?.connected) return

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WS] Connected')
      onConnected?.()
    },
    onDisconnect: () => console.log('[WS] Disconnected'),
    onStompError: (frame) => console.error('[WS] STOMP error', frame),
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
