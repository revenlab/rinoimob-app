import { apiFetch, API_BASE } from '@/lib/api'
import type {
  TenantAuditLog,
  TenantAuditLogFilters,
  TenantHealth,
  TenantSummary,
  TenantUserSummary,
} from '@/types/tenantsAdmin'

const BASE = `${API_BASE}/support`

class TenantsAdminService {
  async listTenants(): Promise<TenantSummary[]> {
    return apiFetch<TenantSummary[]>(`${BASE}/tenants`)
  }

  async listTenantUsers(tenantId: string): Promise<TenantUserSummary[]> {
    return apiFetch<TenantUserSummary[]>(`${BASE}/tenants/${tenantId}/users`)
  }

  async listOperators(): Promise<TenantUserSummary[]> {
    return apiFetch<TenantUserSummary[]>(`${BASE}/operators`)
  }

  async listAuditLogs(filters: TenantAuditLogFilters = {}): Promise<TenantAuditLog[]> {
    const params = new URLSearchParams()

    if (filters.tenantId) {
      params.set('tenantId', filters.tenantId)
    }
    if (filters.userId) {
      params.set('userId', filters.userId)
    }
    if (filters.action) {
      params.set('action', filters.action)
    }
    if (filters.resource) {
      params.set('resource', filters.resource)
    }
    if (filters.from) {
      params.set('from', filters.from)
    }
    if (filters.to) {
      params.set('to', filters.to)
    }

    const query = params.toString()
    return apiFetch<TenantAuditLog[]>(`${BASE}/audit${query ? `?${query}` : ''}`)
  }

  async getTenantHealth(tenantId: string): Promise<TenantHealth> {
    return apiFetch<TenantHealth>(`${BASE}/tenants/${tenantId}/health`)
  }

  async resendInvitation(tenantId: string, userId: string): Promise<TenantUserSummary> {
    return apiFetch<TenantUserSummary>(`${BASE}/tenants/${tenantId}/users/${userId}/resend-invitation`, {
      method: 'POST',
    })
  }

  async resetAccess(tenantId: string, userId: string): Promise<TenantUserSummary> {
    return apiFetch<TenantUserSummary>(`${BASE}/tenants/${tenantId}/users/${userId}/reset-access`, {
      method: 'POST',
    })
  }
}

export default new TenantsAdminService()
