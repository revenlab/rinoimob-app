<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="text-xs text-slate-400">Bem-vindo de volta, {{ authStore.currentUser?.firstName }}!</p>
      </div>
    </template>

    <!-- Métricas rápidas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <RouterLink to="/imoveis" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Imóveis</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ metrics.totalProperties }}</p>
        <p class="text-xs text-slate-400 mt-1">ativos</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Leads novos</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ metrics.newLeads }}</p>
        <p class="text-xs text-slate-400 mt-1">aguardando</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Em contato</p>
        <p class="text-2xl font-bold text-amber-500">{{ metrics.contactedLeads }}</p>
        <p class="text-xs text-slate-400 mt-1">em andamento</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Ganhos</p>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ metrics.wonLeads }}</p>
        <p class="text-xs text-slate-400 mt-1">fechamentos</p>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Perfil -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Perfil</h2>
          <RouterLink to="/profile" class="text-xs font-semibold text-indigo-700 hover:text-indigo-800">
            Editar
          </RouterLink>
        </div>
        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mb-1">Nome</p>
            <p class="text-slate-800 dark:text-slate-200 font-medium">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mb-1">Email</p>
            <p class="text-slate-800 dark:text-slate-200 font-medium break-all">{{ authStore.currentUser?.email }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mb-1">Membro desde</p>
            <p class="text-slate-800 dark:text-slate-200 font-medium">{{ formatDate(authStore.currentUser?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mb-5">Ações rápidas</h2>
        <div class="space-y-3">
          <RouterLink
            to="/profile"
            class="flex items-center justify-center w-full h-12 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-2xl font-medium text-sm shadow-[0_6px_16px_rgba(79,70,229,0.25)] hover:translate-y-[-1px] transition-all duration-200"
          >
            Editar perfil &amp; senha
          </RouterLink>
        </div>
      </div>

      <!-- Status da conta -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mb-5">Status da conta</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 dark:text-slate-400 text-sm">Status</span>
            <span
              v-if="authStore.currentUser?.active"
              class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
            >
              Ativo
            </span>
            <span
              v-else
              class="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
            >
              Inativo
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500 dark:text-slate-400 text-sm">Último acesso</span>
            <span class="text-slate-800 dark:text-slate-200 text-sm font-medium">Agora</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import leadService from '@/services/lead'
import propertyService from '@/services/property'

const authStore = useAuthStore()

const metrics = ref({ totalProperties: 0, newLeads: 0, contactedLeads: 0, wonLeads: 0 })

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const [props, newLeads, contacted, won] = await Promise.allSettled([
      propertyService.list({ status: 'ACTIVE', size: 1 }),
      leadService.list({ status: 'NEW', size: 1 }),
      leadService.list({ status: 'CONTACTED', size: 1 }),
      leadService.list({ status: 'WON', size: 1 }),
    ])
    if (props.status === 'fulfilled') metrics.value.totalProperties = props.value.totalElements
    if (newLeads.status === 'fulfilled') metrics.value.newLeads = newLeads.value.totalElements
    if (contacted.status === 'fulfilled') metrics.value.contactedLeads = contacted.value.totalElements
    if (won.status === 'fulfilled') metrics.value.wonLeads = won.value.totalElements
  } catch { /* métricas são best-effort */ }
})
</script>
