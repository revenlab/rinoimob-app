<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import billingService from '@/services/billing'
import { useNotification } from '@/composables/useNotification'
import type {
  BillingInvoice,
  BillingPaymentStatus,
  TenantBillingPlanOption,
  TenantBillingPortal,
} from '@/types/billing'
import { BILLING_FEATURES, isBillingFeatureKey } from '@/utils/billingFeatures'

const { showError, showSuccess } = useNotification()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingInvoices = ref(false)
const startingCheckoutFor = ref<string | null>(null)
const savingBillingCustomer = ref(false)
const changingCancellation = ref(false)
const updatingCard = ref(false)
const error = ref<string | null>(null)
const billing = ref<TenantBillingPortal | null>(null)
const invoices = ref<BillingInvoice[]>([])
const invoicePage = ref(0)
const invoiceTotalPages = ref(0)
const secureCardToken = ref('')
let callbackPoll: ReturnType<typeof setTimeout> | null = null
let callbackPollAttempts = 0
const billingCustomer = ref({
  cpfCnpj: '',
  phone: '',
  address: '',
  addressNumber: '',
  addressComplement: '',
  postalCode: '',
  province: '',
})

const plans = computed(() => billing.value?.availablePlans ?? [])
const requestedFeature = computed(() => {
  const value = Array.isArray(route.query.feature) ? route.query.feature[0] : route.query.feature
  return isBillingFeatureKey(value) ? BILLING_FEATURES[value] : null
})
const recommendedPlanCode = computed(() => {
  const value = Array.isArray(route.query.upgrade) ? route.query.upgrade[0] : route.query.upgrade
  if (['FREE', 'STARTER', 'PRIME', 'ULTIMATE'].includes(value ?? '')) {
    return value as TenantBillingPlanOption['code']
  }
  return requestedFeature.value?.requiredPlanCode ?? null
})
const isDelinquent = computed(() => ['PAST_DUE', 'SUSPENDED'].includes(billing.value?.subscriptionStatus ?? ''))
const hasOpenChange = computed(() => ['PENDING', 'PAID', 'SCHEDULED'].includes(billing.value?.pendingChange?.status ?? ''))

type PlanFeatureKey =
  | 'blogEnabled'
  | 'customDomainEnabled'
  | 'automationCrmEnabled'
  | 'publicApiEnabled'
  | 'vipSupportEnabled'
  | 'customImplementationEnabled'

const planFeatureRows: Array<{ key: PlanFeatureKey; label: string }> = [
  { key: 'blogEnabled', label: 'Blog' },
  { key: 'customDomainEnabled', label: 'Domínio customizado' },
  { key: 'automationCrmEnabled', label: 'Automações CRM' },
  { key: 'publicApiEnabled', label: 'API pública' },
  { key: 'vipSupportEnabled', label: 'Suporte VIP' },
  { key: 'customImplementationEnabled', label: 'Implantação personalizada' },
]

const subscriptionStatusLabels: Record<TenantBillingPortal['subscriptionStatus'], string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento atrasado',
  SUSPENDED: 'Suspensa',
  CANCELED: 'Cancelada',
  TRIAL: 'Período de teste',
}

const paymentStatusLabels: Record<BillingPaymentStatus, string> = {
  PENDING: 'Pendente',
  RISK_ANALYSIS: 'Em análise',
  AUTHORIZED: 'Autorizada',
  CONFIRMED: 'Confirmada',
  RECEIVED: 'Recebida',
  OVERDUE: 'Vencida',
  REFUNDED: 'Estornada',
  CHARGEBACK: 'Chargeback',
  CANCELED: 'Cancelada',
  DELETED: 'Excluída',
  UNKNOWN: 'Desconhecida',
}

function formatLimit(value: number | null | undefined) {
  if (value == null || value < 0) return 'Ilimitado'
  return String(value)
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || value <= 0) return 'Sob consulta'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function isCurrentPlan(plan: TenantBillingPlanOption) {
  return billing.value?.currentPlanCode === plan.code
}

function isRecommendedPlan(plan: TenantBillingPlanOption) {
  return recommendedPlanCode.value === plan.code
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value))
}

function formatShortDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`))
}

function paymentStatusClass(status: BillingPaymentStatus) {
  if (['CONFIRMED', 'RECEIVED'].includes(status)) return 'bg-emerald-100 text-emerald-700'
  if (status === 'OVERDUE') return 'bg-red-100 text-red-700'
  if (['REFUNDED', 'CHARGEBACK', 'CANCELED', 'DELETED'].includes(status)) return 'bg-slate-200 text-slate-700'
  return 'bg-amber-100 text-amber-700'
}

async function loadInvoices(page = invoicePage.value) {
  loadingInvoices.value = true
  try {
    const result = await billingService.listInvoices(page)
    invoices.value = result.content
    invoicePage.value = result.number
    invoiceTotalPages.value = result.totalPages
  } finally {
    loadingInvoices.value = false
  }
}

async function loadBilling(showLoader = true) {
  if (showLoader) loading.value = true
  error.value = null
  try {
    const [portal] = await Promise.all([
      billingService.getMyBilling(),
      loadInvoices(),
    ])
    billing.value = portal
    const customer = billing.value.billingCustomer
    billingCustomer.value = {
      cpfCnpj: customer.cpfCnpj ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      addressNumber: customer.addressNumber ?? '',
      addressComplement: customer.addressComplement ?? '',
      postalCode: customer.postalCode ?? '',
      province: customer.province ?? '',
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar dados de billing'
  } finally {
    if (showLoader) loading.value = false
  }
}

async function saveBillingCustomer(showNotification = true) {
  savingBillingCustomer.value = true
  try {
    const updated = await billingService.updateCustomer(billingCustomer.value)
    if (billing.value) {
      billing.value = { ...billing.value, billingCustomer: updated }
    }
    if (showNotification) {
      showSuccess('Dados de cobrança salvos')
    }
  } finally {
    savingBillingCustomer.value = false
  }
}

async function startUpgrade(planCode: TenantBillingPlanOption['code']) {
  startingCheckoutFor.value = planCode
  try {
    await saveBillingCustomer(false)
    const response = await billingService.startCheckout({
      planCode,
    })
    if (response.requiresCheckout && response.checkoutUrl) {
      showSuccess('Redirecionando para pagamento...')
      window.location.href = response.checkoutUrl
      return
    }
    showSuccess(`Alteração agendada${response.effectiveAt ? ` para ${formatDate(response.effectiveAt)}` : ''}`)
    await loadBilling(false)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
  } finally {
    startingCheckoutFor.value = null
  }
}

async function toggleCancellation() {
  if (!billing.value) return
  const scheduling = !billing.value.cancelAtPeriodEnd
  if (scheduling && !window.confirm('Cancelar a assinatura ao fim do período já pago?')) return
  changingCancellation.value = true
  try {
    billing.value = scheduling
      ? await billingService.cancelSubscription()
      : await billingService.reactivateSubscription()
    showSuccess(scheduling ? 'Cancelamento agendado' : 'Assinatura reativada')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Não foi possível alterar o cancelamento')
  } finally {
    changingCancellation.value = false
  }
}

async function updateCard() {
  if (!secureCardToken.value.trim()) return
  updatingCard.value = true
  try {
    await billingService.updateCardToken({ creditCardToken: secureCardToken.value.trim() })
    secureCardToken.value = ''
    showSuccess('Cartão atualizado com segurança')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Não foi possível atualizar o cartão')
  } finally {
    updatingCard.value = false
  }
}

function scheduleCallbackPolling() {
  if (route.query.billing !== 'success' || callbackPollAttempts >= 15) return
  callbackPoll = setTimeout(async () => {
    callbackPollAttempts += 1
    await loadBilling(false)
    if (!billing.value?.pendingChange || billing.value.pendingChange.status === 'APPLIED') {
      showSuccess('Pagamento confirmado e plano atualizado')
      await router.replace({ query: { ...route.query, billing: undefined } })
      return
    }
    scheduleCallbackPolling()
  }, 2000)
}

onMounted(async () => {
  await loadBilling()
  if (route.query.billing === 'cancel') {
    showError('Checkout cancelado. Seu plano atual não foi alterado.')
    await router.replace({ query: { ...route.query, billing: undefined } })
  } else {
    scheduleCallbackPolling()
  }
})

onUnmounted(() => {
  if (callbackPoll) clearTimeout(callbackPoll)
})
</script>

<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Meu plano</h1>
        <p class="text-xs text-slate-400">Acompanhe seus limites e faça upgrade quando precisar</p>
      </div>
    </template>

    <div class="space-y-6">
      <div v-if="loading" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-sm text-slate-500">
        Carregando billing...
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {{ error }}
      </div>

      <template v-else-if="billing">
        <section
          v-if="requestedFeature"
          class="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Upgrade recomendado</p>
          <h2 class="mt-2 text-base font-bold">Desbloqueie {{ requestedFeature.label }}</h2>
          <p class="mt-1 text-sm opacity-80">
            O plano {{ requestedFeature.requiredPlanName }} ou superior inclui este recurso.
          </p>
        </section>

        <section
          v-if="isDelinquent"
          class="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold">
                {{ billing.subscriptionStatus === 'SUSPENDED' ? 'Sua assinatura está suspensa' : 'Sua fatura está vencida' }}
              </h2>
              <p class="mt-1 text-sm text-red-800 dark:text-red-200">
                {{ billing.subscriptionStatus === 'SUSPENDED'
                  ? 'Os limites do plano Free estão ativos até a confirmação do pagamento. Seu plano contratado será restaurado automaticamente.'
                  : 'Regularize o pagamento para manter o acesso integral ao plano.' }}
                <span v-if="billing.paymentDueDate"> Vencimento: {{ formatDate(billing.paymentDueDate) }}.</span>
              </p>
            </div>
            <a
              v-if="billing.overdueInvoiceUrl"
              :href="billing.overdueInvoiceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Pagar fatura vencida
            </a>
            <p v-else class="text-sm font-medium">O link de pagamento será disponibilizado em breve.</p>
          </div>
        </section>

        <section
          v-if="billing.pendingChange"
          class="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold">Alteração para {{ billing.pendingChange.targetPlanName }}</h2>
              <p class="mt-1 text-sm opacity-80">
                Status: {{ billing.pendingChange.status }}
                <span v-if="billing.pendingChange.effectiveAt"> · Vigência em {{ formatDate(billing.pendingChange.effectiveAt) }}</span>
              </p>
            </div>
            <a
              v-if="billing.pendingChange.checkoutUrl && billing.pendingChange.status === 'PENDING'"
              :href="billing.pendingChange.checkoutUrl"
              class="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              Continuar pagamento
            </a>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Plano atual</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ billing.currentPlanName }}</p>
              <p class="text-xs text-slate-400">{{ billing.currentPlanCode }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Status</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ subscriptionStatusLabels[billing.subscriptionStatus] }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Usuários</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimit(billing.maxUsers) }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Próxima cobrança</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">
                {{ billing.nextCharge ? formatCurrency(billing.nextCharge.value) : '—' }}
              </p>
              <p v-if="billing.nextCharge?.dueDate" class="text-xs text-slate-400">{{ formatShortDate(billing.nextCharge.dueDate) }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Dados de cobrança</h2>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-300">Obrigatórios para criar a assinatura recorrente com cartão.</p>
            </div>
            <span
              class="rounded-full px-2 py-1 text-[10px] font-semibold"
              :class="billing.billingCustomer.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
            >
              {{ billing.billingCustomer.complete ? 'Cadastro completo' : 'Preenchimento necessário' }}
            </span>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">CPF ou CNPJ
              <input v-model="billingCustomer.cpfCnpj" inputmode="numeric" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">Telefone
              <input v-model="billingCustomer.phone" inputmode="tel" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">CEP
              <input v-model="billingCustomer.postalCode" inputmode="numeric" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300 md:col-span-2">Logradouro
              <input v-model="billingCustomer.address" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">Número
              <input v-model="billingCustomer.addressNumber" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">Bairro
              <input v-model="billingCustomer.province" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required>
            </label>
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300 md:col-span-2">Complemento <span class="font-normal">(opcional)</span>
              <input v-model="billingCustomer.addressComplement" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
            </label>
          </div>

          <button
            class="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            :disabled="savingBillingCustomer"
            @click="saveBillingCustomer()"
          >
            {{ savingBillingCustomer ? 'Salvando...' : 'Salvar dados de cobrança' }}
          </button>
        </section>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="plan in plans"
            :key="plan.code"
            class="rounded-2xl border bg-white dark:bg-slate-800 p-4"
            :class="isCurrentPlan(plan) || isRecommendedPlan(plan)
              ? 'border-indigo-300 ring-2 ring-indigo-100 dark:border-indigo-500 dark:ring-indigo-900/60'
              : 'border-slate-200 dark:border-slate-700'"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ plan.planName }}</p>
                <p class="text-xs text-slate-400">{{ plan.code }}</p>
              </div>
              <span
                v-if="isCurrentPlan(plan)"
                class="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700"
              >
                Atual
              </span>
              <span
                v-else-if="isRecommendedPlan(plan)"
                class="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
              >
                Recomendado
              </span>
            </div>

            <p class="mt-3 text-lg font-bold text-slate-900 dark:text-white">
              {{ formatCurrency(plan.monthlyPrice) }}
              <span class="text-xs font-normal text-slate-400">/mês</span>
            </p>

            <div class="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-300">
              <p>Usuários: <strong>{{ formatLimit(plan.maxUsers) }}</strong></p>
              <p>Imóveis: <strong>{{ formatLimit(plan.maxProperties) }}</strong></p>
              <p>Leads/mês: <strong>{{ formatLimit(plan.maxLeadsPerMonth) }}</strong></p>
              <p>WhatsApps: <strong>{{ formatLimit(plan.maxWhatsappNumbers) }}</strong></p>
            </div>

            <div class="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-700">
              <p
                v-for="featureRow in planFeatureRows"
                :key="featureRow.key"
                class="flex items-center justify-between gap-2"
                :class="plan[featureRow.key] ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'"
              >
                <span>{{ featureRow.label }}</span>
                <strong :class="plan[featureRow.key] ? 'text-emerald-600 dark:text-emerald-400' : ''">
                  {{ plan[featureRow.key] ? '✓' : '—' }}
                </strong>
              </p>
            </div>

            <button
              class="mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold"
              :class="isCurrentPlan(plan)
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              :disabled="isCurrentPlan(plan) || hasOpenChange || startingCheckoutFor === plan.code"
              @click="startUpgrade(plan.code)"
            >
              {{ startingCheckoutFor === plan.code
                ? 'Processando...'
                : (isCurrentPlan(plan) ? 'Plano atual' : (hasOpenChange ? 'Alteração em andamento' : 'Selecionar plano')) }}
            </button>
          </article>
        </section>

        <section class="grid gap-4 xl:grid-cols-2">
          <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Gerenciar assinatura</h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {{ billing.cancelAtPeriodEnd
                ? `Cancelamento agendado para ${formatDate(billing.currentPeriodEnd) ?? 'o fim do período atual'}.`
                : 'O cancelamento preserva seu acesso até o fim do período já pago.' }}
            </p>
            <button
              type="button"
              class="mt-4 rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              :class="billing.cancelAtPeriodEnd
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40'"
              :disabled="changingCancellation || billing.currentPlanCode === 'FREE'"
              @click="toggleCancellation"
            >
              {{ changingCancellation
                ? 'Salvando...'
                : (billing.cancelAtPeriodEnd ? 'Manter minha assinatura' : 'Cancelar ao fim do período') }}
            </button>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Forma de pagamento</h2>
            <template v-if="billing.cardUpdateAvailable">
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-300">Informe somente o token gerado pelo formulário seguro do provedor.</p>
              <div class="mt-4 flex gap-2">
                <input
                  v-model="secureCardToken"
                  type="password"
                  autocomplete="off"
                  placeholder="Token seguro do cartão"
                  class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                <button
                  type="button"
                  class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  :disabled="updatingCard || !secureCardToken.trim()"
                  @click="updateCard"
                >
                  {{ updatingCard ? 'Atualizando...' : 'Atualizar' }}
                </button>
              </div>
            </template>
            <p v-else class="mt-2 text-sm text-slate-500 dark:text-slate-300">
              A troca segura de cartão ficará disponível quando a tokenização do Asaas estiver habilitada neste ambiente.
            </p>
          </article>
        </section>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div class="border-b border-slate-200 p-5 dark:border-slate-700">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Faturas e pagamentos</h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-300">Histórico sincronizado com o Asaas.</p>
          </div>
          <div v-if="loadingInvoices" class="p-5 text-sm text-slate-500">Carregando faturas...</div>
          <div v-else-if="invoices.length === 0" class="p-5 text-sm text-slate-500">Nenhuma fatura encontrada.</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/50">
                <tr>
                  <th class="px-5 py-3 font-medium">Vencimento</th>
                  <th class="px-5 py-3 font-medium">Valor</th>
                  <th class="px-5 py-3 font-medium">Status</th>
                  <th class="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                <tr v-for="invoice in invoices" :key="invoice.paymentId">
                  <td class="px-5 py-4 text-slate-700 dark:text-slate-200">{{ formatShortDate(invoice.dueDate) }}</td>
                  <td class="px-5 py-4 font-medium text-slate-900 dark:text-white">{{ formatCurrency(invoice.value) }}</td>
                  <td class="px-5 py-4">
                    <span class="rounded-full px-2 py-1 text-xs font-semibold" :class="paymentStatusClass(invoice.status)">
                      {{ paymentStatusLabels[invoice.status] }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex gap-3">
                      <a v-if="invoice.invoiceUrl" :href="invoice.invoiceUrl" target="_blank" rel="noopener noreferrer" class="font-medium text-indigo-600 hover:underline">Fatura</a>
                      <a v-if="invoice.receiptUrl" :href="invoice.receiptUrl" target="_blank" rel="noopener noreferrer" class="font-medium text-indigo-600 hover:underline">Recibo</a>
                      <span v-if="!invoice.invoiceUrl && !invoice.receiptUrl" class="text-slate-400">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="invoiceTotalPages > 1" class="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-700">
            <button class="text-indigo-600 disabled:text-slate-300" :disabled="invoicePage === 0 || loadingInvoices" @click="loadInvoices(invoicePage - 1)">Anterior</button>
            <span class="text-slate-500">Página {{ invoicePage + 1 }} de {{ invoiceTotalPages }}</span>
            <button class="text-indigo-600 disabled:text-slate-300" :disabled="invoicePage + 1 >= invoiceTotalPages || loadingInvoices" @click="loadInvoices(invoicePage + 1)">Próxima</button>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
