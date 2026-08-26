<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import UpgradeGate from '@/components/billing/UpgradeGate.vue'
import { isBillingFeatureKey, type BillingFeatureKey } from '@/utils/billingFeatures'

const route = useRoute()

const feature = computed<BillingFeatureKey>(() => {
  const value = Array.isArray(route.query.feature) ? route.query.feature[0] : route.query.feature
  return isBillingFeatureKey(value) ? value : 'blogEnabled'
})

const redirectPath = computed(() => {
  const value = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return typeof value === 'string' && value.startsWith('/') ? value : '/dashboard'
})
</script>

<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Upgrade necessário</h1>
        <p class="text-xs text-slate-400">Este recurso não faz parte do plano atual</p>
      </div>
    </template>

    <div class="mx-auto max-w-4xl space-y-5 py-4">
      <UpgradeGate :feature="feature" />
      <RouterLink
        :to="redirectPath"
        class="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
      >
        ← Voltar
      </RouterLink>
    </div>
  </AppLayout>
</template>
