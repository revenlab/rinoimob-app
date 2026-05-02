import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])

export function useNotification() {
  const showToast = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration = 5000) => {
    const id = Date.now().toString()
    const toast: Toast = { id, type, message, duration }
    
    toasts.value.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const showError = (message: string, duration = 5000) => showToast(message, 'error', duration)
  const showSuccess = (message: string, duration = 5000) => showToast(message, 'success', duration)
  const showWarning = (message: string, duration = 5000) => showToast(message, 'warning', duration)
  const showInfo = (message: string, duration = 5000) => showToast(message, 'info', duration)

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeToast,
  }
}
