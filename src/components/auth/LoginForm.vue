<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-400/40 mb-4">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 11 12 3l9 8" />
            <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Bem-vindo de volta</h1>
        <p class="text-slate-500">Acesse sua conta para gerenciar seus imoveis e leads.</p>
      </div>

      <form @submit.prevent="handleLogin" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Usuario</label>
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
              class="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="admin"
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
          {{ authStore.isLoading ? 'Entrando...' : 'Entrar na Plataforma' }}
        </button>

        <div class="pt-5 border-t border-slate-200 text-center text-sm text-slate-400">
          Acesso restrito a corretores e administradores
        </div>
      </form>

      <div class="mt-8 text-center space-y-2">
        <p class="text-slate-500 text-sm">
          Nao tem conta?
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

const handleLogin = async () => {
  const success = await authStore.login({ email: email.value, password: password.value })
  if (success) {
    const redirect = route.query.redirect as string
    if (redirect && redirect.startsWith('/')) {
      router.push(redirect)
    } else {
      router.push({ name: 'Dashboard' })
    }
  }
}
</script>
