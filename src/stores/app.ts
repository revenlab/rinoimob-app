import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('dark')
  const sidebarOpen = ref(true)
  const notifications = ref<Array<{ id: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }>>([])

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function addNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const id = Date.now().toString()
    notifications.value.push({ id, message, type })
    setTimeout(() => removeNotification(id), 5000)
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    theme,
    sidebarOpen,
    notifications,
    isDark,
    toggleTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
  }
})
