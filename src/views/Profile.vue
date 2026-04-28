<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900">Meu perfil</h1>
        <p class="text-xs text-slate-400">Informações pessoais e segurança da conta.</p>
      </div>
    </template>

    <div class="max-w-2xl space-y-6">
      <!-- Personal info -->
      <form @submit.prevent="handleUpdateProfile" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div class="pb-1 border-b border-slate-100">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">Informações pessoais</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Nome</label>
            <input
              v-model="firstName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :disabled="profileLoading"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Sobrenome</label>
            <input
              v-model="lastName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :disabled="profileLoading"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Email (somente leitura)</label>
          <input
            :value="authStore.currentUser?.email"
            type="email"
            disabled
            class="w-full h-14 px-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed"
          />
        </div>

        <div v-if="profileError" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ profileError }}
        </div>
        <div v-if="profileSuccess" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ profileSuccess }}
        </div>

        <button
          type="submit"
          :disabled="profileLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ profileLoading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>

      <!-- Change password -->
      <form @submit.prevent="handleChangePassword" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div class="pb-1 border-b border-slate-100">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">Alterar senha</p>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Senha atual</label>
          <input
            v-model="currentPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="pwLoading"
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
            :disabled="pwLoading"
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
            :disabled="pwLoading"
          />
          <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="pwError" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ pwError }}
        </div>
        <div v-if="pwSuccess" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ pwSuccess }}
        </div>

        <button
          type="submit"
          :disabled="pwLoading || !strengthNew.isValid.value || newPassword !== confirmPassword"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ pwLoading ? 'Alterando...' : 'Alterar senha' }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import PasswordStrength from '@/components/ui/PasswordStrength.vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// --- Profile ---
const firstName = ref('')
const lastName = ref('')
const profileLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

onMounted(() => {
  if (authStore.currentUser) {
    firstName.value = authStore.currentUser.firstName
    lastName.value = authStore.currentUser.lastName
  }
})

async function handleUpdateProfile() {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''
  authStore.clearError()

  const success = await authStore.updateProfile(firstName.value, lastName.value)
  if (success) {
    profileSuccess.value = 'Perfil atualizado com sucesso!'
  } else {
    profileError.value = authStore.error ?? 'Erro ao atualizar perfil.'
  }

  profileLoading.value = false
}

// --- Change password ---
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwLoading = ref(false)
const pwSuccess = ref('')
const pwError = ref('')

const strengthNew = usePasswordStrength(newPassword)

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = 'As senhas não coincidem.'
    return
  }
  if (!strengthNew.isValid.value) {
    pwError.value = 'A nova senha não atende aos requisitos mínimos de segurança.'
    return
  }

  pwLoading.value = true
  pwError.value = ''
  pwSuccess.value = ''
  authStore.clearError()

  const success = await authStore.changePassword(currentPassword.value, newPassword.value, confirmPassword.value)
  if (success) {
    pwSuccess.value = 'Senha alterada com sucesso!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    pwError.value = authStore.error ?? 'Erro ao alterar senha.'
  }

  pwLoading.value = false
}
</script>

