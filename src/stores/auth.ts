import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, TenantInfo, LoginRequest, RegisterRequest, TenantRegistrationRequest, LoginResponse } from '@/types/auth'
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

  // Workspace-selector state
  const availableTenants = ref<TenantInfo[]>([])
  const preAuthToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser = computed(() => user.value)
  const hasPendingWorkspaceSelection = computed(() => preAuthToken.value !== null && availableTenants.value.length > 0)

  const initializeAuth = () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken) accessToken.value = storedToken
    if (storedRefreshToken) refreshToken.value = storedRefreshToken
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  const signup = async (data: TenantRegistrationRequest) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.signup(data)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Cadastro falhou'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.register(data)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registro falhou'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 1: validate credentials and load workspace list.
   * Returns true if workspaces were loaded (even just one).
   */
  const identify = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await authService.identify({ email, password })
      preAuthToken.value = response.preAuthToken
      availableTenants.value = response.tenants
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Credenciais inválidas'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 2: select a workspace and obtain a full JWT.
   */
  const selectWorkspace = async (tenantId: string) => {
    if (!preAuthToken.value) {
      error.value = 'Sessão expirada. Faça login novamente.'
      return false
    }
    try {
      isLoading.value = true
      error.value = null
      const response: LoginResponse = await authService.selectTenant({
        preAuthToken: preAuthToken.value,
        tenantId
      })
      _applyLoginResponse(response)
      preAuthToken.value = null
      availableTenants.value = []
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Falha ao entrar no workspace'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response: LoginResponse = await authService.login(credentials)
      _applyLoginResponse(response)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login falhou'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    error.value = null
    preAuthToken.value = null
    availableTenants.value = []
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const verifyEmail = async (token: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.verifyEmail(token)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Verificação de email falhou'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.forgotPassword({ email })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Falha ao solicitar redefinição de senha'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      isLoading.value = true
      error.value = null
      await authService.resetPassword({ token, password, confirmPassword })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Redefinição de senha falhou'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (firstName: string, lastName: string) => {
    try {
      isLoading.value = true
      error.value = null
      if (!accessToken.value) throw new Error('Não autenticado')
      const updatedUser = await authService.updateProfile(accessToken.value, firstName, lastName)
      user.value = updatedUser
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Falha ao atualizar perfil'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      isLoading.value = true
      error.value = null
      if (!accessToken.value) throw new Error('Não autenticado')
      await authService.changePassword(accessToken.value, currentPassword, newPassword, confirmPassword)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Falha ao alterar senha'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => { error.value = null }
  const setError = (message: string | null) => { error.value = message }

  function _applyLoginResponse(response: LoginResponse) {
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
    user.value = response.user
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    availableTenants,
    preAuthToken,
    isAuthenticated,
    currentUser,
    hasPendingWorkspaceSelection,
    initializeAuth,
    signup,
    register,
    identify,
    selectWorkspace,
    login,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    clearError,
    setError
  }
})
