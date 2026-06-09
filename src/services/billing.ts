import { API_BASE, apiFetch } from '@/lib/api'
import type {
  StartBillingCheckoutRequest,
  StartBillingCheckoutResponse,
  TenantBillingPortal,
} from '@/types/billing'

const BASE = `${API_BASE}/billing`

class BillingService {
  async getMyBilling(): Promise<TenantBillingPortal> {
    return apiFetch<TenantBillingPortal>(`${BASE}/me`)
  }

  async startCheckout(payload: StartBillingCheckoutRequest): Promise<StartBillingCheckoutResponse> {
    return apiFetch<StartBillingCheckoutResponse>(`${BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

export default new BillingService()
