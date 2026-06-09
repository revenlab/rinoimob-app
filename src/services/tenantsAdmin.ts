import { apiFetch, API_BASE } from '@/lib/api'
import type {
  TenantBilling,
  SupportDashboard,
  TenantAuditLog,
  TenantAuditLogFilters,
  TenantHealth,
  TenantSummary,
  TenantUserSummary,
  UpdateTenantBillingPayload,
} from '@/types/tenantsAdmin'

const BASE = `${API_BASE}/support`

class TenantsAdminService {
  async getDashboard(): Promise<SupportDashboard> {
    return apiFetch<SupportDashboard>(`${BASE}/dashboard`)
  }

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

  async getTenantBilling(tenantId: string): Promise<TenantBilling> {
    return apiFetch<TenantBilling>(`${BASE}/tenants/${tenantId}/billing`)
  }

  async updateTenantBilling(tenantId: string, payload: UpdateTenantBillingPayload): Promise<TenantBilling> {
    return apiFetch<TenantBilling>(`${BASE}/tenants/${tenantId}/billing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
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

  async updateTenant(tenantId: string, data: { name: string; subdomain: string }): Promise<TenantSummary> {
    return apiFetch<TenantSummary>(`${BASE}/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async setTenantStatus(tenantId: string, active: boolean): Promise<TenantSummary> {
    const params = new URLSearchParams({ active: String(active) })
    return apiFetch<TenantSummary>(`${BASE}/tenants/${tenantId}/status?${params.toString()}`, {
      method: 'PATCH',
    })
  }

  async updateTenantUser(
    tenantId: string,
    userId: string,
    data: { firstName: string; lastName: string; email: string; phone?: string }
  ): Promise<TenantUserSummary> {
    return apiFetch<TenantUserSummary>(`${BASE}/tenants/${tenantId}/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async setUserStatus(tenantId: string, userId: string, active: boolean): Promise<TenantUserSummary> {
    const params = new URLSearchParams({ active: String(active) })
    return apiFetch<TenantUserSummary>(`${BASE}/tenants/${tenantId}/users/${userId}/status?${params.toString()}`, {
      method: 'PATCH',
    })
  }

  async setOperatorRole(userId: string, systemRole: string): Promise<TenantUserSummary> {
    const params = new URLSearchParams({ systemRole })
    return apiFetch<TenantUserSummary>(`${BASE}/operators/${userId}/role?${params.toString()}`, {
      method: 'PATCH',
    })
  }

  async getOperatorPermissions(userId: string): Promise<string[]> {
    return apiFetch<string[]>(`${BASE}/operators/${userId}/permissions`)
  }

  async setOperatorPermissions(userId: string, permissions: string[]): Promise<string[]> {
    return apiFetch<string[]>(`${BASE}/operators/${userId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    })
  }
}

export default new TenantsAdminService()
