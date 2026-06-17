import type {
  PropertySummaryResponse,
  PropertyResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyPhotoResponse,
  FloorPlanResponse,
  FloorPlanPhotoResponse,
  CreateFloorPlanRequest,
  CreateYoutubeVideoRequest,
  PropertyVideoResponse,
  PropertyType,
  PropertyTypeResponse,
  UpdatePropertyTypeRequest,
  PropertyListParams,
  PageResponse,
} from '@/types/property'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/properties`

class PropertyService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
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

  async uploadVideo(propertyId: string, file: File, title?: string): Promise<PropertyVideoResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    return this.request<PropertyVideoResponse>(`/${propertyId}/videos/upload`, {
      method: 'POST',
      body: formData,
    })
  }

  async addYoutubeVideo(propertyId: string, data: CreateYoutubeVideoRequest): Promise<PropertyVideoResponse> {
    return this.request<PropertyVideoResponse>(`/${propertyId}/videos/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteVideo(propertyId: string, videoId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/videos/${videoId}`, { method: 'DELETE' })
  }

  async listPropertyTypes(activeOnly = false): Promise<PropertyTypeResponse[]> {
    return apiFetch<PropertyTypeResponse[]>(`/api/v1/property-types${activeOnly ? '?activeOnly=true' : ''}`)
  }

  async updatePropertyType(code: PropertyType, data: UpdatePropertyTypeRequest): Promise<PropertyTypeResponse> {
    return apiFetch<PropertyTypeResponse>(`/api/v1/property-types/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async uploadPropertyTypeCoverImage(code: PropertyType, file: File): Promise<PropertyTypeResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetch<PropertyTypeResponse>(`/api/v1/property-types/${code}/cover-image`, {
      method: 'POST',
      body: formData,
    })
  }

  async deletePropertyTypeCoverImage(code: PropertyType): Promise<PropertyTypeResponse> {
    return apiFetch<PropertyTypeResponse>(`/api/v1/property-types/${code}/cover-image`, {
      method: 'DELETE',
    })
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

  async setFloorPlanPhotoCover(propertyId: string, planId: string, photoId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/floor-plans/${planId}/photos/${photoId}/cover`, { method: 'PATCH' })
  }

  async deleteFloorPlanPhoto(propertyId: string, planId: string, photoId: string): Promise<void> {
    return this.request<void>(`/${propertyId}/floor-plans/${planId}/photos/${photoId}`, { method: 'DELETE' })
  }
}

export default new PropertyService()
