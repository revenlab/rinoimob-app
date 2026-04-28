<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center">
          <img
            src="/logo_rinoimob.svg"
            alt="Rinoimob"
            class="h-14 w-auto object-contain"
          />
        </div>
        <h1 class="text-4xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">Recuperar senha</h1>
        <p class="text-slate-500 dark:text-slate-400">Informe seu email para receber o link de redefinição.</p>
      </div>

      <form @submit.prevent="handleForgot" class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autofocus
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="voce@exemplo.com"
            :disabled="authStore.isLoading"
          />
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <div v-if="success" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Verifique seu email para redefinir a senha.
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Enviando...' : 'Enviar link de redefinicao' }}
        </button>
      </form>

      <div class="mt-6 text-center space-y-2">
        <RouterLink to="/login" class="block font-semibold text-indigo-700 hover:text-indigo-800">
          Voltar para login
        </RouterLink>
        <RouterLink to="/register" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-700 transition-colors">
          Criar conta
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const success = ref(false)

const handleForgot = async () => {
  success.value = false
  const result = await authStore.requestPasswordReset(email.value)
  if (result) {
    success.value = true
  }
}
</script>
