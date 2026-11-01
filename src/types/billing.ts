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
  integrationsEnabled: boolean
  vipSupportEnabled: boolean
  customImplementationEnabled: boolean
}

export interface BillingCustomerDetails {
  cpfCnpj: string | null
  phone: string | null
  address: string | null
  addressNumber: string | null
  addressComplement: string | null
  postalCode: string | null
  province: string | null
  complete: boolean
}

export interface UpdateBillingCustomerDetailsRequest {
  cpfCnpj: string
  phone: string
  address: string
  addressNumber: string
  addressComplement?: string
  postalCode: string
  province: string
}

export type BillingSubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'CANCELED'
  | 'TRIAL'

export type BillingPaymentStatus =
  | 'PENDING'
  | 'RISK_ANALYSIS'
  | 'AUTHORIZED'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CHARGEBACK'
  | 'CANCELED'
  | 'DELETED'
  | 'UNKNOWN'

export type BillingSubscriptionChangeStatus =
  | 'PENDING'
  | 'PAID'
  | 'SCHEDULED'
  | 'APPLIED'
  | 'CANCELED'
  | 'EXPIRED'
  | 'FAILED'

export interface BillingInvoice {
  paymentId: string
  status: BillingPaymentStatus
  billingType: string | null
  value: number
  netValue: number | null
  dueDate: string | null
  confirmedAt: string | null
  receivedAt: string | null
  invoiceUrl: string | null
  receiptUrl: string | null
  description: string | null
}

export interface PendingBillingChange {
  targetPlanCode: TenantBillingPlanOption['code']
  targetPlanName: string
  status: BillingSubscriptionChangeStatus
  checkoutUrl: string | null
  effectiveAt: string | null
  expiresAt: string | null
}

export interface BillingStatus {
  currentPlanCode: TenantBillingPlanOption['code']
  subscriptionStatus: BillingSubscriptionStatus
  paymentDueDate: string | null
  accessRestrictedAt: string | null
  cancelAtPeriodEnd: boolean
  blogEnabled: boolean
  customDomainEnabled: boolean
  automationCrmEnabled: boolean
  publicApiEnabled: boolean
  integrationsEnabled: boolean
  vipSupportEnabled: boolean
  customImplementationEnabled: boolean
}

export interface BillingPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface TenantBillingPortal {
  tenantId: string
  currentPlanCode: TenantBillingPlanOption['code']
  currentPlanName: string
  subscriptionStatus: BillingSubscriptionStatus
  provider: 'ASAAS' | 'MANUAL'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  paymentDueDate: string | null
  overdueInvoiceUrl: string | null
  maxUsers: number
  maxProperties: number
  maxLeadsPerMonth: number
  maxWhatsappNumbers: number
  blogEnabled: boolean
  customDomainEnabled: boolean
  automationCrmEnabled: boolean
  publicApiEnabled: boolean
  integrationsEnabled: boolean
  vipSupportEnabled: boolean
  customImplementationEnabled: boolean
  billingCustomer: BillingCustomerDetails
  availablePlans: TenantBillingPlanOption[]
  cancelAtPeriodEnd: boolean
  accessRestrictedAt: string | null
  pendingChange: PendingBillingChange | null
  nextCharge: BillingInvoice | null
  cardUpdateAvailable: boolean
}

export interface StartBillingCheckoutRequest {
  planCode: TenantBillingPlanOption['code']
}

export interface StartBillingCheckoutResponse {
  checkoutId: string | null
  checkoutUrl: string | null
  expiresAt: string | null
  changeStatus: BillingSubscriptionChangeStatus
  effectiveAt: string | null
  requiresCheckout: boolean
}

export interface UpdateBillingCardTokenRequest {
  creditCardToken: string
}
