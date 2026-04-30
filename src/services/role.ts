import { apiFetch, API_BASE } from '@/lib/api'
import type { TenantRole, CreateTenantRoleRequest, UpdateTenantRoleRequest } from '@/types/role'

const BASE = `${API_BASE}/roles`

class RoleService {
  async list(): Promise<TenantRole[]> {
    return apiFetch<TenantRole[]>(BASE)
  }

  async get(id: string): Promise<TenantRole> {
    return apiFetch<TenantRole>(`${BASE}/${id}`)
  }

  async create(data: CreateTenantRoleRequest): Promise<TenantRole> {
    return apiFetch<TenantRole>(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateTenantRoleRequest): Promise<TenantRole> {
    return apiFetch<TenantRole>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async remove(id: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' })
  }
}

export default new RoleService()
