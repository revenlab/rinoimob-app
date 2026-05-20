<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import tenantsAdminService from '@/services/tenantsAdmin'
import { systemRoleLabel } from '@/types/role'
import type { TenantAuditLog, TenantHealth, TenantSummary, TenantUserSummary } from '@/types/tenantsAdmin'

const authStore = useAuthStore()
const { showSuccess, showError } = useNotification()
const activeTab = ref<'tenants' | 'operators' | 'audit'>('tenants')

const tenants = ref<TenantSummary[]>([])
const tenantUsers = ref<TenantUserSummary[]>([])
const operators = ref<TenantUserSummary[]>([])
const auditLogs = ref<TenantAuditLog[]>([])
const tenantHealth = ref<TenantHealth | null>(null)

const selectedTenantId = ref<string>('')
const auditTenantFilter = ref<string>('')
const auditActorFilter = ref<string>('')
const auditActionFilter = ref<string>('')
const auditResourceFilter = ref<string>('')
const auditFromFilter = ref<string>('')
const auditToFilter = ref<string>('')

const loadingTenants = ref(false)
const loadingUsers = ref(false)
const loadingOperators = ref(false)
const loadingAudit = ref(false)
const loadingHealth = ref(false)
const resendingInvitationUserId = ref<string | null>(null)
const resettingAccessUserId = ref<string | null>(null)
const error = ref<string | null>(null)

const selectedTenant = computed(() => tenants.value.find(tenant => tenant.id === selectedTenantId.value) ?? null)

