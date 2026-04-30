import type { User, LoginRequest, LoginResponse, RegisterRequest, TenantRegistrationRequest, PasswordResetRequest, ForgotPasswordRequest, IdentifyRequest, IdentifyResponse, SelectTenantRequest, MeResponse } from '@/types/auth'
import { apiFetch, API_BASE } from '@/lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const API_VERSION = '/api/v1'

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_VERSION}`
  }

  /** Unauthenticated POST (login, signup, etc.) */
  private async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
    if (!response.ok) {
      let message = 'Request failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch { /* non-JSON response */ }
      throw new Error(message)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : undefined as T
  }

  async signup(data: TenantRegistrationRequest): Promise<void> {
    return this.post('/auth/signup', data)
  }

  async register(data: RegisterRequest): Promise<void> {
    return this.post('/auth/register', data)
  }

  async identify(data: IdentifyRequest): Promise<IdentifyResponse> {
    return this.post('/auth/identify', data)
  }

  async selectTenant(data: SelectTenantRequest): Promise<LoginResponse> {
    return this.post('/auth/select-tenant', data)
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post('/auth/login', data)
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST'
    })
    if (!response.ok) {
      let message = 'Email verification failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch { /* non-JSON */ }
      throw new Error(message)
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return this.post('/auth/forgot-password', data)
  }

  async resetPassword(data: PasswordResetRequest): Promise<void> {
    return this.post('/auth/reset-password', data)
  }

  /** Returns the current authenticated user + tenant info. Triggers logout on 401/403. */
  async me(): Promise<MeResponse> {
    return apiFetch<MeResponse>(`${API_BASE}/auth/me`)
  }

  async getProfile(): Promise<User> {
    return apiFetch<User>(`${API_BASE}/users/profile`)
  }

  async updateProfile(firstName: string, lastName: string): Promise<User> {
    return apiFetch<User>(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName }),
    })
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    return apiFetch<void>(`${API_BASE}/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  }

  async logout(): Promise<void> {
    return apiFetch<void>(`${API_BASE}/auth/logout`, { method: 'POST' })
  }
}

export default new AuthService()

