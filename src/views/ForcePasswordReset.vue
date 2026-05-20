<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center">
          <img src="/logo_rinoimob.svg" alt="Rinoimob" class="h-14 w-auto object-contain" />
        </div>
        <h1 class="text-3xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
          Defina uma nova senha
        </h1>
        <p class="text-slate-500 dark:text-slate-400">
          O suporte solicitou a redefinição da sua senha. Escolha uma nova senha para continuar.
        </p>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5"
      >
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Senha atual</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V8a5 5 0 0 1 10 0v3" />
              </svg>
            </span>
            <input
              v-model="currentPassword"
              type="password"
              required
              autofocus
              class="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Nova senha</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <input
              v-model="newPassword"
              type="password"
              required
              class="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :class="{ 'border-red-300 focus:ring-red-200': newPassword && !strength.isValid.value }"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>
          <PasswordStrength
            :password="newPassword"
            :score="strength.score.value"
            :strength-label="strength.strengthLabel.value"
            :strength-color="strength.strengthColor.value"
            :checks="strength.checks.value"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Confirmar nova senha</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :class="{ 'border-red-300 focus:ring-red-200': confirmPassword && newPassword !== confirmPassword }"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>
          <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="errorMessage" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading || !strength.isValid.value || newPassword !== confirmPassword"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Salvando...' : 'Definir nova senha' }}
        </button>

        <div class="pt-5 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            @click="handleLogout"
            class="w-full text-sm text-slate-400 dark:text-slate-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
          >
            Sair e entrar com outra conta
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import PasswordStrength from '@/components/ui/PasswordStrength.vue'

const authStore = useAuthStore()
const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const strength = usePasswordStrength(newPassword)

async function handleSubmit() {
  if (!strength.isValid.value) return
  if (newPassword.value !== confirmPassword.value) return

  loading.value = true
  errorMessage.value = null
  try {
    const ok = await authStore.changePassword(currentPassword.value, newPassword.value, confirmPassword.value)
    if (ok) {
      router.push({ name: 'Dashboard' })
    } else {
      errorMessage.value = authStore.error ?? 'Erro ao alterar senha'
    }
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>
