<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900">Alterar senha</h1>
        <p class="text-xs text-slate-400">Escolha uma senha forte para proteger seu acesso.</p>
      </div>
    </template>

    <div class="max-w-lg">
      <form @submit.prevent="handleChangePassword" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Senha atual</label>
          <input
            v-model="currentPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Nova senha</label>
          <input
            v-model="newPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            :class="{ 'border-red-300': newPassword && !strengthNew.isValid.value }"
            placeholder="••••••••"
            :disabled="isLoading"
          />
          <PasswordStrength
            :password="newPassword"
            :score="strengthNew.score.value"
            :strength-label="strengthNew.strengthLabel.value"
            :strength-color="strengthNew.strengthColor.value"
            :checks="strengthNew.checks.value"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Confirmar nova senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="isLoading"
          />
          <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>
        <div v-if="successMessage" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading || !strengthNew.isValid.value || newPassword !== confirmPassword"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Alterando...' : 'Alterar senha' }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import PasswordStrength from '@/components/ui/PasswordStrength.vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const successMessage = ref('')

const strengthNew = usePasswordStrength(newPassword)

const handleChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    authStore.setError('As senhas não coincidem')
    return
  }

  if (!strengthNew.isValid.value) {
    authStore.setError('A nova senha não atende aos requisitos mínimos de segurança')
    return
  }

  isLoading.value = true
  authStore.clearError()
  successMessage.value = ''

  const success = await authStore.changePassword(currentPassword.value, newPassword.value, confirmPassword.value)
  if (success) {
    successMessage.value = 'Senha alterada com sucesso!'
    setTimeout(() => {
      router.push({ name: 'Dashboard' })
    }, 1500)
  }

  isLoading.value = false
}
</script>
