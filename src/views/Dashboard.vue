<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="text-xs text-slate-400">Bem-vindo de volta, {{ authStore.currentUser?.firstName }}!</p>
      </div>
    </template>

    <!-- Métricas rápidas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Leads</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ metrics.total }}</p>
        <p class="text-xs text-slate-400 mt-1">total de leads</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Novos leads</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ metrics.newLeads }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ metrics.thisWeek }} esta semana</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Em contato</p>
        <p class="text-2xl font-bold text-amber-500">{{ metrics.contacted }}</p>
        <p class="text-xs text-slate-400 mt-1">em andamento</p>
      </RouterLink>
      <RouterLink to="/leads" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Ganhos</p>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ metrics.won }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ metrics.conversionRate.toFixed(0) }}% conversão</p>
      </RouterLink>
    </div>

    <!-- Tarefas pendentes widget -->
    <RouterLink to="/tarefas" class="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
      <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 text-indigo-600 dark:text-indigo-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Tarefas pendentes</p>
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ pendingTasksCount }}</p>
      </div>
      <span class="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Ver tarefas →</span>
    </RouterLink>

    <!-- Pipeline strip -->
    <RouterLink to="/leads" class="grid grid-cols-5 gap-2 mb-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-3 text-center">
        <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ metrics.newLeads }}</p>
        <p class="text-xs text-blue-500 dark:text-blue-400 font-medium mt-0.5">Novos</p>
      </div>
      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-3 text-center">
        <p class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ metrics.contacted }}</p>
        <p class="text-xs text-amber-500 dark:text-amber-400 font-medium mt-0.5">Contato</p>
      </div>
      <div class="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 rounded-xl p-3 text-center">
        <p class="text-lg font-bold text-violet-600 dark:text-violet-400">{{ metrics.qualified }}</p>
        <p class="text-xs text-violet-500 dark:text-violet-400 font-medium mt-0.5">Qualif.</p>
      </div>
      <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ metrics.won }}</p>
        <p class="text-xs text-emerald-500 dark:text-emerald-400 font-medium mt-0.5">Ganhos</p>
      </div>
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl p-3 text-center">
        <p class="text-lg font-bold text-red-500 dark:text-red-400">{{ metrics.lost }}</p>
        <p class="text-xs text-red-400 font-medium mt-0.5">Perdidos</p>
      </div>
    </RouterLink>

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
import { RouterLink } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import leadService from '@/services/lead'
import taskService from '@/services/task'

const authStore = useAuthStore()

const pendingTasksCount = ref(0)

const metrics = ref({
  total: 0,
  newLeads: 0,
  contacted: 0,
  qualified: 0,
  won: 0,
  lost: 0,
  thisWeek: 0,
  conversionRate: 0,
})

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
    const stats = await leadService.getStats()
    metrics.value = stats
  } catch { /* métricas são best-effort */ }
  try {
    const result = await taskService.list({ pending: true, size: 1 })
    pendingTasksCount.value = result.totalElements
  } catch { /* best-effort */ }
})
</script>
