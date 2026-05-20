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
