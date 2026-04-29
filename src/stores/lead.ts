import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  LeadResponse,
  LeadEventResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadNoteRequest,
  LeadNoteResponse,
  LeadListParams,
  PageResponse,
} from '@/types/lead'
import leadService from '@/services/lead'

export const useLeadStore = defineStore('lead', () => {
  const leads = ref<PageResponse<LeadResponse> | null>(null)
  const currentLead = ref<LeadResponse | null>(null)
  const events = ref<LeadEventResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLeads(params: LeadListParams = {}) {
    isLoading.value = true
    error.value = null
    try {
      leads.value = await leadService.list(params)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar leads'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchLead(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentLead.value = await leadService.get(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Lead não encontrado'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEvents(leadId: string) {
    try {
      events.value = await leadService.getEvents(leadId)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar histórico'
    }
  }

  async function createLead(data: CreateLeadRequest): Promise<LeadResponse> {
    isLoading.value = true
    error.value = null
    try {
      const result = await leadService.create(data)
      await fetchLeads()
      return result
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao criar lead'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateLead(id: string, data: UpdateLeadRequest): Promise<LeadResponse> {
    isLoading.value = true
    error.value = null
    try {
      const result = await leadService.update(id, data)
      if (currentLead.value?.id === id) currentLead.value = result
      if (leads.value) {
        const idx = leads.value.content.findIndex(l => l.id === id)
        if (idx !== -1) leads.value.content[idx] = result
      }
      return result
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar lead'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteLead(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await leadService.delete(id)
      if (leads.value) {
        leads.value.content = leads.value.content.filter(l => l.id !== id)
        leads.value.totalElements--
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao remover lead'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function addNote(leadId: string, data: LeadNoteRequest): Promise<LeadNoteResponse> {
    try {
      const note = await leadService.addNote(leadId, data)
      if (currentLead.value?.id === leadId) {
        currentLead.value.notes = [note, ...currentLead.value.notes]
      }
      return note
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao adicionar nota'
      throw e
    }
  }

  return {
    leads,
    currentLead,
    events,
    isLoading,
    error,
    fetchLeads,
    fetchLead,
    fetchEvents,
    createLead,
    updateLead,
    deleteLead,
    addNote,
  }
})
