<template>
  <div class="space-y-2">
    <div v-for="notification in notifications" :key="notification.id" 
         class="p-4 rounded-lg backdrop-blur-lg border transition-all duration-200"
         :class="[
           'bg-opacity-30 border-opacity-30',
           {
             'bg-blue-500 border-blue-400 text-blue-50': notification.type === 'INFO',
             'bg-yellow-500 border-yellow-400 text-yellow-50': notification.type === 'WARNING',
             'bg-red-500 border-red-400 text-red-50': notification.type === 'ERROR',
             'bg-green-500 border-green-400 text-green-50': notification.type === 'SUCCESS',
             'opacity-60': notification.isRead,
           }
         ]">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="font-semibold text-sm">{{ notification.title }}</p>
          <p class="text-xs mt-1 opacity-90">{{ notification.message }}</p>
          <p class="text-xs mt-2 opacity-75">{{ formatDate(notification.createdAt) }}</p>
        </div>
        <button
          @click="onDelete(notification.id)"
          class="ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Delete notification"
        >
          ✕
        </button>
      </div>
      
      <div v-if="!notification.isRead" class="mt-3 flex gap-2">
        <button
          @click="onMarkAsRead(notification.id)"
          class="text-xs px-2 py-1 rounded bg-black bg-opacity-20 hover:bg-opacity-30 transition"
        >
          Mark as read
        </button>
        <a
          v-if="notification.actionUrl"
          :href="notification.actionUrl"
          class="text-xs px-2 py-1 rounded bg-black bg-opacity-20 hover:bg-opacity-30 transition"
        >
          View
        </a>
      </div>
    </div>

    <div v-if="notifications.length === 0" class="text-center py-8 text-gray-400">
      <p class="text-sm">No notifications</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InAppNotification } from '@/services/notification'

interface Props {
  notifications: InAppNotification[]
}

withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  markAsRead: [notificationId: string]
  delete: [notificationId: string]
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

const onMarkAsRead = (id: string) => {
  emit('markAsRead', id)
}

const onDelete = (id: string) => {
  emit('delete', id)
}
</script>
