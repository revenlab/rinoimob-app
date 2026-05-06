import { apiFetch, API_BASE } from '@/lib/api'

export interface InAppNotification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  isRead: boolean
  readAt?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface NotificationStats {
  unreadCount: number
  totalCount: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

const notificationService = {
  async getNotifications(page = 0, pageSize = 10): Promise<PaginatedResponse<InAppNotification>> {
    return apiFetch(`${API_BASE}/notifications/in-app?page=${page}&pageSize=${pageSize}`)
  },

  async getUnreadNotifications(): Promise<InAppNotification[]> {
    return apiFetch(`${API_BASE}/notifications/in-app/unread`)
  },

  async getNotificationStats(): Promise<NotificationStats> {
    return apiFetch(`${API_BASE}/notifications/in-app/stats`)
  },

  async markAsRead(notificationId: string): Promise<InAppNotification> {
    return apiFetch(`${API_BASE}/notifications/in-app/${notificationId}/read`, {
      method: 'PATCH'
    })
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch(`${API_BASE}/notifications/in-app/read-all`, {
      method: 'PATCH'
    })
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiFetch(`${API_BASE}/notifications/in-app/${notificationId}`, {
      method: 'DELETE'
    })
  },

  async deleteAllNotifications(): Promise<void> {
    const unread = await this.getUnreadNotifications()
    await Promise.all(unread.map(n => this.deleteNotification(n.id)))
  }
}

export default notificationService
