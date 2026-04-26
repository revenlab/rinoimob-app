<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center">
          <img src="/logo_rinoimob.svg" alt="Rinoimob" class="h-14 w-auto object-contain" />
        </div>
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">
          {{ step === 'credentials' ? 'Bem-vindo de volta' : 'Selecione o workspace' }}
        </h1>
        <p class="text-slate-500">
          {{ step === 'credentials'
            ? 'Acesse sua conta para gerenciar seus imóveis e leads.'
            : 'Escolha o workspace que deseja acessar.' }}
        </p>
      </div>

      <!-- Step 1: Email + Password -->
      <form
        v-if="step === 'credentials'"
        @submit.prevent="handleIdentify"
        class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5"
      >
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              v-model="email"
              type="email"
              required
              autofocus
              class="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="voce@exemplo.com"
              :disabled="authStore.isLoading"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Senha</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V8a5 5 0 0 1 10 0v3" />
              </svg>
            </span>
            <input
              v-model="password"
              type="password"
              required
              class="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="••••••••"
              :disabled="authStore.isLoading"
            />
          </div>
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Verificando...' : 'Continuar' }}
        </button>

        <div class="pt-5 border-t border-slate-200 text-center text-sm text-slate-400">
          Acesso restrito a corretores e administradores
        </div>
      </form>

      <!-- Step 2: Workspace selector -->
      <div
        v-else
        class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-3"
      >
        <button
          v-for="tenant in authStore.availableTenants"
          :key="tenant.id"
          type="button"
          :disabled="authStore.isLoading"
          @click="handleSelectWorkspace(tenant.id)"
          class="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50 transition-all duration-150 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg">
            {{ tenant.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{{ tenant.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ tenant.subdomain }}.rinoimob.com</p>
          </div>
          <svg class="h-5 w-5 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="button"
          class="w-full pt-3 text-sm text-slate-400 hover:text-indigo-700 transition-colors"
          @click="backToCredentials"
        >
          ← Usar outra conta
        </button>
      </div>

      <div class="mt-8 text-center space-y-2">
        <p class="text-slate-500 text-sm">
          Não tem conta?
          <RouterLink to="/register" class="font-semibold text-indigo-700 hover:text-indigo-800">
            Criar conta
          </RouterLink>
        </p>
        <RouterLink to="/forgot-password" class="text-sm text-slate-500 hover:text-indigo-700 transition-colors">
          Esqueceu sua senha?
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const step = ref<'credentials' | 'workspace'>('credentials')

const handleIdentify = async () => {
  authStore.clearError()
  const ok = await authStore.identify(email.value, password.value)
  if (!ok) return

  if (authStore.availableTenants.length === 1) {
    // Auto-select when there is only one workspace.
    await handleSelectWorkspace(authStore.availableTenants[0].id)
  } else {
    step.value = 'workspace'
  }
}

const handleSelectWorkspace = async (tenantId: string) => {
  const ok = await authStore.selectWorkspace(tenantId)
  if (ok) {
    const redirect = route.query.redirect as string
    router.push(redirect?.startsWith('/') ? redirect : { name: 'Dashboard' })
  }
}

const backToCredentials = () => {
  authStore.clearError()
  step.value = 'credentials'
}
</script>

