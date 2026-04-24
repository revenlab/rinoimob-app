import type { LoginRequest, LoginResponse, RegisterRequest, TenantRegistrationRequest, PasswordResetRequest } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const API_VERSION = '/api/v1'

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_VERSION}`
  }

  async signup(data: TenantRegistrationRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let message = 'Sign up failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let message = 'Registration failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let message = 'Login failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }

    return response.json()
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      let message = 'Email verification failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      let message = 'Password reset request failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }
  }

  async resetPassword(data: PasswordResetRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let message = 'Password reset failed'
      try {
        const error = await response.json()
        message = error.message || message
      } catch {
        // server returned non-JSON, use default message
      }
      throw new Error(message)
    }
  }

  async getProfile(token: string) {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  }

  async updateProfile(token: string, firstName: string, lastName: string) {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ firstName, lastName })
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    return response.json()
  }

  async changePassword(token: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    const response = await fetch(`${this.baseUrl}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    })

    if (!response.ok) {
      throw new Error('Failed to change password')
    }
  }
}

export default new AuthService()
