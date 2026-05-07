import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InAppNotification, NotificationStats, PaginatedResponse } from '@/services/notification'
import notificationService from '@/services/notification'
import { subscribe } from '@/services/websocket'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<InAppNotification[]>([])
  const stats = ref<NotificationStats>({ unreadCount: 0, totalCount: 0 })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const totalPages = ref(0)
  const unreadCount = computed(() => stats.value.unreadCount)

  const fetchNotifications = async (page = 0) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await notificationService.getNotifications(page, 20)
      notifications.value = response.content
      currentPage.value = page
      totalPages.value = response.totalPages
      await fetchStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      stats.value = await notificationService.getNotificationStats()
    } catch (err) {
      console.error('Error fetching notification stats:', err)
    }
  }

  const fetchUnreadNotifications = async () => {
    try {
      const unread = await notificationService.getUnreadNotifications()
      notifications.value = unread
      await fetchStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch unread notifications'
      console.error('Error fetching unread notifications:', err)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
      }
      await fetchStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark notification as read'
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      notifications.value.forEach(n => {
        n.isRead = true
        n.readAt = new Date().toISOString()
      })
      await fetchStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      await fetchStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete notification'
      console.error('Error deleting notification:', err)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications()
      notifications.value = []
      stats.value = { unreadCount: 0, totalCount: 0 }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete all notifications'
      console.error('Error deleting all notifications:', err)
    }
  }

  const addNotification = (notification: InAppNotification) => {
    const exists = notifications.value.some(n => n.id === notification.id)
    if (!exists) {
      notifications.value.unshift(notification)
      stats.value.unreadCount++
      stats.value.totalCount++
    }
  }

  const subscribeToNotifications = () => {
    const authStore = useAuthStore()
    const userId = authStore.currentUser?.id

    if (!userId) {
      console.warn('Cannot subscribe to notifications: user not authenticated')
      return
    }

    // Spring routes /user/queue/notifications to the connected principal's session.
    // Principal name = userId (set in WebSocketAuthInterceptor).
    const topic = `/user/queue/notifications`
    const unsubscribe = subscribe(topic, (notification: InAppNotification) => {
      console.log('Received notification:', notification)
      addNotification(notification)
    })

    return unsubscribe
  }

  return {
    notifications,
    stats,
    isLoading,
    error,
    currentPage,
    totalPages,
    unreadCount,
    fetchNotifications,
    fetchStats,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    deleteAllNotifications,
    subscribeToNotifications,
  }
})
