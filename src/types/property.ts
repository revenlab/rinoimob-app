export type PropertyOperation = 'SALE' | 'RENT' | 'SEASONAL'
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'RURAL'
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
export type PropertyCondition = 'NEW' | 'USED' | 'UNDER_CONSTRUCTION'

import type { CategoryResponse } from '@/types/category'
export type { CategoryResponse }

export interface PropertyPhotoResponse {
  id: string
  url: string
  position: number
  isCover: boolean
  altText: string | null
  createdAt: string
}

export interface FloorPlanPhotoResponse {
  id: string
  url: string
  position: number
  createdAt: string
}

export interface FloorPlanResponse {
  id: string
  name: string
  area: number | null
  createdAt: string
  photos: FloorPlanPhotoResponse[]
}

export interface PropertySummaryResponse {
  id: string
  title: string
  operation: PropertyOperation
  propertyType: PropertyType
  status: PropertyStatus
  condition: PropertyCondition | null
  referenceCode: string | null
  price: number | null
  currency: string
  areaTotal: number | null
  bedrooms: number | null
  bathrooms: number | null
  addressCity: string | null
  addressState: string | null
  addressCountry: string
  coverPhotoId: string | null
  coverPhotoUrl: string | null
  categories: CategoryResponse[]
  createdAt: string
}

export interface PropertyResponse {
  id: string
  title: string
  description: string | null
  operation: PropertyOperation
  propertyType: PropertyType
  status: PropertyStatus
  condition: PropertyCondition | null
  referenceCode: string | null
  price: number | null
  currency: string
  taxes: number | null
  condoFee: number | null
  areaTotal: number | null
  areaUseful: number | null
  bedrooms: number | null
  suites: number | null
  bathrooms: number | null
  parking: number | null
  floorNumber: number | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string | null
  addressCity: string | null
  addressState: string | null
  addressCountry: string
  addressZip: string | null
  lat: number | null
  lng: number | null
  coverPhotoId: string | null
  attributes: Record<string, unknown>
  categories: CategoryResponse[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  photos: PropertyPhotoResponse[]
  floorPlans: FloorPlanResponse[]
}

export interface CreatePropertyRequest {
  title: string
  description?: string
  operation: PropertyOperation
  propertyType: PropertyType
  status?: PropertyStatus
  condition?: PropertyCondition
  referenceCode?: string
  price?: number
  currency?: string
  taxes?: number
  condoFee?: number
  areaTotal?: number
  areaUseful?: number
  bedrooms?: number
  suites?: number
  bathrooms?: number
  parking?: number
  floorNumber?: number
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressCountry?: string
  addressZip?: string
  lat?: number
  lng?: number
  attributes?: Record<string, unknown>
  categoryIds?: string[]
}

export type UpdatePropertyRequest = Partial<CreatePropertyRequest & { status: PropertyStatus }>

export interface CreateFloorPlanRequest {
  name: string
  area?: number
}

export interface PropertyListParams {
  status?: PropertyStatus
  operation?: PropertyOperation
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  city?: string
  page?: number
  size?: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
