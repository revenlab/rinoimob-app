import { apiFetch, API_BASE } from '@/lib/api'
import type { TenantWebsiteConfig } from '@/types/tenantsAdmin'

const BASE = `${API_BASE}/website-config`
const SUPPORT_BASE = `${API_BASE}/support`

class WebsiteConfigService {
  async getConfig(): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(BASE)
  }

  async updateConfig(data: Partial<TenantWebsiteConfig>): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(BASE, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  async uploadLogo(file: File): Promise<TenantWebsiteConfig> {
    const formData = new FormData()
    formData.append('file', file)

    return apiFetch<TenantWebsiteConfig>(`${BASE}/logo`, {
      method: 'POST',
      body: formData,
    })
  }

  async deleteLogo(): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(`${BASE}/logo`, {
      method: 'DELETE',
    })
  }

  async uploadFavicon(file: File): Promise<TenantWebsiteConfig> {
    const formData = new FormData()
    formData.append('file', file)

    return apiFetch<TenantWebsiteConfig>(`${BASE}/favicon`, {
      method: 'POST',
      body: formData,
    })
  }

  async deleteFavicon(): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(`${BASE}/favicon`, {
      method: 'DELETE',
    })
  }

  async getSupportConfig(tenantId: string): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(`${SUPPORT_BASE}/tenants/${tenantId}/website-config`)
  }

  async updateSupportConfig(tenantId: string, data: Partial<TenantWebsiteConfig>): Promise<TenantWebsiteConfig> {
    return apiFetch<TenantWebsiteConfig>(`${SUPPORT_BASE}/tenants/${tenantId}/website-config`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default new WebsiteConfigService()
