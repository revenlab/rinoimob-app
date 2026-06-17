import type { SystemRole } from './role'

export interface TenantSummary {
  id: string
  name: string
  subdomain: string
  active: boolean
  createdAt: string
  userCount: number
}

export interface TenantUserSummary {
  id: string
  tenantId: string
  tenantName?: string | null
  tenantSubdomain?: string | null
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  active: boolean
  systemRole: SystemRole | null
  tenantRoleId: string | null
  tenantRoleName: string | null
  verificationStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED' | null
  createdAt: string
}

export interface TenantAuditLog {
  id: number
  tenantId: string
  tenantName: string | null
  userId: string | null
  userName: string | null
  action: string
  resource: string
  resourceId: string | null
  targetLabel: string | null
  details: string | null
  createdAt: string
}

export interface TenantAuditLogFilters {
  tenantId?: string | null
  userId?: string | null
  action?: string | null
  resource?: string | null
  from?: string | null
  to?: string | null
}

export interface SupportDashboard {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalUsers: number
  recentActivity: TenantAuditLog[]
}

export interface TenantHealthFailure {
  executionId: string
  workflowId: string
  workflowName: string
  triggerEvent: string | null
  errorMessage: string | null
  createdAt: string
}

export interface TenantHealth {
  tenantId: string
  tenantName: string
  subdomain: string
  active: boolean
  status: 'OK' | 'WARNING' | 'CRITICAL'
  issues: string[]
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  pendingInvites: number
  emailSenderStatus: 'OK' | 'NO_DEFAULT' | 'MISSING'
  emailSenderConfigCount: number
  defaultEmailSenderName: string | null
  defaultEmailSenderEmail: string | null
  failedExecutionsLast7Days: number
  pendingInviteUsers: TenantUserSummary[]
  inactiveUsersSample: TenantUserSummary[]
  recentFailures: TenantHealthFailure[]
}

export interface TenantWebsiteConfig {
  companyName?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  description?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  instagramUrl?: string | null
  whatsappNumber?: string | null
  facebookUrl?: string | null
  heroImageUrl?: string | null
  featuredSectionTitle?: string | null
  featuredSectionSubtitle?: string | null
  launchesSectionTitle?: string | null
  launchesSectionSubtitle?: string | null
  categoriesSectionTitle?: string | null
  categoriesSectionSubtitle?: string | null
  servicesSectionTitle?: string | null
  servicesSectionSubtitle?: string | null
  servicesFormTitle?: string | null
  servicesFormSubtitle?: string | null
  statsSectionTitle?: string | null
  statsSectionSubtitle?: string | null
  blogSectionTitle?: string | null
  blogSectionSubtitle?: string | null
  ctaSectionTitle?: string | null
  ctaSectionSubtitle?: string | null
  customDomain?: string | null
  customDomainStatus?: string | null
  customDomainProviderId?: string | null
  customDomainTarget?: string | null
  aboutPageTitle?: string | null
  aboutPageSubtitle?: string | null
  aboutPageDescription?: string | null
  aboutImageUrl?: string | null
  aboutMission?: string | null
  aboutVision?: string | null
  aboutValues?: string | null
  aboutFoundedYear?: string | null
  aboutTeamCount?: string | null
  aboutPropertiesCount?: string | null
}

export interface BillingPlanOption {
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

export interface TenantBilling {
  tenantId: string
  planCode: BillingPlanOption['code']
  planName: string
  subscriptionStatus: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL'
  provider: 'ABACATEPAY' | 'MANUAL'
  providerCustomerId: string | null
  providerSubscriptionId: string | null
  providerCheckoutId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
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
  notes: string | null
  updatedByUserId: string | null
  updatedAt: string | null
  availablePlans: BillingPlanOption[]
}

export interface UpdateTenantBillingPayload {
  planCode: BillingPlanOption['code']
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
  notes?: string | null
}

export const SUPPORT_PERMISSIONS = [
  { value: 'support:tenants:read', label: 'Ver tenants' },
  { value: 'support:tenants:write', label: 'Editar tenants' },
  { value: 'support:tenant_users:read', label: 'Ver usuários de tenants' },
  { value: 'support:tenant_users:write', label: 'Editar usuários de tenants' },
  { value: 'support:operators:read', label: 'Ver operadores' },
  { value: 'support:operators:write', label: 'Editar operadores' },
  { value: 'support:audit:read', label: 'Ver auditoria' },
  { value: 'support:health:read', label: 'Ver saúde dos tenants' },
] as const

export type SupportPermissionValue = typeof SUPPORT_PERMISSIONS[number]['value']
