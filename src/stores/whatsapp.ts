import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WhatsappInstance, WhatsappMessage } from '@/types/whatsapp'
import whatsappService from '@/services/whatsapp'

export const useWhatsappStore = defineStore('whatsapp', () => {
  const instances = ref<WhatsappInstance[]>([])
  const messages = ref<Record<string, WhatsappMessage[]>>({})

  async function fetchInstances() {
    instances.value = await whatsappService.listInstances()
  }

  async function fetchMessages(leadId: string) {
    messages.value[leadId] = await whatsappService.getMessages(leadId)
  }

  return { instances, messages, fetchInstances, fetchMessages }
})
