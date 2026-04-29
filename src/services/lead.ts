import type {
  LeadResponse,
  LeadEventResponse,
  LeadPropertyResponse,
  AddLeadPropertyRequest,
  UpdateLeadPropertyRequest,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadNoteRequest,
  LeadNoteResponse,
  LeadListParams,
  LeadStatsResponse,
  PageResponse,
} from '@/types/lead'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/leads`

class LeadService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  async list(params: LeadListParams = {}): Promise<PageResponse<LeadResponse>> {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.page != null) query.set('page', String(params.page))
    if (params.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return this.request<PageResponse<LeadResponse>>(qs ? `?${qs}` : '')
  }

  async get(id: string): Promise<LeadResponse> {
    return this.request<LeadResponse>(`/${id}`)
  }

  async create(data: CreateLeadRequest): Promise<LeadResponse> {
    return this.request<LeadResponse>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateLeadRequest): Promise<LeadResponse> {
    return this.request<LeadResponse>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/${id}`, { method: 'DELETE' })
  }

  async addNote(leadId: string, data: LeadNoteRequest): Promise<LeadNoteResponse> {
    return this.request<LeadNoteResponse>(`/${leadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async getEvents(leadId: string): Promise<LeadEventResponse[]> {
    return this.request<LeadEventResponse[]>(`/${leadId}/events`)
  }

  async addProperty(leadId: string, data: AddLeadPropertyRequest): Promise<LeadPropertyResponse> {
    return this.request<LeadPropertyResponse>(`/${leadId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updatePropertyInterest(leadId: string, linkId: string, data: UpdateLeadPropertyRequest): Promise<LeadPropertyResponse> {
    return this.request<LeadPropertyResponse>(`/${leadId}/properties/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async removeProperty(leadId: string, linkId: string): Promise<void> {
    return this.request<void>(`/${leadId}/properties/${linkId}`, { method: 'DELETE' })
  }

  async getStats(): Promise<LeadStatsResponse> {
    return this.request<LeadStatsResponse>('/stats')
  }
}

export default new LeadService()