const AUDIT_ACTION_LABELS: Record<string, string> = {
  SUPPORT_VIEW_TENANTS: 'Visualizou tenants',
  SUPPORT_VIEW_TENANT_USERS: 'Visualizou usuários do tenant',
  SUPPORT_VIEW_OPERATORS: 'Visualizou operadores internos',
  SUPPORT_VIEW_AUDIT: 'Visualizou auditoria',
  TENANT_ACTIVATED: 'Tenant ativado',
  TENANT_DEACTIVATED: 'Tenant desativado',
  USER_ACTIVATED: 'Usuário ativado',
  USER_DEACTIVATED: 'Usuário desativado',
  SUPPORT_ROLE_CHANGED: 'Papel interno alterado',
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatAuditAction(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? action
}

function formatAuditActor(log: TenantAuditLog) {
  return log.userName ?? log.userId ?? '—'
}

function getTenantDisplayName(user: TenantUserSummary) {
  return user.tenantName ?? user.tenantSubdomain ?? user.tenantId
}

function formatHealthStatus(status: TenantHealth['status']) {
  if (status === 'CRITICAL') {
    return 'Crítico'
  }
  if (status === 'WARNING') {
    return 'Atenção'
  }
  return 'OK'
}

async function loadTenants() {
  loadingTenants.value = true
  error.value = null
  try {
    tenants.value = await tenantsAdminService.listTenants()
    if (!selectedTenantId.value && tenants.value.length > 0) {
      selectedTenantId.value = tenants.value[0].id
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar tenants'
  } finally {
    loadingTenants.value = false
  }
}

async function loadTenantUsers(tenantId: string) {
  if (!tenantId) {
    tenantUsers.value = []
    return
  }
  loadingUsers.value = true
  error.value = null
  try {
    tenantUsers.value = await tenantsAdminService.listTenantUsers(tenantId)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar usuários'
  } finally {
    loadingUsers.value = false
  }
}

async function loadTenantHealth(tenantId: string) {
  if (!tenantId) {
    tenantHealth.value = null
    return
  }
  loadingHealth.value = true
  error.value = null
  try {
    tenantHealth.value = await tenantsAdminService.getTenantHealth(tenantId)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar saúde do tenant'
  } finally {
    loadingHealth.value = false
  }
}

async function resendTenantInvitation(userId: string) {
  if (!selectedTenantId.value) return
  resendingInvitationUserId.value = userId
  error.value = null
  try {
    await tenantsAdminService.resendInvitation(selectedTenantId.value, userId)
    await loadTenantHealth(selectedTenantId.value)
    showSuccess('Convite reenviado com sucesso.')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao reenviar convite')
  } finally {
    resendingInvitationUserId.value = null
  }
}

async function resetTenantUserAccess(userId: string) {
  if (!selectedTenantId.value) return
  resettingAccessUserId.value = userId
  error.value = null
  try {
    await tenantsAdminService.resetAccess(selectedTenantId.value, userId)
    showSuccess('Acesso resetado. O usuário precisará definir uma nova senha no próximo login.')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao resetar acesso')
  } finally {
    resettingAccessUserId.value = null
  }
}

async function loadOperators() {
  loadingOperators.value = true
  error.value = null
  try {
    operators.value = await tenantsAdminService.listOperators()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar operadores'
  } finally {
    loadingOperators.value = false
  }
}

async function loadAuditLogs() {
  loadingAudit.value = true
  error.value = null
  try {
    auditLogs.value = await tenantsAdminService.listAuditLogs({
      tenantId: auditTenantFilter.value || null,
      userId: auditActorFilter.value || null,
      action: auditActionFilter.value || null,
      resource: auditResourceFilter.value || null,
      from: auditFromFilter.value || null,
      to: auditToFilter.value || null,
    })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar auditoria'
  } finally {
    loadingAudit.value = false
  }
}

function resetAuditFilters() {
  auditTenantFilter.value = ''
  auditActorFilter.value = ''
  auditActionFilter.value = ''
  auditResourceFilter.value = ''
  auditFromFilter.value = ''
  auditToFilter.value = ''
}

async function clearAuditFilters() {
  resetAuditFilters()
  await loadAuditLogs()
}

watch(selectedTenantId, async tenantId => {
  await Promise.all([loadTenantUsers(tenantId), loadTenantHealth(tenantId)])
})

watch(activeTab, async tab => {
  if (tab === 'operators' && operators.value.length === 0) {
    await loadOperators()
  }
  if (tab === 'audit' && auditLogs.value.length === 0) {
    await loadAuditLogs()
  }
})

onMounted(async () => {
  await loadTenants()
  await loadOperators()
  await loadAuditLogs()
})
</script>

<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Tenants</h1>
        <p class="text-xs text-slate-400">Consulta interna de tenants, usuários internos e auditoria</p>
      </div>
    </template>

    <div v-if="!authStore.isInternalStaff" class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
      Você não tem acesso a esta área.
    </div>

    <div v-else class="space-y-6">
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          v-for="tab in [
            { key: 'tenants', label: 'Tenants' },
            { key: 'operators', label: 'Operadores' },
            { key: 'audit', label: 'Auditoria' },
          ]"
          :key="tab.key"
          @click="activeTab = tab.key as 'tenants' | 'operators' | 'audit'"
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.key
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'tenants'" class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <!-- Coluna esquerda: lista de tenants -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 lg:self-start">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Tenants</h2>
              <p class="text-xs text-slate-400">{{ tenants.length }} cadastrado(s)</p>
            </div>
          </div>
          <div v-if="loadingTenants" class="text-sm text-slate-400">Carregando...</div>
          <div v-else-if="tenants.length === 0" class="text-sm text-slate-400">Nenhum tenant encontrado.</div>
          <div v-else class="space-y-1">
            <button
              v-for="tenant in tenants"
              :key="tenant.id"
              @click="selectedTenantId = tenant.id"
              class="w-full text-left rounded-xl px-3 py-2.5 transition-colors"
              :class="selectedTenantId === tenant.id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'"
            >
              <p class="text-sm font-semibold truncate">{{ tenant.name }}</p>
              <p class="text-xs text-slate-400 truncate">@{{ tenant.subdomain }}</p>
              <span
                class="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold"
                :class="tenant.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >{{ tenant.active ? 'Ativo' : 'Inativo' }}</span>
            </button>
          </div>
        </div>

        <!-- Coluna direita: saúde + usuários -->
        <div class="space-y-6 lg:col-start-2">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Saúde do tenant</h2>
                <p class="text-xs text-slate-400">Sinais rápidos para triagem do suporte</p>
              </div>
              <span
                v-if="tenantHealth"
                class="text-[10px] font-semibold px-2 py-1 rounded-full"
                :class="tenantHealth.status === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : tenantHealth.status === 'WARNING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'"
              >
                {{ formatHealthStatus(tenantHealth.status) }}
              </span>
            </div>

            <div v-if="loadingHealth" class="text-sm text-slate-400">Carregando...</div>
            <div v-else-if="!tenantHealth" class="text-sm text-slate-400">Nenhuma saúde carregada.</div>
            <div v-else class="space-y-4">
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Total de usuários</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantHealth.totalUsers }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Convites pendentes</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantHealth.pendingInvites }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Usuários inativos</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantHealth.inactiveUsers }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Falhas recentes</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantHealth.failedExecutionsLast7Days }}</p>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <p class="text-xs font-semibold uppercase text-slate-400">Problemas detectados</p>
                  <span class="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    {{ tenantHealth.emailSenderStatus === 'OK' ? 'E-mail OK' : 'E-mail com atenção' }}
                  </span>
                </div>
                <div v-if="tenantHealth.issues.length === 0" class="text-sm text-slate-400">Nenhum alerta detectado.</div>
                <div v-else class="flex flex-wrap gap-2">
                  <span
                    v-for="issue in tenantHealth.issues"
                    :key="issue"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    {{ issue }}
                  </span>
                </div>
              </div>

              <div class="grid gap-4 xl:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                  <p class="text-xs font-semibold uppercase text-slate-400 mb-3">Convites pendentes</p>
                  <div v-if="tenantHealth.pendingInviteUsers.length === 0" class="text-sm text-slate-400">
                    Nenhum convite pendente.
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      v-for="user in tenantHealth.pendingInviteUsers"
                      :key="user.id"
                      class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-slate-400">{{ user.email }}</p>
                        </div>
                        <button
                          @click="resendTenantInvitation(user.id)"
                          :disabled="resendingInvitationUserId === user.id"
                          class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 disabled:opacity-60"
                        >
                          {{ resendingInvitationUserId === user.id ? 'Enviando...' : 'Reenviar convite' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                  <p class="text-xs font-semibold uppercase text-slate-400 mb-3">Falhas recentes</p>
                  <div v-if="tenantHealth.recentFailures.length === 0" class="text-sm text-slate-400">
                    Nenhuma falha recente.
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      v-for="failure in tenantHealth.recentFailures"
                      :key="failure.executionId"
                      class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2"
                    >
                      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ failure.workflowName }}</p>
                      <p class="text-xs text-slate-400">{{ failure.triggerEvent ?? '—' }} · {{ formatDate(failure.createdAt) }}</p>
                      <p class="mt-1 text-xs text-red-500">{{ failure.errorMessage ?? '—' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <p class="text-xs font-semibold uppercase text-slate-400 mb-2">Configuração de e-mail</p>
                <div class="flex flex-wrap items-center gap-2 text-sm">
                  <span class="rounded-full px-2 py-1 text-xs font-semibold"
                        :class="tenantHealth.emailSenderStatus === 'OK'
                          ? 'bg-emerald-100 text-emerald-700'
                          : tenantHealth.emailSenderStatus === 'NO_DEFAULT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'">
                    {{ tenantHealth.emailSenderStatus }}
                  </span>
                  <span class="text-slate-500">{{ tenantHealth.emailSenderConfigCount }} configuração(ões)</span>
                  <span v-if="tenantHealth.defaultEmailSenderName" class="text-slate-500">
                    Padrão: {{ tenantHealth.defaultEmailSenderName }} <span v-if="tenantHealth.defaultEmailSenderEmail">({{ tenantHealth.defaultEmailSenderEmail }})</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Usuários do tenant selecionado</h2>
                <p v-if="selectedTenant" class="text-xs text-slate-400">@{{ selectedTenant.subdomain }}</p>
              </div>
            </div>

            <p v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</p>
            <div v-if="loadingUsers" class="text-sm text-slate-400">Carregando...</div>
            <div v-else-if="tenantUsers.length === 0" class="text-sm text-slate-400">Nenhum usuário encontrado.</div>
            <div v-else class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-slate-700/40 text-xs uppercase text-slate-400">
                  <tr>
                    <th class="text-left px-4 py-3">Usuário</th>
                    <th class="text-left px-4 py-3">Perfil</th>
                    <th class="text-left px-4 py-3">Status</th>
                    <th class="text-left px-4 py-3">Cadastro</th>
                    <th class="text-left px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="user in tenantUsers" :key="user.id">
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-xs text-slate-400">{{ user.email }}</p>
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      <span v-if="user.systemRole" class="inline-flex items-center gap-1">
                        <span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">Interno</span>
                        {{ systemRoleLabel(user.systemRole) }}
                      </span>
                      <span v-else>{{ user.tenantRoleName ?? '—' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-xs px-2 py-1 rounded-full"
                            :class="user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                        {{ user.active ? 'Ativo' : 'Inativo' }}
                      </span>
                      <span v-if="user.verificationStatus === 'PENDING'" class="ml-2 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Convite pendente
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-400">{{ formatDate(user.createdAt) }}</td>
                    <td class="px-4 py-3">
                      <button
                        v-if="user.active && user.verificationStatus !== 'PENDING'"
                        @click="resetTenantUserAccess(user.id)"
                        :disabled="resettingAccessUserId === user.id"
                        class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors disabled:opacity-60"
                        title="Força o usuário a redefinir a senha no próximo login e invalida a sessão atual"
                      >
                        {{ resettingAccessUserId === user.id ? 'Resetando...' : 'Resetar acesso' }}
                      </button>
                      <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'operators'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Operadores internos</h2>
            <p class="text-xs text-slate-400">Usuários com SystemRole interno no modelo fixo (somente leitura)</p>
          </div>
          <span class="text-xs text-slate-400">{{ operators.length }}</span>
        </div>

        <div v-if="loadingOperators" class="text-sm text-slate-400">Carregando...</div>
        <div v-else-if="operators.length === 0" class="text-sm text-slate-400">Nenhum operador encontrado.</div>
        <div v-else class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-700/40 text-xs uppercase text-slate-400">
              <tr>
                <th class="text-left px-4 py-3">Operador</th>
                <th class="text-left px-4 py-3">Papel interno</th>
                <th class="text-left px-4 py-3">Tenant</th>
                <th class="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="user in operators" :key="user.id">
                <td class="px-4 py-3">
                  <p class="font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                  <p class="text-xs text-slate-400">{{ user.email }}</p>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs text-slate-600 dark:text-slate-300">{{ systemRoleLabel(user.systemRole) }}</span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-400">
                  <div class="flex flex-col">
                    <span class="font-medium text-slate-600 dark:text-slate-300">{{ getTenantDisplayName(user) }}</span>
                    <span class="font-mono text-[11px]">{{ user.tenantId }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 rounded-full"
                        :class="user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                    {{ user.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Auditoria</h2>
            <p class="text-xs text-slate-400">Registro de ações administrativas com filtros combináveis</p>
          </div>
        </div>

        <div class="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Tenant
            <select
              v-model="auditTenantFilter"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
              <option value="">Todos os tenants</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Ator (UUID)
            <input
              v-model="auditActorFilter"
              type="text"
              placeholder="UUID do usuário"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Ação
            <input
              v-model="auditActionFilter"
              type="text"
              placeholder="Ex.: USER_DEACTIVATED"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Recurso
            <input
              v-model="auditResourceFilter"
              type="text"
              placeholder="Ex.: USER"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-500">
            De
            <input
              v-model="auditFromFilter"
              type="datetime-local"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Até
            <input
              v-model="auditToFilter"
              type="datetime-local"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            >
          </label>
        </div>

        <div class="mb-4 flex flex-wrap gap-2">
          <button
            @click="loadAuditLogs()"
            class="px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          >
            Aplicar filtros
          </button>
          <button
            @click="clearAuditFilters()"
            class="px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          >
            Limpar
          </button>
        </div>

        <p v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</p>
        <div v-if="loadingAudit" class="text-sm text-slate-400">Carregando...</div>
        <div v-else-if="auditLogs.length === 0" class="text-sm text-slate-400">Nenhum evento encontrado.</div>
        <div v-else class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-700/40 text-xs uppercase text-slate-400">
              <tr>
                <th class="text-left px-4 py-3">Quando</th>
                <th class="text-left px-4 py-3">Ator</th>
                <th class="text-left px-4 py-3">Ação</th>
                <th class="text-left px-4 py-3">Alvo</th>
                <th class="text-left px-4 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="log in auditLogs" :key="log.id">
                <td class="px-4 py-3 text-xs text-slate-400">{{ formatDate(log.createdAt) }}</td>
                <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{{ formatAuditActor(log) }}</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">{{ formatAuditAction(log.action) }}</td>
                <td class="px-4 py-3 text-xs text-slate-400">{{ log.targetLabel ?? log.resourceId ?? log.tenantId }}</td>
                <td class="px-4 py-3 text-xs text-slate-500">{{ log.details ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
