import type { LeadPoolResponse, CreateLeadPoolRequest, UpdateLeadPoolRequest } from '@/types/lead'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/lead-pools`

class LeadPoolsService {
  private async request<T>(path = '', options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  async list(): Promise<LeadPoolResponse[]> {
    return this.request<LeadPoolResponse[]>('')
  }

  async create(data: CreateLeadPoolRequest): Promise<LeadPoolResponse> {
    return this.request<LeadPoolResponse>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateLeadPoolRequest): Promise<LeadPoolResponse> {
    return this.request<LeadPoolResponse>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/${id}`, { method: 'DELETE' })
  }
}

export default new LeadPoolsService()
