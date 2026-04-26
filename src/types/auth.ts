export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  active: boolean
  createdAt: string
}

export interface TenantInfo {
  id: string
  name: string
  subdomain: string
}

export interface IdentifyRequest {
  email: string
  password: string
}

export interface IdentifyResponse {
  preAuthToken: string
  tenants: TenantInfo[]
}

export interface SelectTenantRequest {
  preAuthToken: string
  tenantId: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface TenantRegistrationRequest {
  tenantName: string
  subdomain: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface PasswordResetRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthError {
  message: string
  field?: string
}
