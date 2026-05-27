import type { GeneratePropertyContentRequest, GeneratePropertyContentResponse } from '@/types/property'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/ai/properties`

class PropertyAiService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  /**
   * Gera um título atraente para uma propriedade
   */
  async generateTitle(data: GeneratePropertyContentRequest): Promise<GeneratePropertyContentResponse> {
    return this.request<GeneratePropertyContentResponse>('/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  /**
   * Gera uma descrição atraente para uma propriedade
   */
  async generateDescription(data: GeneratePropertyContentRequest): Promise<GeneratePropertyContentResponse> {
    return this.request<GeneratePropertyContentResponse>('/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  /**
   * Gera título e descrição para uma propriedade
   */
  async generateAll(data: GeneratePropertyContentRequest): Promise<GeneratePropertyContentResponse> {
    return this.request<GeneratePropertyContentResponse>('/generate-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }
}

export default new PropertyAiService()
