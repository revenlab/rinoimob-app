<template>
  <div class="relative">
    <button
      @click="toggleOpen"
      class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      :aria-label="`Notificações (${unreadCount} não lidas)`"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Notificações</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition"
          >
            Marcar todas
          </button>
          <button
            @click="isOpen = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto max-h-72">
        <div v-if="isLoading" class="flex justify-center py-8">
          <svg class="w-5 h-5 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div v-else-if="notifications.length === 0" class="py-8 text-center text-sm text-slate-400">
          Nenhuma notificação
        </div>
        <div v-else>
          <div
            v-for="n in notifications"
            :key="n.id"
            class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            :class="{ 'opacity-60': n.isRead }"
            @click="handleMarkAsRead(n.id)"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 shrink-0">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  :class="{
                    'bg-blue-500': n.type === 'INFO',
                    'bg-yellow-500': n.type === 'WARNING',
                    'bg-red-500': n.type === 'ERROR',
                    'bg-green-500': n.type === 'SUCCESS',
                    'opacity-0': n.isRead,
                  }"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ n.title }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ n.message }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ formatDate(n.createdAt) }}</p>
              </div>
              <button
                @click.stop="handleDelete(n.id)"
                class="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition shrink-0 mt-0.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <router-link
          to="/notifications"
          class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline block text-center"
          @click="isOpen = false"
        >
          Ver todas as notificações →
        </router-link>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-40" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
const isOpen = ref(false)

const notifications = computed(() => notificationStore.notifications.slice(0, 8))
const unreadCount = computed(() => notificationStore.unreadCount)
const isLoading = computed(() => notificationStore.isLoading)

const toggleOpen = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await notificationStore.fetchNotifications()
  }
}

const handleMarkAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDelete = async (id: string) => {
  await notificationStore.deleteNotification(id)
}

const formatDate = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  // Just fetch stats for the badge count; full list fetched when dropdown opens.
  // WS subscription is managed by AppLayout (which is always mounted).
  await notificationStore.fetchStats()
})
</script>
