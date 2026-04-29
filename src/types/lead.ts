export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON'

export interface LeadNoteResponse {
  id: string
  leadId: string
  userId: string
  content: string
  createdAt: string
}

export interface LeadResponse {
  id: string
  tenantId: string
  propertyId: string | null
  name: string
  email: string | null
  phone: string | null
  message: string | null
  status: LeadStatus
  source: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  notes: LeadNoteResponse[]
}

export interface CreateLeadRequest {
  name: string
  email?: string
  phone?: string
  message?: string
  propertyId?: string
  source?: string
}

export interface UpdateLeadRequest {
  name?: string
  email?: string
  phone?: string
  message?: string
  status?: LeadStatus
  assignedTo?: string
}

export interface LeadNoteRequest {
  content: string
}

export interface LeadListParams {
  status?: LeadStatus
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
