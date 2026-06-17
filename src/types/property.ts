export type PropertyOperation = 'SALE' | 'RENT' | 'SEASONAL'
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'RURAL'
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
export type PropertyCondition = 'NEW' | 'USED' | 'UNDER_CONSTRUCTION'
export type PropertyVideoSource = 'UPLOAD' | 'YOUTUBE'

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
  isCover: boolean
  createdAt: string
}

export interface FloorPlanResponse {
  id: string
  name: string
  area: number | null
  createdAt: string
  photos: FloorPlanPhotoResponse[]
}

export interface PropertyVideoResponse {
  id: string
  source: PropertyVideoSource
  url: string
  youtubeVideoId: string | null
  title: string | null
  position: number
  createdAt: string
}

export interface PropertyTypeResponse {
  id: string
  code: PropertyType
  label: string
  position: number
  active: boolean
}

export interface UpdatePropertyTypeRequest {
  label?: string
  position?: number
  active?: boolean
}

export const DEFAULT_PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Apartamento',
  LAND: 'Terreno',
  COMMERCIAL: 'Comercial',
  RURAL: 'Rural',
}

export const DEFAULT_PROPERTY_TYPES: PropertyTypeResponse[] = Object.entries(DEFAULT_PROPERTY_TYPE_LABELS).map(([code, label], index) => ({
  id: code,
  code: code as PropertyType,
  label,
  position: (index + 1) * 10,
  active: true,
}))

export function propertyTypeLabel(code: PropertyType | string, types: PropertyTypeResponse[] = DEFAULT_PROPERTY_TYPES): string {
  return types.find(type => type.code === code)?.label ?? DEFAULT_PROPERTY_TYPE_LABELS[code as PropertyType] ?? code
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
  slug?: string | null
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
  videos: PropertyVideoResponse[]
}

export interface CreatePropertyRequest {
  title: string
  slug?: string | null
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

export interface CreateYoutubeVideoRequest {
  url: string
  title?: string
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

export interface GeneratePropertyContentRequest {
  bedrooms?: string
  bathrooms?: string
  suites?: string
  parking?: string
  areaTotal?: string
  propertyType?: string
  city?: string
  neighborhood?: string
  price?: number
  currency?: string
  operation?: string
  photoDescription?: string
}

export interface GeneratePropertyContentResponse {
  title?: string | null
  description?: string | null
  generatedAtMs: number
}
