<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import BlogPostsManager from '@/components/site/BlogPostsManager.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import tenantsAdminService from '@/services/tenantsAdmin'
import websiteConfigService from '@/services/websiteConfig'
import { INTERNAL_SYSTEM_ROLE_OPTIONS, systemRoleLabel } from '@/types/role'
import {
  SUPPORT_PERMISSIONS,
  type SupportPermissionValue,
  type TenantAuditLog,
  type TenantBilling,
  type TenantHealth,
  type TenantSummary,
  type TenantUserSummary,
  type TenantWebsiteConfig,
} from '@/types/tenantsAdmin'

type TabKey = 'tenants' | 'operators' | 'audit' | 'site'

const SUPPORT_PERMISSION_VALUES = new Set<SupportPermissionValue>(
  SUPPORT_PERMISSIONS.map(permission => permission.value)
)

const authStore = useAuthStore()
const { showSuccess, showError } = useNotification()
const activeTab = ref<TabKey>('tenants')

const tenants = ref<TenantSummary[]>([])
const tenantUsers = ref<TenantUserSummary[]>([])
const operators = ref<TenantUserSummary[]>([])
const auditLogs = ref<TenantAuditLog[]>([])
const tenantHealth = ref<TenantHealth | null>(null)
const tenantBilling = ref<TenantBilling | null>(null)

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
const loadingBilling = ref(false)
const loadingOperatorPermissions = ref(false)
const resendingInvitationUserId = ref<string | null>(null)
const resettingAccessUserId = ref<string | null>(null)
const togglingTenantId = ref<string | null>(null)
const togglingUserId = ref<string | null>(null)
const changingRoleUserId = ref<string | null>(null)
const editingOperatorId = ref<string | null>(null)
const editingPermissions = ref<SupportPermissionValue[]>([])
const savingPermissions = ref(false)
const editingTenant = ref(false)
const savingTenant = ref(false)
const tenantEditForm = ref({ name: '', subdomain: '' })
const editingTenantBilling = ref(false)
const savingTenantBilling = ref(false)
const tenantBillingEditForm = ref({
  planCode: 'FREE' as TenantBilling['planCode'],
  maxUsers: 1,
  maxProperties: 10,
  maxLeadsPerMonth: 20,
  maxWhatsappNumbers: 1,
  blogEnabled: false,
  customDomainEnabled: false,
  automationCrmEnabled: false,
  publicApiEnabled: false,
  vipSupportEnabled: false,
  customImplementationEnabled: false,
  notes: '',
})
const editingTenantUserId = ref<string | null>(null)
const savingTenantUserId = ref<string | null>(null)
const tenantUserEditForm = ref({ firstName: '', lastName: '', email: '', phone: '' })
const websiteConfig = ref<Partial<TenantWebsiteConfig> | null>(null)
const loadingWebsiteConfig = ref(false)
const siteConfigTab = ref<'visual' | 'content' | 'contact' | 'blog'>('visual')
const isSavingWebsite = ref(false)
const successMessage = ref<string | null>(null)
const error = ref<string | null>(null)
let successMessageTimeout: ReturnType<typeof setTimeout> | null = null

const availableTabs = computed(() => {
  const tabs: Array<{ key: TabKey; label: string }> = []

  if (authStore.canViewTenants) {
    tabs.push({ key: 'tenants', label: 'Tenants' })
  }
  if (authStore.canViewOperators) {
    tabs.push({ key: 'operators', label: 'Operadores' })
  }
  if (authStore.canEditTenants) {
    tabs.push({ key: 'site', label: 'Site' })
  }
  if (authStore.canViewAudit) {
    tabs.push({ key: 'audit', label: 'Auditoria' })
  }

  return tabs
})
const hasSupportAccess = computed(() => availableTabs.value.length > 0)
const hasTenantDetailsAccess = computed(() => authStore.canEditTenants || authStore.canViewHealth || authStore.canViewTenantUsers)
const tenantsSectionClass = computed(() => hasTenantDetailsAccess.value ? 'grid gap-6 lg:grid-cols-[320px_1fr]' : 'grid gap-6')
const selectedTenant = computed(() => tenants.value.find(tenant => tenant.id === selectedTenantId.value) ?? null)

