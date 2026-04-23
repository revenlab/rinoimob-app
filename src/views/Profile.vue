<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="max-w-2xl mx-auto px-6 py-12">
      <div class="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-white">Edit Profile</h1>
          <RouterLink to="/dashboard" class="text-white/60 hover:text-white text-sm">← Back</RouterLink>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">First Name</label>
              <input
                v-model="firstName"
                type="text"
                required
                class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                :disabled="isLoading"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">Last Name</label>
              <input
                v-model="lastName"
                type="text"
                required
                class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">Email (Read-only)</label>
            <input
              :value="authStore.currentUser?.email"
              type="email"
              disabled
              class="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white/50 cursor-not-allowed"
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
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>

        <hr class="my-8 border-white/20" />

        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Danger Zone</h2>
          <RouterLink
            to="/change-password"
            class="inline-block px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-lg transition-colors"
          >
            Change Password
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
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
    successMessage.value = 'Profile updated successfully'
  }

  isLoading.value = false
}
</script>
