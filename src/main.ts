import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { setLogoutHandler, resetLogoutFlag } from '@/lib/api'
import './index.css'

// Apply theme before mount to prevent flash
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initializeAuth()

// Wire the central API client so any 401/403 triggers a clean logout.
setLogoutHandler(async () => {
  try {
    await authStore.logout()
  } finally {
    // Always reset the flag, even if logout fails
    resetLogoutFlag()
  }
})

// Silently validate the stored session on startup.
// apiFetch handles logout + redirect automatically if the token is expired.
authStore.fetchMe()

app.mount('#app')
