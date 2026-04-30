import { apiFetch, API_BASE } from '@/lib/api'
import type { UserManagementResponse, InviteUserRequest, UpdateUserRoleRequest } from '@/types/role'

const BASE = `${API_BASE}/team/users`

class UserManagementService {
  async list(): Promise<UserManagementResponse[]> {
    return apiFetch<UserManagementResponse[]>(BASE)
  }

  async invite(data: InviteUserRequest): Promise<UserManagementResponse> {
    return apiFetch<UserManagementResponse>(`${BASE}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async assignRole(userId: string, data: UpdateUserRoleRequest): Promise<UserManagementResponse> {
    return apiFetch<UserManagementResponse>(`${BASE}/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deactivate(userId: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${userId}`, { method: 'DELETE' })
  }
}

export default new UserManagementService()
