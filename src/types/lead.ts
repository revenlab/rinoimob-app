export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON'
export type LeadEventType = 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UNASSIGNED' | 'NOTE_ADDED' | 'PROPERTY_LINKED' | 'PROPERTY_UNLINKED'

export interface UserSummary {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  active: boolean
}

export interface LeadEventResponse {
  id: string
  leadId: string
  userId: string | null
  eventType: LeadEventType
  description: string | null
  createdAt: string
}

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
  assignedToName: string | null
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
  assignedTo?: string
  source?: string
}

export interface UpdateLeadRequest {
  name?: string
  email?: string
  phone?: string
  message?: string
  status?: LeadStatus
  assignedTo?: string
  propertyId?: string
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
