import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  const login = (username: string, password: string) => {
    // TODO: Implement login logic
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
})
