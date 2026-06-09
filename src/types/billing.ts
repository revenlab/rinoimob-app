export interface TenantBillingPlanOption {
  code: 'FREE' | 'STARTER' | 'PRIME' | 'ULTIMATE'
  planName: string
  monthlyPrice: number
  annualPrice: number | null
  maxUsers: number | null
  maxProperties: number | null
  maxLeadsPerMonth: number | null
  maxWhatsappNumbers: number | null
  blogEnabled: boolean
  customDomainEnabled: boolean
  automationCrmEnabled: boolean
  publicApiEnabled: boolean
  vipSupportEnabled: boolean
  customImplementationEnabled: boolean
}

export interface TenantBillingPortal {
  tenantId: string
  currentPlanCode: TenantBillingPlanOption['code']
  currentPlanName: string
  subscriptionStatus: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL'
  provider: 'ABACATEPAY' | 'MANUAL'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  maxUsers: number
  maxProperties: number
  maxLeadsPerMonth: number
  maxWhatsappNumbers: number
  blogEnabled: boolean
  customDomainEnabled: boolean
  automationCrmEnabled: boolean
  publicApiEnabled: boolean
  vipSupportEnabled: boolean
  customImplementationEnabled: boolean
  availablePlans: TenantBillingPlanOption[]
}

export interface StartBillingCheckoutRequest {
  planCode: TenantBillingPlanOption['code']
  successUrl?: string
  cancelUrl?: string
}

export interface StartBillingCheckoutResponse {
  checkoutId: string | null
  checkoutUrl: string | null
  expiresAt: string | null
}