const AUDIT_ACTION_LABELS: Record<string, string> = {
  SUPPORT_VIEW_TENANTS: 'Visualizou tenants',
  SUPPORT_VIEW_TENANT_USERS: 'Visualizou usuários do tenant',
  SUPPORT_VIEW_OPERATORS: 'Visualizou operadores internos',
  SUPPORT_VIEW_AUDIT: 'Visualizou auditoria',
  SUPPORT_OPERATOR_PERMISSIONS_UPDATED: 'Permissões de suporte atualizadas',
  SUPPORT_PERMISSIONS_UPDATED: 'Permissões de suporte atualizadas',
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

function formatLimitValue(value: number) {
  return value < 0 ? 'Ilimitado' : String(value)
}

function normalizeOperatorPermissions(permissions: string[]): SupportPermissionValue[] {
  return SUPPORT_PERMISSIONS
    .map(permission => permission.value)
    .filter(value => permissions.includes(value) && SUPPORT_PERMISSION_VALUES.has(value))
}

function updateTenantInList(updatedTenant: TenantSummary) {
  tenants.value = tenants.value.map(tenant => tenant.id === updatedTenant.id ? updatedTenant : tenant)
}

function updateTenantUserInLists(updatedUser: TenantUserSummary) {
  tenantUsers.value = tenantUsers.value.map(user => user.id === updatedUser.id ? updatedUser : user)
  operators.value = operators.value.map(user => user.id === updatedUser.id ? updatedUser : user)

  if (tenantHealth.value) {
    tenantHealth.value = {
      ...tenantHealth.value,
      pendingInviteUsers: tenantHealth.value.pendingInviteUsers.map(user => user.id === updatedUser.id ? updatedUser : user),
      inactiveUsersSample: tenantHealth.value.inactiveUsersSample.map(user => user.id === updatedUser.id ? updatedUser : user),
    }
  }
}

function clearSuccessMessageTimeout() {
  if (successMessageTimeout) {
    clearTimeout(successMessageTimeout)
    successMessageTimeout = null
  }
}

function setSuccessMessage(message: string) {
  clearSuccessMessageTimeout()
  successMessage.value = message
  successMessageTimeout = setTimeout(() => {
    successMessage.value = null
    successMessageTimeout = null
  }, 3000)
}

function resetTenantEditForm(tenant: TenantSummary | null = selectedTenant.value) {
  tenantEditForm.value = {
    name: tenant?.name ?? '',
    subdomain: tenant?.subdomain ?? '',
  }
}

function resetTenantBillingEditForm(billing: TenantBilling | null = tenantBilling.value) {
  tenantBillingEditForm.value = {
    planCode: billing?.planCode ?? 'FREE',
    maxUsers: billing?.maxUsers ?? 1,
    maxProperties: billing?.maxProperties ?? 10,
    maxLeadsPerMonth: billing?.maxLeadsPerMonth ?? 20,
    maxWhatsappNumbers: billing?.maxWhatsappNumbers ?? 1,
    blogEnabled: billing?.blogEnabled ?? false,
    customDomainEnabled: billing?.customDomainEnabled ?? false,
    automationCrmEnabled: billing?.automationCrmEnabled ?? false,
    publicApiEnabled: billing?.publicApiEnabled ?? false,
    vipSupportEnabled: billing?.vipSupportEnabled ?? false,
    customImplementationEnabled: billing?.customImplementationEnabled ?? false,
    notes: billing?.notes ?? '',
  }
}

function normalizePlanLimit(value: number | null) {
  return value == null ? -1 : value
}

function applySelectedPlanDefaults(planCode: TenantBilling['planCode']) {
  const selectedPlan = tenantBilling.value?.availablePlans.find(plan => plan.code === planCode)
  if (!selectedPlan) return

  tenantBillingEditForm.value.planCode = selectedPlan.code
  tenantBillingEditForm.value.maxUsers = normalizePlanLimit(selectedPlan.maxUsers)
  tenantBillingEditForm.value.maxProperties = normalizePlanLimit(selectedPlan.maxProperties)
  tenantBillingEditForm.value.maxLeadsPerMonth = normalizePlanLimit(selectedPlan.maxLeadsPerMonth)
  tenantBillingEditForm.value.maxWhatsappNumbers = normalizePlanLimit(selectedPlan.maxWhatsappNumbers)
  tenantBillingEditForm.value.blogEnabled = selectedPlan.blogEnabled
  tenantBillingEditForm.value.customDomainEnabled = selectedPlan.customDomainEnabled
  tenantBillingEditForm.value.automationCrmEnabled = selectedPlan.automationCrmEnabled
  tenantBillingEditForm.value.publicApiEnabled = selectedPlan.publicApiEnabled
  tenantBillingEditForm.value.vipSupportEnabled = selectedPlan.vipSupportEnabled
  tenantBillingEditForm.value.customImplementationEnabled = selectedPlan.customImplementationEnabled
}

function handleBillingPlanChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  applySelectedPlanDefaults(target.value as TenantBilling['planCode'])
}

function cancelTenantEdit() {
  editingTenant.value = false
  resetTenantEditForm()
}

function cancelTenantBillingEdit() {
  editingTenantBilling.value = false
  resetTenantBillingEditForm()
}

function toggleTenantEdit() {
  if (!selectedTenant.value || !authStore.canEditTenants) return

  if (editingTenant.value) {
    cancelTenantEdit()
    return
  }

  resetTenantEditForm(selectedTenant.value)
  editingTenant.value = true
}

