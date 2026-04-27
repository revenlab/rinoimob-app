import type { User, LoginRequest, LoginResponse, RegisterRequest, TenantRegistrationRequest, PasswordResetRequest, ForgotPasswordRequest, IdentifyRequest, IdentifyResponse, SelectTenantRequest } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const API_VERSION = '/api/v1'

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_VERSION}`
  }

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

  private async put<T>(path: string, body: unknown, token: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      let message = 'Request failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch { /* non-JSON response */ }
      throw new Error(message)
    }
    return response.json()
  }

  private async get<T>(path: string, token: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Request failed')
    return response.json()
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

  async getProfile(token: string) {
    return this.get('/users/profile', token)
  }

  async updateProfile(token: string, firstName: string, lastName: string): Promise<User> {
    return this.put<User>('/users/profile', { firstName, lastName }, token)
  }

  async changePassword(token: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.post('/users/change-password', { currentPassword, newPassword, confirmPassword }, token)
  }
}

export default new AuthService()

