import router from '@/router'
import { useNotification } from '@/composables/useNotification'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const API_BASE = `${API_BASE_URL}/api/v1`

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly reason?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Injected by main.ts after Pinia is ready — avoids circular dependency.
let _logoutHandler: (() => void) | null = null
let _isLoggingOut = false

export function setLogoutHandler(handler: () => void): void {
  _logoutHandler = handler
}

export function resetLogoutFlag(): void {
  _isLoggingOut = false
}

/**
 * Central fetch wrapper used by all authenticated API calls.
 * - Automatically attaches the Bearer token from localStorage.
 * - On 401: triggers logout and redirects to /login (prevents infinite recursion).
 * - On 403: includes X-Reason header in error for better UX.
 */
export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined ?? {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    // Prevent infinite logout loop — only call handler once
    if (!_isLoggingOut && _logoutHandler) {
      _isLoggingOut = true
      _logoutHandler()
    }
    // Always redirect to login, even if logout handler was skipped
    router.push({ name: 'Login' }).catch(() => {})
    throw new ApiError(response.status, 'Sessão expirada. Faça login novamente.')
  }

  if (response.status === 403) {
    const reason = response.headers.get('X-Reason') || 'Acesso negado'
    useNotification().showError(reason)
    throw new ApiError(response.status, reason, reason)
  }

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const err = await response.json()
      message = err.message || message
    } catch { /* non-JSON response */ }
    throw new ApiError(response.status, message)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
