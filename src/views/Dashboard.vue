<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="backdrop-blur-md bg-white/5 border-b border-white/10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="text-white/60 text-sm">Welcome back, {{ authStore.currentUser?.firstName }}!</p>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- User Profile Card -->
        <div class="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 hover:border-white/30 transition-colors">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-white">Profile</h2>
            <RouterLink to="/profile" class="text-blue-400 hover:text-blue-300 text-sm">Edit</RouterLink>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-white/60 text-sm">Name</p>
              <p class="text-white font-medium">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Email</p>
              <p class="text-white font-medium break-all">{{ authStore.currentUser?.email }}</p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Member Since</p>
              <p class="text-white font-medium">{{ formatDate(authStore.currentUser?.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 hover:border-white/30 transition-colors">
          <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <RouterLink
              to="/profile"
              class="block w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-center transition-colors"
            >
              Edit Profile
            </RouterLink>
            <RouterLink
              to="/change-password"
              class="block w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-center transition-colors"
            >
              Change Password
            </RouterLink>
          </div>
        </div>

        <!-- Account Status -->
        <div class="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 hover:border-white/30 transition-colors">
          <h2 class="text-xl font-semibold text-white mb-4">Account Status</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-white/60">Status</span>
              <span v-if="authStore.currentUser?.active" class="px-3 py-1 bg-green-600/20 text-green-300 border border-green-500/30 rounded-full text-sm">
                Active
              </span>
              <span v-else class="px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded-full text-sm">
                Inactive
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-white/60">Last Login</span>
              <span class="text-white">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
