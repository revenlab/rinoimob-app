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
        <h1 class="text-4xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">Nova senha</h1>
        <p class="text-slate-500 dark:text-slate-400">Defina uma senha forte para proteger seu acesso.</p>
      </div>

      <form @submit.prevent="handleReset" class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Nova senha</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
          <PasswordStrength
            :password="password"
            :score="strength.score.value"
            :strength-label="strength.strengthLabel.value"
            :strength-color="strength.strengthColor.value"
            :checks="strength.checks.value"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Confirmar senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
          <p v-if="confirmPassword && password !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading || !strength.isValid.value || password !== confirmPassword"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Redefinindo...' : 'Redefinir senha' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <RouterLink to="/login" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-700 transition-colors">
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
import PasswordStrength from '@/components/ui/PasswordStrength.vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const token = ref(route.query.token as string)

const strength = usePasswordStrength(password)

const handleReset = async () => {
  if (!token.value) {
    authStore.setError('Token de redefinição inválido')
    return
  }

  if (!strength.isValid.value) {
    authStore.setError('A senha não atende aos requisitos mínimos de segurança')
    return
  }

  if (password.value !== confirmPassword.value) {
    authStore.setError('As senhas não coincidem')
    return
  }

  const success = await authStore.resetPassword(token.value, password.value, confirmPassword.value)
  if (success) {
    router.push({ name: 'Login' })
  }
}
</script>
