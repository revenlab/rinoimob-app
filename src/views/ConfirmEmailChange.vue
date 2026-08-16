<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
    <section class="w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-8 text-center shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <template v-if="loading">
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Confirmando alteração</h1>
        <p class="mt-3 text-sm text-slate-500">Aguarde um instante.</p>
      </template>
      <template v-else-if="success">
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">E-mail alterado</h1>
        <p class="mt-3 text-sm text-slate-500">Entre novamente usando seu novo endereço de e-mail.</p>
        <RouterLink to="/login" class="mt-6 inline-flex rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">Ir para login</RouterLink>
      </template>
      <template v-else>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Não foi possível alterar o e-mail</h1>
        <p class="mt-3 text-sm text-red-600">{{ error }}</p>
        <RouterLink to="/login" class="mt-6 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">Voltar ao login</RouterLink>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    error.value = 'O link de confirmação é inválido.'
    loading.value = false
    return
  }
  success.value = await authStore.confirmEmailChange(token)
  if (!success.value) error.value = authStore.error ?? 'O link expirou ou já foi utilizado.'
  loading.value = false
})
</script>
