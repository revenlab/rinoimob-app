<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
    <div class="backdrop-blur-md bg-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/30">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Rinoimob</h1>
        <p class="text-white/80">Login to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white/90 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-md"
            placeholder="you@example.com"
            :disabled="authStore.isLoading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/90 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-md"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-white/80 text-sm mb-4">
          Don't have an account?
          <RouterLink to="/register" class="text-white font-semibold hover:underline">
            Register here
          </RouterLink>
        </p>
        <RouterLink to="/forgot-password" class="text-white/60 text-sm hover:text-white transition-colors">
          Forgot your password?
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await authStore.login({ email: email.value, password: password.value })
  if (success) {
    router.push({ name: 'Dashboard' })
  }
}
</script>
