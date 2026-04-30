import type { TaskResponse, CreateTaskRequest, UpdateTaskRequest, TaskListParams } from '@/types/task'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/tasks`

class TaskService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  async list(params: TaskListParams = {}): Promise<{ content: TaskResponse[]; totalElements: number; totalPages: number }> {
    const query = new URLSearchParams()
    if (params.pending != null) query.set('pending', String(params.pending))
    if (params.leadId) query.set('leadId', params.leadId)
    if (params.page != null) query.set('page', String(params.page))
    if (params.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return this.request(qs ? `?${qs}` : '')
  }

  async create(data: CreateTaskRequest): Promise<TaskResponse> {
    return this.request<TaskResponse>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateTaskRequest): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async complete(id: string): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/${id}/complete`, { method: 'POST' })
  }

  async remove(id: string): Promise<void> {
    return this.request<void>(`/${id}`, { method: 'DELETE' })
  }
}

export default new TaskService()
