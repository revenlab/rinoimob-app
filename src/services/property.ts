import type {
  PropertySummaryResponse,
  PropertyResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyPhotoResponse,
  FloorPlanResponse,
  FloorPlanPhotoResponse,
  CreateFloorPlanRequest,
  PropertyListParams,
  PageResponse,
} from '@/types/property'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const BASE = `${API_BASE_URL}/api/v1/properties`

class PropertyService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string> || {}),
      },
    })
    if (!response.ok) {
      let message = 'Request failed'
      try {
        const err = await response.json()
        message = err.message || message
      } catch { /* non-JSON */ }
      throw new Error(message)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : undefined as T
  }

  async list(params: PropertyListParams = {}): Promise<PageResponse<PropertySummaryResponse>> {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.operation) query.set('operation', params.operation)
    if (params.propertyType) query.set('propertyType', params.propertyType)
    if (params.minPrice != null) query.set('minPrice', String(params.minPrice))
    if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice))
    if (params.bedrooms != null) query.set('bedrooms', String(params.bedrooms))
    if (params.city) query.set('city', params.city)
    if (params.page != null) query.set('page', String(params.page))
    if (params.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return this.request<PageResponse<PropertySummaryResponse>>(qs ? `?${qs}` : '')
  }

  async get(id: string): Promise<PropertyResponse> {
    return this.request<PropertyResponse>(`/${id}`)
  }

  async create(data: CreatePropertyRequest): Promise<PropertyResponse> {
    return this.request<PropertyResponse>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdatePropertyRequest): Promise<PropertyResponse> {
    return this.request<PropertyResponse>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/${id}`, { method: 'DELETE' })
  }

  async uploadPhoto(propertyId: string, file: File, altText?: string): Promise<PropertyPhotoResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('altText', altText)
    return this.request<PropertyPhotoResponse>(`/${propertyId}/photos`, {
      method: 'POST',
      body: formData,
    })
  }

  async setCoverPhoto(propertyId: string, photoId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/photos/${photoId}/cover`, { method: 'PATCH' })
  }

  async deletePhoto(propertyId: string, photoId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/photos/${photoId}`, { method: 'DELETE' })
  }

  async addFloorPlan(propertyId: string, data: CreateFloorPlanRequest): Promise<FloorPlanResponse> {
    return this.request<FloorPlanResponse>(`/${propertyId}/floor-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteFloorPlan(propertyId: string, planId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/floor-plans/${planId}`, { method: 'DELETE' })
  }

  async uploadFloorPlanPhoto(propertyId: string, planId: string, file: File): Promise<FloorPlanPhotoResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return this.request<FloorPlanPhotoResponse>(`/${propertyId}/floor-plans/${planId}/photos`, {
      method: 'POST',
      body: formData,
    })
  }
}

export default new PropertyService()
