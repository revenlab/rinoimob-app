<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useTeamStore } from '@/stores/team'
import type { TenantRole, CreateTenantRoleRequest, UpdateTenantRoleRequest, InviteUserRequest } from '@/types/role'
import { ALL_PERMISSIONS } from '@/types/role'

const store = useTeamStore()

const activeTab = ref<'users' | 'roles'>('users')

// ── Invite user modal ──────────────────────────────────────────────────────
const showInviteModal = ref(false)
const inviteForm = ref<InviteUserRequest>({ email: '', firstName: '', lastName: '', roleId: '' })
const inviteError = ref<string | null>(null)
const inviteLoading = ref(false)

function openInviteModal() {
  inviteForm.value = { email: '', firstName: '', lastName: '', roleId: store.roles[0]?.id ?? '' }
  inviteError.value = null
  showInviteModal.value = true
}

async function submitInvite() {
  if (!inviteForm.value.email || !inviteForm.value.firstName || !inviteForm.value.roleId) {
    inviteError.value = 'Preencha todos os campos obrigatórios'
    return
  }
  inviteLoading.value = true
  inviteError.value = null
  try {
    await store.inviteUser(inviteForm.value)
    showInviteModal.value = false
  } catch (e: unknown) {
    inviteError.value = e instanceof Error ? e.message : 'Erro ao convidar usuário'
  } finally {
    inviteLoading.value = false
  }
}

async function handleAssignRole(userId: string, roleId: string) {
  try {
    await store.assignRole(userId, roleId)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Erro ao alterar função')
  }
}

async function handleDeactivate(userId: string) {
  if (!confirm('Desativar este usuário? Ele perderá acesso imediatamente.')) return
  try {
    await store.deactivateUser(userId)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Erro ao desativar usuário')
  }
}

// ── Role modal ─────────────────────────────────────────────────────────────
const showRoleModal = ref(false)
const editingRole = ref<TenantRole | null>(null)
const roleForm = ref({ name: '', description: '', permissions: [] as string[] })
const roleError = ref<string | null>(null)
const roleLoading = ref(false)

function openCreateRoleModal() {
  editingRole.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  roleError.value = null
  showRoleModal.value = true
}

function openEditRoleModal(role: TenantRole) {
  editingRole.value = role
  roleForm.value = { name: role.name, description: role.description ?? '', permissions: [...role.permissions] }
  roleError.value = null
  showRoleModal.value = true
}

function togglePermission(value: string) {
  const idx = roleForm.value.permissions.indexOf(value)
  if (idx === -1) roleForm.value.permissions.push(value)
  else roleForm.value.permissions.splice(idx, 1)
}

function isPermissionChecked(value: string) {
  return roleForm.value.permissions.includes(value)
}

async function submitRole() {
  if (!roleForm.value.name.trim()) {
    roleError.value = 'Nome é obrigatório'
    return
  }
  roleLoading.value = true
  roleError.value = null
  try {
    const payload: CreateTenantRoleRequest | UpdateTenantRoleRequest = {
      name: roleForm.value.name.trim(),
      description: roleForm.value.description.trim() || undefined,
      permissions: roleForm.value.permissions,
    }
    if (editingRole.value) {
      await store.updateRole(editingRole.value.id, payload as UpdateTenantRoleRequest)
    } else {
      await store.createRole(payload as CreateTenantRoleRequest)
    }
    showRoleModal.value = false
  } catch (e: unknown) {
    roleError.value = e instanceof Error ? e.message : 'Erro ao salvar função'
  } finally {
    roleLoading.value = false
  }
}

async function handleDeleteRole(role: TenantRole) {
  if (!confirm(`Excluir a função "${role.name}"? Esta ação não pode ser desfeita.`)) return
  try {
    await store.deleteRole(role.id)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Erro ao excluir função')
  }
}

// ── Permission matrix ──────────────────────────────────────────────────────
const permissionModules = computed(() => {
  const map: Record<string, typeof ALL_PERMISSIONS> = {}
  for (const p of ALL_PERMISSIONS) {
    if (!map[p.module]) map[p.module] = []
    map[p.module].push(p)
  }
  return map
})

