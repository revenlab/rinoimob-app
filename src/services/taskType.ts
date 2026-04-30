import type { TaskTypeResponse, CreateTaskTypeRequest, UpdateTaskTypeRequest } from '@/types/task'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/task-types`

class TaskTypeService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  async list(): Promise<TaskTypeResponse[]> {
    return this.request<TaskTypeResponse[]>('')
  }

  async create(data: CreateTaskTypeRequest): Promise<TaskTypeResponse> {
    return this.request<TaskTypeResponse>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateTaskTypeRequest): Promise<TaskTypeResponse> {
    return this.request<TaskTypeResponse>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async remove(id: string): Promise<void> {
    return this.request<void>(`/${id}`, { method: 'DELETE' })
  }
}

export default new TaskTypeService()
