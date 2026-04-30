export interface TenantRole {
  id: string
  tenantId: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: string[]
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
  systemRole: string | null
  tenantRoleId: string | null
  tenantRoleName: string | null
  createdAt: string
}

export interface PermissionDef {
  value: string
  label: string
  module: string
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  { value: 'leads:read',        label: 'Visualizar',           module: 'Leads' },
  { value: 'leads:write',       label: 'Criar / Editar',        module: 'Leads' },
  { value: 'properties:read',   label: 'Visualizar',           module: 'Imóveis' },
  { value: 'properties:write',  label: 'Criar / Editar',        module: 'Imóveis' },
  { value: 'tasks:read',        label: 'Visualizar',           module: 'Tarefas' },
  { value: 'tasks:write',       label: 'Criar / Editar',        module: 'Tarefas' },
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
