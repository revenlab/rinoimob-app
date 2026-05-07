<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Notificações</h1>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500 dark:text-slate-400">
            {{ notificationStore.stats.unreadCount }} não lida{{ notificationStore.stats.unreadCount !== 1 ? 's' : '' }}
          </span>
          <button
            v-if="notificationStore.unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-sm px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
          >
            Marcar todas como lidas
          </button>
          <button
            @click="refreshNotifications"
            class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Atualizar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <svg class="w-6 h-6 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>

    <!-- Error -->
    <div
      v-else-if="notificationStore.error"
      class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
    >
      {{ notificationStore.error }}
    </div>

    <!-- Content -->
    <div v-else class="max-w-3xl mx-auto space-y-3">
      <!-- Empty state -->
      <div v-if="notificationStore.notifications.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p class="text-slate-600 dark:text-slate-400 font-medium">Nenhuma notificação</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Você está em dia com tudo!</p>
      </div>

      <!-- Notification cards -->
      <div
        v-for="n in notificationStore.notifications"
        :key="n.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all"
        :class="{ 'opacity-60': n.isRead }"
      >
        <div class="flex items-start gap-4">
          <!-- Unread dot -->
          <div class="mt-1.5 shrink-0">
            <span
              class="inline-block w-2 h-2 rounded-full"
              :class="{
                'bg-blue-500': n.type === 'INFO' && !n.isRead,
                'bg-yellow-500': n.type === 'WARNING' && !n.isRead,
                'bg-red-500': n.type === 'ERROR' && !n.isRead,
                'bg-green-500': n.type === 'SUCCESS' && !n.isRead,
                'bg-slate-300 dark:bg-slate-600': n.isRead,
              }"
            />
          </div>

          <!-- Body -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ n.title }}</p>
              <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">{{ formatDate(n.createdAt) }}</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ n.message }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="!n.isRead"
              @click="handleMarkAsRead(n.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
              title="Marcar como lida"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click="handleDelete(n.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
              title="Excluir"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="notificationStore.totalPages > 1" class="flex items-center justify-center gap-4 pt-4">
        <button
          @click="previousPage"
          :disabled="notificationStore.currentPage === 0"
          class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Anterior
        </button>
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ notificationStore.currentPage + 1 }} / {{ notificationStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="notificationStore.currentPage >= notificationStore.totalPages - 1"
          class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Próxima →
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import AppLayout from '@/layouts/AppLayout.vue'

const notificationStore = useNotificationStore()

const isLoading = computed(() => notificationStore.isLoading)

const handleMarkAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDelete = async (id: string) => {
  await notificationStore.deleteNotification(id)
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
  await notificationStore.fetchNotifications()
})
</script>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <svg class="w-6 h-6 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>

    <!-- Error -->
    <div
      v-else-if="notificationStore.error"
      class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
    >
      {{ notificationStore.error }}
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <!-- Empty state -->
      <div v-if="notificationStore.notifications.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p class="text-slate-600 dark:text-slate-400 font-medium">Nenhuma notificação</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Você está em dia com tudo!</p>
      </div>

      <!-- Notification cards -->
      <div
        v-for="n in notificationStore.notifications"
        :key="n.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all"
        :class="{ 'opacity-60': n.isRead }"
      >
        <div class="flex items-start gap-4">
          <!-- Type indicator -->
          <div class="mt-1 shrink-0">
            <span
              class="inline-block w-2.5 h-2.5 rounded-full"
              :class="{
                'bg-blue-500': n.type === 'INFO',
                'bg-yellow-500': n.type === 'WARNING',
                'bg-red-500': n.type === 'ERROR',
                'bg-green-500': n.type === 'SUCCESS',
                'opacity-0': n.isRead,
              }"
            />
          </div>

          <!-- Body -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ n.title }}</p>
              <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">{{ formatDate(n.createdAt) }}</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ n.message }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="!n.isRead"
              @click="handleMarkAsRead(n.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
              title="Marcar como lida"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click="handleDelete(n.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
              title="Excluir"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="notificationStore.totalPages > 1" class="flex items-center justify-center gap-4 pt-4">
        <button
          @click="previousPage"
          :disabled="notificationStore.currentPage === 0"
          class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Anterior
        </button>
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ notificationStore.currentPage + 1 }} / {{ notificationStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="notificationStore.currentPage >= notificationStore.totalPages - 1"
          class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Próxima →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const isLoading = computed(() => notificationStore.isLoading)

const handleMarkAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDelete = async (id: string) => {
  await notificationStore.deleteNotification(id)
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
  await notificationStore.fetchNotifications()
})
</script>
