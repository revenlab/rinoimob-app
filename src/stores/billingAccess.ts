import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import billingService from '@/services/billing'
import type { BillingStatus } from '@/types/billing'
import type { BillingFeatureKey } from '@/utils/billingFeatures'

export const useBillingAccessStore = defineStore('billing-access', () => {
  const status = ref<BillingStatus | null>(null)
  const loadedTenantId = ref<string | null>(null)
  const loading = ref(false)
  let pendingLoad: Promise<BillingStatus | null> | null = null
  let pendingTenantId: string | null = null
  let loadVersion = 0

  const isLoaded = computed(() => status.value !== null && loadedTenantId.value !== null)

  async function load(tenantId: string | null, force = false): Promise<BillingStatus | null> {
    if (!tenantId) {
      reset()
      return null
    }
    if (!force && loadedTenantId.value === tenantId && status.value) {
      return status.value
    }
    if (!force && pendingLoad && pendingTenantId === tenantId) {
      return pendingLoad
    }

    const currentLoadVersion = ++loadVersion
    loading.value = true
    pendingTenantId = tenantId
    pendingLoad = billingService.getStatus()
      .then(response => {
        if (currentLoadVersion === loadVersion) {
          status.value = response
          loadedTenantId.value = tenantId
          return response
        }
        return null
      })
      .catch(() => {
        if (currentLoadVersion === loadVersion) {
          status.value = null
          loadedTenantId.value = null
        }
        return null
      })
      .finally(() => {
        if (currentLoadVersion === loadVersion) {
          loading.value = false
          pendingLoad = null
          pendingTenantId = null
        }
      })

    return pendingLoad
  }

  function canUse(feature: BillingFeatureKey): boolean {
    return status.value?.[feature] !== false
  }

  function reset() {
    loadVersion += 1
    status.value = null
    loadedTenantId.value = null
    pendingLoad = null
    pendingTenantId = null
    loading.value = false
  }

  return {
    status,
    loading,
    isLoaded,
    load,
    canUse,
    reset,
  }
})