// ── Helpers ────────────────────────────────────────────────────────────────
function getUserInitials(u: { firstName: string; lastName: string }) {
  return `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function getRoleName(user: { systemRole: string | null; tenantRoleName: string | null }) {
  if (user.systemRole) return systemRoleLabel(user.systemRole)
  return user.tenantRoleName ?? '—'
}

function systemRoleLabel(role: string) {
  const map: Record<string, string> = {
    TENANT_OWNER: 'Proprietário',
    TENANT_ADMIN: 'Administrador do sistema',
  }
  return map[role] ?? role
}

// ── CSS helpers ────────────────────────────────────────────────────────────
const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white dark:focus:bg-slate-600 transition'
const labelClass = 'block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1'

onMounted(() => {
  Promise.all([store.loadUsers(), store.loadRoles()])
})
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Equipe</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500">Gerencie membros e funções do seu workspace</p>
        </div>
        <button
          v-if="activeTab === 'users'"
          @click="openInviteModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Convidar
        </button>
        <button
          v-else
          @click="openCreateRoleModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Função
        </button>
      </div>
    </template>

    <!-- Tabs -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-1">
        <button
          v-for="tab in [{ key: 'users', label: 'Usuários' }, { key: 'roles', label: 'Funções' }]"
          :key="tab.key"
          @click="activeTab = tab.key as 'users' | 'roles'"
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.key
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-16">
      <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <template v-else>

      <!-- ─── Users Tab ────────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'users'">
        <div v-if="store.users.length === 0" class="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          Nenhum usuário encontrado.
        </div>
        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Usuário</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Função</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Membro desde</th>
                <th class="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="user in store.users" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <!-- Avatar + name/email -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ getUserInitials(user) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-5 py-3.5">
                  <div v-if="user.systemRole" class="flex items-center gap-1.5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {{ systemRoleLabel(user.systemRole) }}
                    </span>
                  </div>
                  <select
                    v-else
                    :value="user.tenantRoleId ?? ''"
                    @change="handleAssignRole(user.id, ($event.target as HTMLSelectElement).value)"
                    :disabled="!user.active"
                    class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                  >
                    <option value="" disabled>Sem função</option>
                    <option v-for="role in store.roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                </td>

                <!-- Status -->
                <td class="px-5 py-3.5">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="user.active
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="user.active ? 'bg-emerald-500' : 'bg-slate-400'" />
                    {{ user.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-5 py-3.5 text-xs text-slate-400 dark:text-slate-500">
                  {{ formatDate(user.createdAt) }}
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5">
                  <button
                    v-if="user.active && !user.systemRole"
                    @click="handleDeactivate(user.id)"
                    class="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    title="Desativar usuário"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── Roles Tab ─────────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'roles'">
        <div v-if="store.roles.length === 0" class="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          Nenhuma função encontrada.
        </div>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="role in store.roles"
            :key="role.id"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ role.name }}</h3>
                  <span
                    v-if="role.isSystem"
                    class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  >Padrão</span>
                </div>
                <p v-if="role.description" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ role.description }}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button
                  @click="openEditRoleModal(role)"
                  class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
                  :title="role.isSystem ? 'Ver detalhes' : 'Editar'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  v-if="!role.isSystem"
                  @click="handleDeleteRole(role)"
                  class="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Permissions summary -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-if="role.permissions.length === 0"
                class="text-xs text-slate-400 dark:text-slate-500"
              >Sem permissões</span>
              <span
                v-for="perm in role.permissions.slice(0, 6)"
                :key="perm"
                class="inline-block px-2 py-0.5 text-[10px] rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
              >{{ perm }}</span>
              <span
                v-if="role.permissions.length > 6"
                class="inline-block px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              >+{{ role.permissions.length - 6 }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Invite User Modal ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-5">Convidar Usuário</h2>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelClass">Nome <span class="text-red-400">*</span></label>
                <input v-model="inviteForm.firstName" type="text" placeholder="João" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass">Sobrenome</label>
                <input v-model="inviteForm.lastName" type="text" placeholder="Silva" :class="inputClass" />
              </div>
            </div>
            <div>
              <label :class="labelClass">E-mail <span class="text-red-400">*</span></label>
              <input v-model="inviteForm.email" type="email" placeholder="joao@empresa.com" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Função <span class="text-red-400">*</span></label>
              <select v-model="inviteForm.roleId" :class="inputClass">
                <option value="" disabled>Selecione...</option>
                <option v-for="role in store.roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
          </div>

          <p v-if="inviteError" class="mt-3 text-xs text-red-500">{{ inviteError }}</p>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="showInviteModal = false" class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Cancelar</button>
            <button @click="submitInvite" :disabled="inviteLoading" class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-60 flex items-center gap-2">
              <span v-if="inviteLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Convidar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Role Modal ────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
            <h2 class="text-base font-bold text-slate-800 dark:text-slate-200">
              {{ editingRole ? (editingRole.isSystem ? 'Ver Função' : 'Editar Função') : 'Nova Função' }}
            </h2>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <!-- Name + description -->
            <div>
              <label :class="labelClass">Nome <span class="text-red-400">*</span></label>
              <input
                v-model="roleForm.name"
                type="text"
                placeholder="Ex: Corretor Sênior"
                :class="inputClass"
                :disabled="editingRole?.isSystem"
              />
            </div>
            <div>
              <label :class="labelClass">Descrição</label>
              <input
                v-model="roleForm.description"
                type="text"
                placeholder="Descreva brevemente esta função..."
                :class="inputClass"
                :disabled="editingRole?.isSystem"
              />
            </div>

            <!-- Permission matrix -->
            <div>
              <label :class="labelClass">Permissões</label>
              <div class="space-y-4 mt-2">
                <div v-for="(perms, module) in permissionModules" :key="module">
                  <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{{ module }}</p>
                  <div class="grid grid-cols-2 gap-2">
                    <label
                      v-for="perm in perms"
                      :key="perm.value"
                      class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                      :class="[
                        isPermissionChecked(perm.value)
                          ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50',
                        editingRole?.isSystem ? 'cursor-default' : 'hover:border-indigo-200 dark:hover:border-indigo-700'
                      ]"
                    >
                      <input
                        type="checkbox"
                        :checked="isPermissionChecked(perm.value)"
                        @change="togglePermission(perm.value)"
                        :disabled="editingRole?.isSystem"
                        class="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <div>
                        <p class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ perm.label }}</p>
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ perm.value }}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
            <p v-if="roleError" class="text-xs text-red-500 mb-3">{{ roleError }}</p>
            <div class="flex justify-end gap-3">
              <button @click="showRoleModal = false" class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                {{ editingRole?.isSystem ? 'Fechar' : 'Cancelar' }}
              </button>
              <button
                v-if="!editingRole?.isSystem"
                @click="submitRole"
                :disabled="roleLoading"
                class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-60 flex items-center gap-2"
              >
                <span v-if="roleLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {{ editingRole ? 'Salvar' : 'Criar Função' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
