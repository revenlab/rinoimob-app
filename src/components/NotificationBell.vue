<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white hover:bg-opacity-10"
      :aria-label="`Notifications (${unreadCount})`"
    >
      <!-- Bell Icon -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-500 rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 max-h-96 rounded-lg shadow-xl backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 z-50 overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
        <h3 class="font-semibold text-white">Notifications</h3>
        <div class="flex gap-2">
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs px-2 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition"
            title="Mark all as read"
          >
            Mark all
          </button>
          <button
            @click="isOpen = false"
            class="text-white opacity-50 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto flex-1 p-4">
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
        <NotificationList
          v-else
          :notifications="notifications"
          @mark-as-read="handleMarkAsRead"
          @delete="handleDelete"
        />
      </div>

      <!-- Footer with View All -->
      <div class="p-4 border-t border-white border-opacity-20">
        <router-link
          to="/notifications"
          class="text-sm text-center block py-2 px-4 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition"
        >
          View all notifications
        </router-link>
      </div>
    </div>

    <!-- Close dropdown when clicking outside -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { connectWebSocket, isConnected } from '@/services/websocket'
import NotificationList from './NotificationList.vue'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const isOpen = ref(false)

const notifications = computed(() => notificationStore.notifications.slice(0, 5))
const unreadCount = computed(() => notificationStore.unreadCount)
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

onUnmounted(() => {
  // Keep WebSocket connection alive across component lifecycle
})
</script>
