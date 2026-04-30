export interface TaskTypeResponse {
  id: string
  name: string
  color: string
  icon: string | null
  position: number
  system: boolean
}

export interface CreateTaskTypeRequest {
  name: string
  color?: string
  icon?: string
  position?: number
}

export interface UpdateTaskTypeRequest {
  name?: string
  color?: string
  icon?: string
  position?: number
  active?: boolean
}

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
  taskTypeId: string | null
  taskTypeName: string | null
  taskTypeColor: string | null
  taskTypeIcon: string | null
}

export interface CreateTaskRequest {
  title: string
  description?: string
  leadId?: string
  assignedTo?: string
  dueAt?: string
  taskTypeId?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  leadId?: string
  assignedTo?: string
  dueAt?: string
  taskTypeId?: string
}

export interface TaskListParams {
  pending?: boolean
  leadId?: string
  page?: number
  size?: number
}
