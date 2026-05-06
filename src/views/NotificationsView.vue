<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <!-- Header -->
    <div class="border-b border-white border-opacity-10 backdrop-blur-xl bg-white bg-opacity-5">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">Notifications</h1>
            <p class="text-gray-400 mt-1">{{ notificationStore.stats.unreadCount }} unread</p>
          </div>
          <div class="flex gap-3">
            <button
              v-if="notificationStore.unreadCount > 0"
              @click="handleMarkAllAsRead"
              class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
            >
              Mark all as read
            </button>
            <button
              @click="refreshNotifications"
              class="px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-12">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="notificationStore.error" class="p-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200">
        {{ notificationStore.error }}
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-4">
        <NotificationList
          :notifications="notificationStore.notifications"
          @mark-as-read="handleMarkAsRead"
          @delete="handleDelete"
        />

        <!-- Empty State -->
        <div v-if="notificationStore.notifications.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-gray-400">No notifications</p>
        </div>

        <!-- Pagination -->
        <div v-if="notificationStore.totalPages > 1" class="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-white border-opacity-10">
          <button
            @click="previousPage"
            :disabled="notificationStore.currentPage === 0"
            class="px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span class="text-gray-400">
            Page {{ notificationStore.currentPage + 1 }} of {{ notificationStore.totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="notificationStore.currentPage >= notificationStore.totalPages - 1"
            class="px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { connectWebSocket, isConnected } from '@/services/websocket'
import NotificationList from '@/components/NotificationList.vue'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const isLoading = computed(() => notificationStore.isLoading)

const handleMarkAsRead = async (notificationId: string) => {
  await notificationStore.markAsRead(notificationId)
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDelete = async (notificationId: string) => {
  await notificationStore.deleteNotification(notificationId)
}

const refreshNotifications = async () => {
  await notificationStore.fetchNotifications(notificationStore.currentPage)
}

const nextPage = async () => {
  if (notificationStore.currentPage < notificationStore.totalPages - 1) {
    await notificationStore.fetchNotifications(notificationStore.currentPage + 1)
  }
}

const previousPage = async () => {
  if (notificationStore.currentPage > 0) {
    await notificationStore.fetchNotifications(notificationStore.currentPage - 1)
  }
}

onMounted(async () => {
  // Ensure WebSocket is connected
  if (!isConnected() && authStore.accessToken) {
    connectWebSocket(authStore.accessToken, () => {
      notificationStore.subscribeToNotifications()
    })
  }

  // Fetch initial notifications
  await notificationStore.fetchNotifications()
})
</script>
