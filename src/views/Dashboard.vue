<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900">Dashboard</h1>
        <p class="text-xs text-slate-400">Bem-vindo de volta, {{ authStore.currentUser?.firstName }}!</p>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Perfil -->
      <div class="bg-white border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">Perfil</h2>
          <RouterLink to="/profile" class="text-xs font-semibold text-indigo-700 hover:text-indigo-800">
            Editar
          </RouterLink>
        </div>
        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-1">Nome</p>
            <p class="text-slate-800 font-medium">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-1">Email</p>
            <p class="text-slate-800 font-medium break-all">{{ authStore.currentUser?.email }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-1">Membro desde</p>
            <p class="text-slate-800 font-medium">{{ formatDate(authStore.currentUser?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div class="bg-white border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-5">Ações rápidas</h2>
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
      <div class="bg-white border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-5">Status da conta</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 text-sm">Status</span>
            <span
              v-if="authStore.currentUser?.active"
              class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold"
            >
              Ativo
            </span>
            <span
              v-else
              class="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold"
            >
              Inativo
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500 text-sm">Último acesso</span>
            <span class="text-slate-800 text-sm font-medium">Agora</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
