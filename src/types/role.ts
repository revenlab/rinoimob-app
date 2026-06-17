export interface TenantRole {
  id: string
  tenantId: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: string[]
}

export type SystemRole =
  | 'TENANT_OWNER'
  | 'TENANT_ADMIN'
  | 'SUPPORT_MANAGER'
  | 'SUPPORT_AGENT'

export const INTERNAL_SYSTEM_ROLES = ['TENANT_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT'] as const

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  TENANT_OWNER: 'Proprietário',
  TENANT_ADMIN: 'Administrador de tenants',
  SUPPORT_MANAGER: 'Gerente interno',
  SUPPORT_AGENT: 'Operador interno',
}

export interface SystemRoleOption {
  value: Exclude<SystemRole, 'TENANT_OWNER'>
  label: string
}

export const INTERNAL_SYSTEM_ROLE_OPTIONS: SystemRoleOption[] = INTERNAL_SYSTEM_ROLES.map(value => ({
  value,
  label: SYSTEM_ROLE_LABELS[value],
}))

export function isInternalSystemRole(role: SystemRole | null | undefined): role is Exclude<SystemRole, 'TENANT_OWNER'> {
  return !!role && INTERNAL_SYSTEM_ROLES.includes(role as Exclude<SystemRole, 'TENANT_OWNER'>)
}

export function systemRoleLabel(role: SystemRole | null | undefined) {
  return role ? (SYSTEM_ROLE_LABELS[role] ?? role) : '—'
}

export interface CreateTenantRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateTenantRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface InviteUserRequest {
  email: string
  firstName: string
  lastName: string
  roleId: string
}

export interface UpdateUserRoleRequest {
  roleId: string
}

export interface UserManagementResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  active: boolean
  systemRole: SystemRole | null
  tenantRoleId: string | null
  tenantRoleName: string | null
  createdAt: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED' | null
}

export interface PermissionDef {
  value: string
  label: string
  module: string
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  { value: 'leads:read',        label: 'Visualizar todos',         module: 'Leads' },
  { value: 'leads:write',       label: 'Criar / Editar todos',     module: 'Leads' },
  { value: 'leads:read_all',    label: 'Visualizar todos (explícito)', module: 'Leads' },
  { value: 'leads:write_all',   label: 'Editar todos (explícito)', module: 'Leads' },
  { value: 'leads:read_own',    label: 'Visualizar apenas os próprios', module: 'Leads' },
  { value: 'leads:write_own',   label: 'Editar apenas os próprios', module: 'Leads' },
  { value: 'properties:read',   label: 'Visualizar',           module: 'Imóveis' },
  { value: 'properties:write',  label: 'Criar / Editar',        module: 'Imóveis' },
  { value: 'tasks:read',        label: 'Visualizar',           module: 'Tarefas' },
  { value: 'tasks:write',       label: 'Criar / Editar',        module: 'Tarefas' },
  { value: 'tasks:read_all',    label: 'Visualizar todas',      module: 'Tarefas' },
  { value: 'tasks:write_all',   label: 'Editar todas',          module: 'Tarefas' },
  { value: 'tasks:read_own',    label: 'Visualizar apenas próprias', module: 'Tarefas' },
  { value: 'tasks:write_own',   label: 'Editar apenas próprias', module: 'Tarefas' },
  { value: 'task_types:read',   label: 'Visualizar',           module: 'Tipos de Tarefa' },
  { value: 'task_types:write',  label: 'Criar / Editar',        module: 'Tipos de Tarefa' },
  { value: 'categories:read',   label: 'Visualizar',           module: 'Categorias' },
  { value: 'categories:write',  label: 'Criar / Editar',        module: 'Categorias' },
  { value: 'whatsapp:read',     label: 'Visualizar',           module: 'WhatsApp' },
  { value: 'whatsapp:write',    label: 'Gerenciar instâncias', module: 'WhatsApp' },
  { value: 'users:read',        label: 'Ver equipe',           module: 'Equipe' },
  { value: 'users:write',       label: 'Convidar / Gerenciar', module: 'Equipe' },
  { value: 'roles:read',        label: 'Ver funções',          module: 'Equipe' },
  { value: 'roles:write',       label: 'Criar / Editar funções', module: 'Equipe' },
  { value: 'settings:manage',   label: 'Configurações gerais', module: 'Sistema' },
  { value: 'reports:read',      label: 'Ver relatórios',       module: 'Sistema' },
]
