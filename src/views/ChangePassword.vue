<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="max-w-2xl mx-auto px-6 py-12">
      <div class="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-white">Change Password</h1>
          <RouterLink to="/dashboard" class="text-white/60 hover:text-white text-sm">← Back</RouterLink>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              required
              class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">Confirm New Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>

          <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {{ authStore.error }}
          </div>

          <div v-if="successMessage" class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
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

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const successMessage = ref('')

const handleChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    authStore.error = 'Passwords do not match'
    return
  }

  isLoading.value = true
  authStore.clearError()
  successMessage.value = ''

  const success = await authStore.changePassword(currentPassword.value, newPassword.value, confirmPassword.value)
  if (success) {
    successMessage.value = 'Password changed successfully'
    setTimeout(() => {
      router.push({ name: 'Dashboard' })
    }, 1500)
  }

  isLoading.value = false
}
</script>
