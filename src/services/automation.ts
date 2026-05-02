import type {
  AutomationWorkflow,
  AutomationExecution,
  CreateAutomationWorkflowRequest,
  UpdateAutomationWorkflowRequest,
  TestWorkflowRequest,
} from '@/types/automation'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/automation-workflows`

class AutomationService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(`${BASE}${path}`, options)
  }

  async listWorkflows(): Promise<AutomationWorkflow[]> {
    return this.request<AutomationWorkflow[]>('')
  }

  async getWorkflow(id: string): Promise<AutomationWorkflow> {
    return this.request<AutomationWorkflow>(`/${id}`)
  }

  async createWorkflow(data: CreateAutomationWorkflowRequest): Promise<AutomationWorkflow> {
    return this.request<AutomationWorkflow>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updateWorkflow(id: string, data: UpdateAutomationWorkflowRequest): Promise<AutomationWorkflow> {
    return this.request<AutomationWorkflow>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleActive(id: string, isActive: boolean): Promise<AutomationWorkflow> {
    return this.request<AutomationWorkflow>(`/${id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
  }

  async testWorkflow(id: string, data: TestWorkflowRequest): Promise<AutomationExecution> {
    return this.request<AutomationExecution>(`/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async getExecutionHistory(id: string): Promise<AutomationExecution[]> {
    return this.request<AutomationExecution[]>(`/${id}/executions`)
  }
}

export default new AutomationService()
