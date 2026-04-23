<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
    <div class="backdrop-blur-md bg-white/20 rounded-2xl shadow-2xl p-8 max-w-md border border-white/30 text-center">
      <h1 class="text-3xl font-bold text-white mb-4">Check Your Email</h1>
      <p class="text-white/80 mb-4">
        We've sent a verification link to your email. Please click the link to verify your account.
      </p>
      <p class="text-white/60 text-sm mb-6">
        This link will expire in 24 hours.
      </p>
      <RouterLink
        to="/login"
        class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
      >
        Back to Login
      </RouterLink>
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
