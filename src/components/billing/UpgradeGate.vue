<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BILLING_FEATURES, type BillingFeatureKey } from '@/utils/billingFeatures'

const props = defineProps<{
  feature: BillingFeatureKey
}>()

const authStore = useAuthStore()
const featureDefinition = computed(() => BILLING_FEATURES[props.feature])
const canManageBilling = computed(() =>
  ['TENANT_OWNER', 'TENANT_ADMIN'].includes(authStore.currentUser?.systemRole ?? ''),
)
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-slate-800/90 sm:p-8">
    <div class="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-600/20" />
    <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex max-w-2xl gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m9-9H3m15.75-5.25L12 3 5.25 6.75M18.75 17.25 12 21l-6.75-3.75" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Recurso do plano {{ featureDefinition.requiredPlanName }}
          </p>
          <h2 class="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Desbloqueie {{ featureDefinition.label }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ featureDefinition.description }}
          </p>
          <p v-if="!canManageBilling" class="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
            Peça a um administrador do workspace para alterar o plano.
          </p>
        </div>
      </div>

      <RouterLink
        v-if="canManageBilling"
        :to="{
          path: '/meu-plano',
          query: { upgrade: featureDefinition.requiredPlanCode, feature: featureDefinition.key },
        }"
        class="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
      >
        Ver upgrade para {{ featureDefinition.requiredPlanName }}
      </RouterLink>
    </div>
  </section>
</template>
