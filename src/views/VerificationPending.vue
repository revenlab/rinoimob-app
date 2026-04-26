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
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Verifique seu email</h1>
        <p class="text-slate-500">Enviamos um link de verificação para o seu email.</p>
      </div>

      <div class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 text-center space-y-4">
        <p class="text-slate-600">
          Clique no link enviado para ativar sua conta. O link expira em <span class="font-semibold text-slate-800">24 horas</span>.
        </p>
        <p class="text-slate-400 text-sm">
          Não recebeu? Verifique sua pasta de spam.
        </p>
      </div>

      <div class="mt-8 text-center">
        <RouterLink to="/login" class="font-semibold text-indigo-700 hover:text-indigo-800 text-sm">
          Voltar para o login
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.clearError()
})
</script>
