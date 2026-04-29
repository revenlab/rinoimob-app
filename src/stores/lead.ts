import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  LeadResponse,
  LeadEventResponse,
  LeadPropertyResponse,
  AddLeadPropertyRequest,
  InterestLevel,
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

  async function addLeadProperty(leadId: string, data: AddLeadPropertyRequest): Promise<LeadPropertyResponse> {
    try {
      const lp = await leadService.addProperty(leadId, data)
      if (currentLead.value?.id === leadId) {
        currentLead.value.properties = [...(currentLead.value.properties ?? []), lp]
      }
      return lp
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao adicionar imóvel'
      throw e
    }
  }

  async function updateLeadPropertyInterest(leadId: string, linkId: string, interestLevel: InterestLevel): Promise<LeadPropertyResponse> {
    try {
      const updated = await leadService.updatePropertyInterest(leadId, linkId, { interestLevel })
      if (currentLead.value?.id === leadId) {
        const idx = (currentLead.value.properties ?? []).findIndex(lp => lp.id === linkId)
        if (idx !== -1) currentLead.value.properties[idx] = updated
      }
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar interesse'
      throw e
    }
  }

  async function removeLeadProperty(leadId: string, linkId: string): Promise<void> {
    try {
      await leadService.removeProperty(leadId, linkId)
      if (currentLead.value?.id === leadId) {
        currentLead.value.properties = (currentLead.value.properties ?? []).filter(lp => lp.id !== linkId)
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao remover imóvel'
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
    addLeadProperty,
    updateLeadPropertyInterest,
    removeLeadProperty,
  }
})
