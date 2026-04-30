import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectWebSocket, disconnectWebSocket, subscribe, isConnected } from '@/services/websocket'
import { useAuthStore } from '@/stores/auth'

export const useWebSocketStore = defineStore('websocket', () => {
  const connected = ref(false)

  function connect() {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    if (!token) {
      console.warn('[WS] Cannot connect: no access token')
      return
    }
    connectWebSocket(token, () => { connected.value = true })
  }

  function disconnect() {
    disconnectWebSocket()
    connected.value = false
  }

  function subscribeToLeadWhatsapp(tenantId: string, leadId: string, callback: (event: any) => void) {
    const topic = `/topic/${tenantId}.whatsapp.lead.${leadId}`
    return subscribe(topic, callback)
  }

  function subscribeToTenantWhatsapp(tenantId: string, callback: (event: any) => void) {
    const topic = `/topic/${tenantId}.whatsapp`
    return subscribe(topic, callback)
  }

  return { connected, connect, disconnect, subscribeToLeadWhatsapp, subscribeToTenantWhatsapp }
})
