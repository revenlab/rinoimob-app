import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth'
import authService from '@/services/auth'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser = computed(() => user.value)

  // Initialize from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken) {
      accessToken.value = storedToken
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  // Register user
  const register = async (data: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.register(data)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Login user
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response: LoginResponse = await authService.login(credentials)

      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, response.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Logout user
  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // Verify email
  const verifyEmail = async (token: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.verifyEmail(token)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Email verification failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.forgotPassword(email)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to request password reset'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Reset password
  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.resetPassword({ token, password, confirmPassword })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (firstName: string, lastName: string) => {
    try {
      isLoading.value = true
      error.value = null

      if (!accessToken.value) {
        throw new Error('Not authenticated')
      }

      const updatedUser = await authService.updateProfile(accessToken.value, firstName, lastName)
      user.value = updatedUser
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      isLoading.value = true
      error.value = null

      if (!accessToken.value) {
        throw new Error('Not authenticated')
      }

      await authService.changePassword(accessToken.value, currentPassword, newPassword, confirmPassword)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change password'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    isAuthenticated,
    currentUser,
    initializeAuth,
    register,
    login,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    clearError
  }
})
