import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TenantRole, UserManagementResponse, CreateTenantRoleRequest, UpdateTenantRoleRequest, InviteUserRequest } from '@/types/role'
import roleService from '@/services/role'
import userManagementService from '@/services/userManagement'

export const useTeamStore = defineStore('team', () => {
  const roles = ref<TenantRole[]>([])
  const users = ref<UserManagementResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadRoles() {
    try {
      isLoading.value = true
      error.value = null
      roles.value = await roleService.list()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar funções'
    } finally {
      isLoading.value = false
    }
  }

  async function createRole(data: CreateTenantRoleRequest): Promise<TenantRole> {
    const role = await roleService.create(data)
    roles.value.push(role)
    return role
  }

  async function updateRole(id: string, data: UpdateTenantRoleRequest): Promise<TenantRole> {
    const updated = await roleService.update(id, data)
    const idx = roles.value.findIndex(r => r.id === id)
    if (idx !== -1) roles.value[idx] = updated
    return updated
  }

  async function deleteRole(id: string): Promise<void> {
    await roleService.remove(id)
    roles.value = roles.value.filter(r => r.id !== id)
  }

  async function loadUsers() {
    try {
      isLoading.value = true
      error.value = null
      users.value = await userManagementService.list()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar usuários'
    } finally {
      isLoading.value = false
    }
  }

  async function inviteUser(data: InviteUserRequest): Promise<UserManagementResponse> {
    const user = await userManagementService.invite(data)
    users.value.push(user)
    return user
  }

  async function assignRole(userId: string, roleId: string): Promise<UserManagementResponse> {
    const updated = await userManagementService.assignRole(userId, { roleId })
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx] = updated
    return updated
  }

  async function deactivateUser(userId: string): Promise<void> {
    await userManagementService.deactivate(userId)
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], active: false }
  }

  return {
    roles,
    users,
    isLoading,
    error,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    loadUsers,
    inviteUser,
    assignRole,
    deactivateUser,
  }
})
