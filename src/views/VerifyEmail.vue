<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center h-12 w-12 mb-4">
          <img
            src="/icon_rinoimob.svg"
            alt="Rinoimob"
            class="h-12 w-auto object-contain"
          />
        </div>
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Verificação de email</h1>
      </div>

      <div class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 text-center space-y-4">

        <!-- Carregando -->
        <template v-if="status === 'loading'">
          <div class="flex justify-center">
            <svg class="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <p class="text-slate-500">Verificando seu email...</p>
        </template>

        <!-- Sucesso -->
        <template v-else-if="status === 'success'">
          <div class="flex justify-center">
            <div class="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200">
              <svg class="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>
          <p class="text-slate-800 font-semibold text-lg">Email verificado com sucesso!</p>
          <p class="text-slate-500 text-sm">Sua conta está ativa. Você já pode acessar a plataforma.</p>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 mt-2"
          >
            Ir para o login
          </RouterLink>
        </template>

        <!-- Erro -->
        <template v-else-if="status === 'error'">
          <div class="flex justify-center">
            <div class="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-200">
              <svg class="h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
            </div>
          </div>
          <p class="text-slate-800 font-semibold text-lg">Verificação falhou</p>
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          <RouterLink
            to="/login"
            class="inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-800 mt-2"
          >
            Voltar para o login
          </RouterLink>
        </template>

        <!-- Token ausente -->
        <template v-else-if="status === 'missing'">
          <p class="text-slate-800 font-semibold">Link inválido</p>
          <p class="text-slate-500 text-sm">O token de verificação está ausente ou foi corrompido.</p>
          <RouterLink
            to="/login"
            class="inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Voltar para o login
          </RouterLink>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type Status = 'loading' | 'success' | 'error' | 'missing'

const route = useRoute()
const authStore = useAuthStore()

const status = ref<Status>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    status.value = 'missing'
    return
  }

  const success = await authStore.verifyEmail(token)

  if (success) {
    status.value = 'success'
  } else {
    status.value = 'error'
    errorMessage.value = authStore.error ?? 'Token inválido ou expirado.'
    authStore.clearError()
  }
})
</script>
