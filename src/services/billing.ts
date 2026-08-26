import { API_BASE, apiFetch } from '@/lib/api'
import type {
  StartBillingCheckoutRequest,
  StartBillingCheckoutResponse,
  TenantBillingPortal,
  BillingCustomerDetails,
  BillingInvoice,
  BillingPage,
  BillingStatus,
  BillingPaymentStatus,
  UpdateBillingCardTokenRequest,
  UpdateBillingCustomerDetailsRequest,
} from '@/types/billing'

const BASE = `${API_BASE}/billing`

class BillingService {
  async getMyBilling(): Promise<TenantBillingPortal> {
    return apiFetch<TenantBillingPortal>(`${BASE}/me`)
  }

  async getStatus(): Promise<BillingStatus> {
    return apiFetch<BillingStatus>(`${BASE}/status`)
  }

  async listInvoices(
    page = 0,
    size = 20,
    statuses: BillingPaymentStatus[] = [],
  ): Promise<BillingPage<BillingInvoice>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    statuses.forEach(status => params.append('status', status))
    return apiFetch<BillingPage<BillingInvoice>>(`${BASE}/invoices?${params.toString()}`)
  }

  async startCheckout(payload: StartBillingCheckoutRequest): Promise<StartBillingCheckoutResponse> {
    return apiFetch<StartBillingCheckoutResponse>(`${BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  async updateCustomer(payload: UpdateBillingCustomerDetailsRequest): Promise<BillingCustomerDetails> {
    return apiFetch<BillingCustomerDetails>(`${BASE}/customer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  async cancelSubscription(): Promise<TenantBillingPortal> {
    return apiFetch<TenantBillingPortal>(`${BASE}/cancel`, { method: 'POST' })
  }

  async reactivateSubscription(): Promise<TenantBillingPortal> {
    return apiFetch<TenantBillingPortal>(`${BASE}/reactivate`, { method: 'POST' })
  }

  async updateCardToken(payload: UpdateBillingCardTokenRequest): Promise<void> {
    await apiFetch<void>(`${BASE}/payment-method/card-token`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

export default new BillingService()