function toggleTenantBillingEdit() {
  if (!selectedTenant.value || !authStore.canEditTenants) return

  if (editingTenantBilling.value) {
    cancelTenantBillingEdit()
    return
  }

  resetTenantBillingEditForm()
  editingTenantBilling.value = true
}

function resetTenantUserEditForm(user?: TenantUserSummary | null) {
  tenantUserEditForm.value = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  }
}

function cancelTenantUserEdit() {
  editingTenantUserId.value = null
  resetTenantUserEditForm()
}

function toggleTenantUserEdit(user: TenantUserSummary) {
  if (!authStore.canEditTenantUsers) return

  if (editingTenantUserId.value === user.id) {
    cancelTenantUserEdit()
    return
  }

  editingTenantUserId.value = user.id
  resetTenantUserEditForm(user)
}

function togglePermissionSelection(permission: SupportPermissionValue, checked: boolean) {
  if (checked) {
    editingPermissions.value = SUPPORT_PERMISSIONS
      .map(item => item.value)
      .filter(value => value === permission || editingPermissions.value.includes(value))
    return
  }

  editingPermissions.value = editingPermissions.value.filter(value => value !== permission)
}

async function loadTenants() {
  if (!authStore.canViewTenants) {
    tenants.value = []
    selectedTenantId.value = ''
    return
  }

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
  if (!tenantId || !authStore.canViewTenantUsers) {
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
  if (!tenantId || !authStore.canViewHealth) {
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

async function loadTenantBilling(tenantId: string) {
  if (!tenantId || !authStore.canViewTenants) {
    tenantBilling.value = null
    return
  }

  loadingBilling.value = true
  error.value = null
  try {
    tenantBilling.value = await tenantsAdminService.getTenantBilling(tenantId)
    if (!editingTenantBilling.value) {
      resetTenantBillingEditForm(tenantBilling.value)
    }
  } catch (e: unknown) {
    tenantBilling.value = null
    error.value = e instanceof Error ? e.message : 'Erro ao carregar billing do tenant'
  } finally {
    loadingBilling.value = false
  }
}

async function resendTenantInvitation(userId: string) {
  if (!selectedTenantId.value || !authStore.canEditTenantUsers) return

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
  if (!selectedTenantId.value || !authStore.canEditTenantUsers) return

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

async function saveTenantChanges() {
  if (!selectedTenant.value || !authStore.canEditTenants) return

  savingTenant.value = true
  error.value = null
  try {
    const updatedTenant = await tenantsAdminService.updateTenant(selectedTenant.value.id, {
      name: tenantEditForm.value.name.trim(),
      subdomain: tenantEditForm.value.subdomain.trim(),
    })
    updateTenantInList(updatedTenant)
    if (tenantHealth.value?.tenantId === updatedTenant.id) {
      tenantHealth.value = {
        ...tenantHealth.value,
        tenantName: updatedTenant.name,
        subdomain: updatedTenant.subdomain,
        active: updatedTenant.active,
      }
    }
    cancelTenantEdit()
    const message = 'Tenant atualizado com sucesso.'
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar tenant')
  } finally {
    savingTenant.value = false
  }
}

async function saveTenantBillingChanges() {
  if (!selectedTenant.value || !authStore.canEditTenants) return

  savingTenantBilling.value = true
  error.value = null
  try {
    tenantBilling.value = await tenantsAdminService.updateTenantBilling(selectedTenant.value.id, {
      planCode: tenantBillingEditForm.value.planCode,
      maxUsers: tenantBillingEditForm.value.maxUsers,
      maxProperties: tenantBillingEditForm.value.maxProperties,
      maxLeadsPerMonth: tenantBillingEditForm.value.maxLeadsPerMonth,
      maxWhatsappNumbers: tenantBillingEditForm.value.maxWhatsappNumbers,
      blogEnabled: tenantBillingEditForm.value.blogEnabled,
      customDomainEnabled: tenantBillingEditForm.value.customDomainEnabled,
      automationCrmEnabled: tenantBillingEditForm.value.automationCrmEnabled,
      publicApiEnabled: tenantBillingEditForm.value.publicApiEnabled,
      vipSupportEnabled: tenantBillingEditForm.value.vipSupportEnabled,
      customImplementationEnabled: tenantBillingEditForm.value.customImplementationEnabled,
      notes: tenantBillingEditForm.value.notes?.trim() ? tenantBillingEditForm.value.notes.trim() : null,
    })
    cancelTenantBillingEdit()
    const message = 'Billing do tenant atualizado com sucesso.'
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar billing do tenant')
  } finally {
    savingTenantBilling.value = false
  }
}

async function toggleTenantStatus() {
  if (!selectedTenant.value || !authStore.canEditTenants) return

  togglingTenantId.value = selectedTenant.value.id
  error.value = null
  const nextStatus = !selectedTenant.value.active
  try {
    const updatedTenant = await tenantsAdminService.setTenantStatus(selectedTenant.value.id, nextStatus)
    updateTenantInList(updatedTenant)
    if (tenantHealth.value?.tenantId === updatedTenant.id) {
      tenantHealth.value = {
        ...tenantHealth.value,
        active: updatedTenant.active,
      }
    }
    const message = `Tenant ${updatedTenant.active ? 'ativado' : 'desativado'} com sucesso.`
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar status do tenant')
  } finally {
    togglingTenantId.value = null
  }
}

async function saveTenantUserChanges(userId: string) {
  if (!selectedTenantId.value || !authStore.canEditTenantUsers || editingTenantUserId.value !== userId) return

  savingTenantUserId.value = userId
  error.value = null
  try {
    const updatedUser = await tenantsAdminService.updateTenantUser(selectedTenantId.value, userId, {
      firstName: tenantUserEditForm.value.firstName.trim(),
      lastName: tenantUserEditForm.value.lastName.trim(),
      email: tenantUserEditForm.value.email.trim(),
      phone: tenantUserEditForm.value.phone.trim() || undefined,
    })
    updateTenantUserInLists(updatedUser)
    cancelTenantUserEdit()
    const message = 'Usuário atualizado com sucesso.'
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar usuário')
  } finally {
    savingTenantUserId.value = null
  }
}

async function toggleTenantUserStatus(user: TenantUserSummary) {
  if (!selectedTenantId.value || !authStore.canEditTenantUsers) return

  togglingUserId.value = user.id
  error.value = null
  const nextStatus = !user.active
  try {
    const updatedUser = await tenantsAdminService.setUserStatus(selectedTenantId.value, user.id, nextStatus)
    updateTenantUserInLists(updatedUser)
    await loadTenantHealth(selectedTenantId.value)
    const message = `Usuário ${updatedUser.active ? 'ativado' : 'desativado'} com sucesso.`
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar status do usuário')
  } finally {
    togglingUserId.value = null
  }
}

async function changeOperatorRole(userId: string, systemRole: string) {
  if (!authStore.canEditOperators) return

  changingRoleUserId.value = userId
  error.value = null
  try {
    const updatedUser = await tenantsAdminService.setOperatorRole(userId, systemRole)
    updateTenantUserInLists(updatedUser)
    showSuccess('Papel interno atualizado com sucesso.')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao atualizar papel interno')
  } finally {
    changingRoleUserId.value = null
  }
}

async function handleOperatorRoleChange(userId: string, event: Event) {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  await changeOperatorRole(userId, target.value)
}

async function toggleOperatorPermissions(user: TenantUserSummary) {
  if (!authStore.canEditOperators) return

  if (editingOperatorId.value === user.id) {
    editingOperatorId.value = null
    editingPermissions.value = []
    return
  }

  editingOperatorId.value = user.id
  editingPermissions.value = []
  loadingOperatorPermissions.value = true
  error.value = null
  try {
    const permissions = await tenantsAdminService.getOperatorPermissions(user.id)
    editingPermissions.value = normalizeOperatorPermissions(permissions)
  } catch (e: unknown) {
    editingOperatorId.value = null
    showError(e instanceof Error ? e.message : 'Erro ao carregar permissões do operador')
  } finally {
    loadingOperatorPermissions.value = false
  }
}

function handleSupportPermissionToggle(permission: SupportPermissionValue, event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  togglePermissionSelection(permission, target.checked)
}

async function saveOperatorPermissions() {
  if (!editingOperatorId.value) return

  savingPermissions.value = true
  error.value = null
  try {
    const permissions = await tenantsAdminService.setOperatorPermissions(editingOperatorId.value, editingPermissions.value)
    editingPermissions.value = normalizeOperatorPermissions(permissions)
    showSuccess('Permissões do operador atualizadas com sucesso.')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao salvar permissões do operador')
  } finally {
    savingPermissions.value = false
  }
}

async function loadOperators() {
  if (!authStore.canViewOperators) {
    operators.value = []
    editingOperatorId.value = null
    editingPermissions.value = []
    return
  }

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
  if (!authStore.canViewAudit) {
    auditLogs.value = []
    return
  }

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

async function loadWebsiteConfig(tenantId: string) {
  if (!tenantId || !authStore.canEditTenants) {
    websiteConfig.value = null
    return
  }

  loadingWebsiteConfig.value = true
  error.value = null
  try {
    websiteConfig.value = await websiteConfigService.getSupportConfig(tenantId)
  } catch (e: unknown) {
    websiteConfig.value = null
    showError(e instanceof Error ? e.message : 'Erro ao carregar configurações do site')
  } finally {
    loadingWebsiteConfig.value = false
  }
}

async function saveWebsiteConfig() {
  if (!selectedTenant.value || !authStore.canEditTenants || !websiteConfig.value) return

  isSavingWebsite.value = true
  error.value = null
  try {
    websiteConfig.value = await websiteConfigService.updateSupportConfig(selectedTenant.value.id, websiteConfig.value)
    const message = 'Configurações do site atualizadas com sucesso.'
    setSuccessMessage(message)
    showSuccess(message)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao salvar configurações do site')
  } finally {
    isSavingWebsite.value = false
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
  if (!authStore.canViewAudit) return

  resetAuditFilters()
  await loadAuditLogs()
}

watch(selectedTenantId, async tenantId => {
  editingTenant.value = false
  editingTenantBilling.value = false
  resetTenantEditForm()
  resetTenantBillingEditForm()
  cancelTenantUserEdit()

  if (!tenantId) {
    tenantUsers.value = []
    tenantHealth.value = null
    tenantBilling.value = null
    websiteConfig.value = null
    return
  }

  const loaders: Promise<void>[] = []

  if (authStore.canViewTenantUsers) {
    loaders.push(loadTenantUsers(tenantId))
  }
  if (authStore.canViewHealth) {
    loaders.push(loadTenantHealth(tenantId))
  }
  if (authStore.canViewTenants) {
    loaders.push(loadTenantBilling(tenantId))
  }
  if (activeTab.value === 'site' && authStore.canEditTenants) {
    loaders.push(loadWebsiteConfig(tenantId))
  }

  if (loaders.length > 0) {
    await Promise.all(loaders)
  }
})

watch(availableTabs, tabs => {
  if (tabs.length > 0 && !tabs.some(tab => tab.key === activeTab.value)) {
    activeTab.value = tabs[0].key
  }
}, { immediate: true })

watch(activeTab, async tab => {
  if (tab === 'operators' && authStore.canViewOperators && operators.value.length === 0) {
    await loadOperators()
  }
  if (tab === 'site' && authStore.canEditTenants && selectedTenant.value) {
    await loadWebsiteConfig(selectedTenant.value.id)
  }
  if (tab === 'audit' && authStore.canViewAudit && auditLogs.value.length === 0) {
    await loadAuditLogs()
  }
})

watch(selectedTenant, tenant => {
  if (!editingTenant.value) {
    resetTenantEditForm(tenant)
  }
  if (!editingTenantBilling.value) {
    resetTenantBillingEditForm(tenantBilling.value)
  }
})

onBeforeUnmount(() => {
  clearSuccessMessageTimeout()
})

onMounted(async () => {
  await Promise.all([
    authStore.canViewTenants ? loadTenants() : Promise.resolve(),
    authStore.canViewOperators ? loadOperators() : Promise.resolve(),
    authStore.canViewAudit ? loadAuditLogs() : Promise.resolve(),
  ])
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

    <div v-if="!authStore.isInternalStaff || !hasSupportAccess" class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
      Você não tem acesso a esta área.
    </div>

    <div v-else class="space-y-6">
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.key
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
        >
          {{ tab.label }}
        </button>
      </div>

      <p v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ successMessage }}
      </p>

      <section v-if="activeTab === 'tenants' && authStore.canViewTenants" :class="tenantsSectionClass">
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

        <div v-if="hasTenantDetailsAccess" class="space-y-6 lg:col-start-2">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div v-if="selectedTenant" class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase text-slate-400">Dados do tenant</p>
                  <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ selectedTenant.name }}</p>
                  <p class="text-xs text-slate-400">@{{ selectedTenant.subdomain }}</p>
                </div>
                <button
                  v-if="authStore.canEditTenants"
                  @click="toggleTenantEdit"
                  :disabled="savingTenant"
                  class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                >
                  {{ editingTenant ? 'Fechar' : 'Editar' }}
                </button>
              </div>

              <form v-if="editingTenant" class="mt-4 space-y-4" @submit.prevent="saveTenantChanges">
                <div class="grid gap-3 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Nome
                    <input
                      v-model="tenantEditForm.name"
                      type="text"
                      class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                    >
                  </label>
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Subdomínio
                    <input
                      v-model="tenantEditForm.subdomain"
                      type="text"
                      class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                    >
                  </label>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    :disabled="savingTenant"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {{ savingTenant ? 'Salvando...' : 'Salvar' }}
                  </button>
                  <button
                    type="button"
                    @click="cancelTenantEdit"
                    :disabled="savingTenant"
                    class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
            <div v-else class="text-sm text-slate-400">Selecione um tenant para visualizar os detalhes.</div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Plano e limites</h2>
                <p class="text-xs text-slate-400">Gestão de assinatura e permissões efetivas do tenant</p>
              </div>
              <button
                v-if="selectedTenant && authStore.canEditTenants"
                @click="toggleTenantBillingEdit"
                :disabled="savingTenantBilling || loadingBilling"
                class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
              >
                {{ editingTenantBilling ? 'Fechar' : 'Editar billing' }}
              </button>
            </div>

            <div v-if="loadingBilling" class="text-sm text-slate-400">Carregando billing...</div>
            <div v-else-if="!tenantBilling" class="text-sm text-slate-400">Nenhum dado de billing encontrado.</div>
            <div v-else class="space-y-4">
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Plano</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantBilling.planName }}</p>
                  <p class="text-xs text-slate-400">{{ tenantBilling.planCode }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Assinatura</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ tenantBilling.subscriptionStatus }}</p>
                  <p class="text-xs text-slate-400">{{ tenantBilling.provider }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Usuários</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimitValue(tenantBilling.maxUsers) }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Imóveis</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimitValue(tenantBilling.maxProperties) }}</p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">Leads/mês</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimitValue(tenantBilling.maxLeadsPerMonth) }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="text-[10px] uppercase text-slate-400">WhatsApps</p>
                  <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimitValue(tenantBilling.maxWhatsappNumbers) }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:col-span-2 xl:col-span-2">
                  <p class="text-[10px] uppercase text-slate-400">Recursos</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.blogEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">Blog</span>
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.customDomainEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">Domínio</span>
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.automationCrmEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">Automações</span>
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.publicApiEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">API pública</span>
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.vipSupportEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">Suporte VIP</span>
                    <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="tenantBilling.customImplementationEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">Implantação</span>
                  </div>
                </div>
              </div>

              <form v-if="editingTenantBilling && authStore.canEditTenants" class="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4" @submit.prevent="saveTenantBillingChanges">
                <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Plano
                    <select v-model="tenantBillingEditForm.planCode" @change="handleBillingPlanChange" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      <option v-for="plan in tenantBilling.availablePlans" :key="plan.code" :value="plan.code">
                        {{ plan.planName }} ({{ plan.code }})
                      </option>
                    </select>
                  </label>
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Máx. usuários (-1 = ilimitado)
                    <input v-model.number="tenantBillingEditForm.maxUsers" type="number" min="-1" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  </label>
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Máx. imóveis (-1 = ilimitado)
                    <input v-model.number="tenantBillingEditForm.maxProperties" type="number" min="-1" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  </label>
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Máx. leads/mês (-1 = ilimitado)
                    <input v-model.number="tenantBillingEditForm.maxLeadsPerMonth" type="number" min="-1" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  </label>
                  <label class="flex flex-col gap-1 text-xs text-slate-500">
                    Máx. WhatsApps (-1 = ilimitado)
                    <input v-model.number="tenantBillingEditForm.maxWhatsappNumbers" type="number" min="-1" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  </label>
                </div>

                <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.blogEnabled" type="checkbox"> Blog</label>
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.customDomainEnabled" type="checkbox"> Domínio customizado</label>
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.automationCrmEnabled" type="checkbox"> Automação CRM</label>
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.publicApiEnabled" type="checkbox"> API pública</label>
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.vipSupportEnabled" type="checkbox"> Suporte VIP</label>
                  <label class="inline-flex items-center gap-2"><input v-model="tenantBillingEditForm.customImplementationEnabled" type="checkbox"> Implantação personalizada</label>
                </div>

                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Observações
                  <textarea v-model="tenantBillingEditForm.notes" rows="3" class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"></textarea>
                </label>

                <div class="flex flex-wrap items-center gap-2">
                  <button type="submit" :disabled="savingTenantBilling" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-60">
                    {{ savingTenantBilling ? 'Salvando...' : 'Salvar billing' }}
                  </button>
                  <button type="button" @click="cancelTenantBillingEdit" :disabled="savingTenantBilling" class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div v-if="authStore.canViewHealth" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Saúde do tenant</h2>
                <p class="text-xs text-slate-400">Sinais rápidos para triagem do suporte</p>
              </div>
              <div class="flex items-center gap-2">
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
                <button
                  v-if="authStore.canEditTenants && selectedTenant"
                  @click="toggleTenantStatus"
                  :disabled="togglingTenantId === selectedTenant.id"
                  class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                >
                  {{ togglingTenantId === selectedTenant.id ? 'Salvando...' : selectedTenant.active ? 'Desativar' : 'Ativar' }}
                </button>
              </div>
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
                          v-if="authStore.canEditTenantUsers"
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

          <div v-if="authStore.canViewTenantUsers" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
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
                  <template v-for="user in tenantUsers" :key="user.id">
                    <tr>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-xs text-slate-400">{{ user.email }}</p>
                        <p v-if="user.phone" class="text-xs text-slate-400">{{ user.phone }}</p>
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
                        <div class="flex flex-wrap items-center gap-2">
                          <button
                            v-if="authStore.canEditTenantUsers"
                            @click="toggleTenantUserEdit(user)"
                            :disabled="savingTenantUserId === user.id"
                            class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                          >
                            {{ editingTenantUserId === user.id ? 'Fechar' : 'Editar' }}
                          </button>
                          <button
                            v-if="authStore.canEditTenantUsers"
                            @click="toggleTenantUserStatus(user)"
                            :disabled="togglingUserId === user.id"
                            class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                          >
                            {{ togglingUserId === user.id ? 'Salvando...' : user.active ? 'Desativar' : 'Ativar' }}
                          </button>
                          <button
                            v-if="authStore.canEditTenantUsers && user.active && user.verificationStatus !== 'PENDING'"
                            @click="resetTenantUserAccess(user.id)"
                            :disabled="resettingAccessUserId === user.id"
                            class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors disabled:opacity-60"
                            title="Força o usuário a redefinir a senha no próximo login e invalida a sessão atual"
                          >
                            {{ resettingAccessUserId === user.id ? 'Resetando...' : 'Resetar acesso' }}
                          </button>
                          <span v-else-if="!authStore.canEditTenantUsers" class="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="editingTenantUserId === user.id">
                      <td colspan="5" class="bg-slate-50/80 px-4 py-4 dark:bg-slate-900/30">
                        <form class="grid gap-3 lg:grid-cols-2" @submit.prevent="saveTenantUserChanges(user.id)">
                          <label class="flex flex-col gap-1 text-xs text-slate-500">
                            Nome
                            <input
                              v-model="tenantUserEditForm.firstName"
                              type="text"
                              class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                            >
                          </label>
                          <label class="flex flex-col gap-1 text-xs text-slate-500">
                            Sobrenome
                            <input
                              v-model="tenantUserEditForm.lastName"
                              type="text"
                              class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                            >
                          </label>
                          <label class="flex flex-col gap-1 text-xs text-slate-500">
                            E-mail
                            <input
                              v-model="tenantUserEditForm.email"
                              type="email"
                              class="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                            >
                          </label>
                          <label class="flex flex-col gap-1 text-xs text-slate-500">
                            Telefone
                            <PhoneInput v-model="tenantUserEditForm.phone" placeholder="(11) 99999-9999" />
                          </label>
                          <div class="lg:col-span-2 flex flex-wrap items-center gap-2">
                            <button
                              type="submit"
                              :disabled="savingTenantUserId === user.id"
                              class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-60"
                            >
                              {{ savingTenantUserId === user.id ? 'Salvando...' : 'Salvar' }}
                            </button>
                            <button
                              type="button"
                              @click="cancelTenantUserEdit"
                              :disabled="savingTenantUserId === user.id"
                              class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'operators' && authStore.canViewOperators" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Operadores internos</h2>
            <p class="text-xs text-slate-400">Usuários com SystemRole interno no modelo fixo</p>
          </div>
          <span class="text-xs text-slate-400">{{ operators.length }}</span>
        </div>

        <p v-if="authStore.canEditOperators" class="mb-4 text-xs text-slate-400">Clique em um operador para gerenciar permissões granulares.</p>
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
              <template v-for="user in operators" :key="user.id">
                <tr
                  @click="toggleOperatorPermissions(user)"
                  :class="authStore.canEditOperators ? 'cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/20' : ''"
                >
                  <td class="px-4 py-3">
                    <p class="font-semibold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-xs text-slate-400">{{ user.email }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <select
                      v-if="authStore.canEditOperators"
                      :value="user.systemRole ?? ''"
                      @click.stop
                      @change="handleOperatorRoleChange(user.id, $event)"
                      :disabled="changingRoleUserId === user.id"
                      class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 disabled:opacity-60"
                    >
                      <option
                        v-for="option in INTERNAL_SYSTEM_ROLE_OPTIONS"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                    <span v-else class="text-xs text-slate-600 dark:text-slate-300">{{ systemRoleLabel(user.systemRole) }}</span>
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
                <tr v-if="editingOperatorId === user.id && authStore.canEditOperators">
                  <td colspan="4" class="bg-slate-50/80 px-4 py-4 dark:bg-slate-900/30">
                    <div @click.stop class="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                      <div class="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Permissões de suporte</h3>
                          <p class="text-xs text-slate-400">{{ user.firstName }} {{ user.lastName }} · {{ editingPermissions.length }} selecionada(s)</p>
                        </div>
                        <button
                          @click.stop="toggleOperatorPermissions(user)"
                          class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/40"
                        >
                          Fechar
                        </button>
                      </div>

                      <div v-if="loadingOperatorPermissions" class="text-sm text-slate-400">Carregando...</div>
                      <div v-else class="space-y-4">
                        <div class="grid gap-3 md:grid-cols-2">
                          <label
                            v-for="permission in SUPPORT_PERMISSIONS"
                            :key="permission.value"
                            class="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-900/20"
                          >
                            <input
                              :checked="editingPermissions.includes(permission.value)"
                              :disabled="savingPermissions"
                              @change="handleSupportPermissionToggle(permission.value, $event)"
                              type="checkbox"
                              class="h-4 w-4 accent-indigo-600"
                            >
                            <span>{{ permission.label }}</span>
                          </label>
                        </div>

                        <div class="flex items-center gap-3">
                          <button
                            @click.stop="saveOperatorPermissions"
                            :disabled="savingPermissions"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-60"
                          >
                            {{ savingPermissions ? 'Salvando...' : 'Salvar' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else-if="activeTab === 'site' && authStore.canEditTenants" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Configurações do Site</h2>
        <p v-if="!selectedTenant" class="text-slate-400 text-sm">Selecione uma tenant para editar.</p>
        <div v-else-if="loadingWebsiteConfig" class="text-sm text-slate-400">Carregando...</div>
        <form v-else-if="websiteConfig" class="space-y-4" @submit.prevent="saveWebsiteConfig">
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="siteConfigTab = 'visual'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteConfigTab === 'visual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Visual
            </button>
            <button
              type="button"
              @click="siteConfigTab = 'content'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteConfigTab === 'content' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Conteúdo
            </button>
            <button
              type="button"
              @click="siteConfigTab = 'contact'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteConfigTab === 'contact' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Contato
            </button>
            <button
              type="button"
              @click="siteConfigTab = 'blog'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteConfigTab === 'blog' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Blog
            </button>
          </div>

          <div v-if="siteConfigTab === 'visual'" class="grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
              URL da logo
              <input v-model="websiteConfig.logoUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
              URL do favicon
              <input v-model="websiteConfig.faviconUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              Cor primária
              <input v-model="websiteConfig.primaryColor" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              Cor secundária
              <input v-model="websiteConfig.secondaryColor" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
          </div>

          <div v-else-if="siteConfigTab === 'content'" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Nome da empresa
                <input v-model="websiteConfig.companyName" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Título principal
                <input v-model="websiteConfig.heroTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
                Subtítulo principal
                <textarea v-model="websiteConfig.heroSubtitle" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
                Descrição
                <textarea v-model="websiteConfig.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
              </label>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Destaques - título
                <input v-model="websiteConfig.featuredSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Destaques - subtítulo
                <input v-model="websiteConfig.featuredSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Lançamentos - título
                <input v-model="websiteConfig.launchesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Lançamentos - subtítulo
                <input v-model="websiteConfig.launchesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Categorias - título
                <input v-model="websiteConfig.categoriesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Categorias - subtítulo
                <input v-model="websiteConfig.categoriesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Serviços - título
                <input v-model="websiteConfig.servicesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Serviços - subtítulo
                <input v-model="websiteConfig.servicesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Formulário - título
                <input v-model="websiteConfig.servicesFormTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Formulário - subtítulo
                <input v-model="websiteConfig.servicesFormSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Estatísticas - título
                <input v-model="websiteConfig.statsSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Estatísticas - subtítulo
                <input v-model="websiteConfig.statsSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Blog - título
                <input v-model="websiteConfig.blogSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                Blog - subtítulo
                <input v-model="websiteConfig.blogSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                CTA - título
                <input v-model="websiteConfig.ctaSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
              <label class="flex flex-col gap-1 text-xs text-slate-500">
                CTA - subtítulo
                <input v-model="websiteConfig.ctaSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </label>
            </div>
          </div>

          <BlogPostsManager v-else-if="siteConfigTab === 'blog'" :tenant-id="selectedTenant.id" />

          <div v-else class="grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              Telefone
              <PhoneInput v-model="websiteConfig.phone" placeholder="(11) 99999-9999" />
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              E-mail
              <input v-model="websiteConfig.email" type="email" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
              Endereço
              <input v-model="websiteConfig.address" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              Instagram
              <input v-model="websiteConfig.instagramUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500">
              WhatsApp
              <PhoneInput v-model="websiteConfig.whatsappNumber" placeholder="11 99999-9999" />
            </label>
            <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
              Facebook
              <input v-model="websiteConfig.facebookUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </label>
          </div>

          <div v-if="siteConfigTab !== 'blog'" class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">Tenant selecionado</p>
              <p class="text-xs text-slate-400">{{ selectedTenant.name }} · @{{ selectedTenant.subdomain }}</p>
            </div>
            <button
              type="submit"
              :disabled="isSavingWebsite"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {{ isSavingWebsite ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
        <p v-else class="text-sm text-slate-400">Nenhuma configuração disponível.</p>
      </section>

      <section v-else-if="activeTab === 'audit' && authStore.canViewAudit" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
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
