export interface TaskResponse {
  id: string
  tenantId: string
  leadId: string | null
  leadName: string | null
  assignedTo: string | null
  assignedToName: string | null
  title: string
  description: string | null
  dueAt: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
  overdue: boolean
}

export interface CreateTaskRequest {
  title: string
  description?: string
  leadId?: string
  assignedTo?: string
  dueAt?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  leadId?: string
  assignedTo?: string
  dueAt?: string
}

export interface TaskListParams {
  pending?: boolean
  leadId?: string
  page?: number
  size?: number
}
