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
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Nova senha</h1>
        <p class="text-slate-500">Defina uma senha forte para proteger seu acesso.</p>
      </div>

      <form @submit.prevent="handleReset" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Nova senha</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Confirmar senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Redefinindo...' : 'Redefinir senha' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <RouterLink to="/login" class="text-sm text-slate-500 hover:text-indigo-700 transition-colors">
          Voltar para login
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

const password = ref('')
const confirmPassword = ref('')
const token = ref(route.query.token as string)

const handleReset = async () => {
  if (!token.value) {
    authStore.setError('Invalid reset token')
    return
  }

  if (password.value !== confirmPassword.value) {
    authStore.setError('Passwords do not match')
    return
  }

  const success = await authStore.resetPassword(token.value, password.value, confirmPassword.value)
  if (success) {
    router.push({ name: 'Login' })
  }
}
</script>
