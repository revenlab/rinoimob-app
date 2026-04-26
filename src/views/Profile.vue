<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900">Editar perfil</h1>
        <p class="text-xs text-slate-400">Atualize suas informações pessoais.</p>
      </div>
    </template>

    <div class="max-w-2xl">
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
              :disabled="isLoading"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Sobrenome</label>
            <input
              v-model="lastName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :disabled="isLoading"
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

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>
        <div v-if="successMessage" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const isLoading = ref(false)
const successMessage = ref('')

onMounted(() => {
  if (authStore.currentUser) {
    firstName.value = authStore.currentUser.firstName
    lastName.value = authStore.currentUser.lastName
  }
})

const handleUpdateProfile = async () => {
  isLoading.value = true
  authStore.clearError()
  successMessage.value = ''

  const success = await authStore.updateProfile(firstName.value, lastName.value)
  if (success) {
    successMessage.value = 'Perfil atualizado com sucesso!'
  }

  isLoading.value = false
}
</script>
