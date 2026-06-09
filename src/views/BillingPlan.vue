<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import billingService from '@/services/billing'
import { useNotification } from '@/composables/useNotification'
import type { TenantBillingPlanOption, TenantBillingPortal } from '@/types/billing'

const { showError, showSuccess } = useNotification()

const loading = ref(false)
const startingCheckoutFor = ref<string | null>(null)
const error = ref<string | null>(null)
const billing = ref<TenantBillingPortal | null>(null)

const plans = computed(() => billing.value?.availablePlans ?? [])

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

async function loadBilling() {
  loading.value = true
  error.value = null
  try {
    billing.value = await billingService.getMyBilling()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar dados de billing'
  } finally {
    loading.value = false
  }
}

async function startUpgrade(planCode: TenantBillingPlanOption['code']) {
  startingCheckoutFor.value = planCode
  try {
    const origin = window.location.origin
    const response = await billingService.startCheckout({
      planCode,
      successUrl: `${origin}/meu-plano?billing=success`,
      cancelUrl: `${origin}/meu-plano?billing=cancel`,
    })
    if (!response.checkoutUrl) {
      throw new Error('Checkout indisponível para este plano no momento')
    }
    showSuccess('Redirecionando para pagamento...')
    window.location.href = response.checkoutUrl
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
  } finally {
    startingCheckoutFor.value = null
  }
}

onMounted(loadBilling)
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
        <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Plano atual</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ billing.currentPlanName }}</p>
              <p class="text-xs text-slate-400">{{ billing.currentPlanCode }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Status</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ billing.subscriptionStatus }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Usuários</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimit(billing.maxUsers) }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-[10px] uppercase text-slate-400">Imóveis</p>
              <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ formatLimit(billing.maxProperties) }}</p>
            </div>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="plan in plans"
            :key="plan.code"
            class="rounded-2xl border bg-white dark:bg-slate-800 p-4"
            :class="isCurrentPlan(plan) ? 'border-indigo-300 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-700'"
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

            <button
              class="mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold"
              :class="isCurrentPlan(plan)
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              :disabled="isCurrentPlan(plan) || startingCheckoutFor === plan.code"
              @click="startUpgrade(plan.code)"
            >
              {{ startingCheckoutFor === plan.code ? 'Redirecionando...' : (isCurrentPlan(plan) ? 'Plano atual' : 'Fazer upgrade') }}
            </button>
          </article>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
