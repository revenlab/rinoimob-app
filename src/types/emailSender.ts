export interface EmailSenderConfig {
  id: string
  displayName: string
  fromEmail: string
  fromName: string | null
  smtpHost: string
  smtpPort: number
  smtpUsername: string | null
  smtpTls: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmailSenderConfigRequest {
  displayName: string
  fromEmail: string
  fromName?: string
  smtpHost: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  smtpTls?: boolean
  isDefault?: boolean
}

export interface UpdateEmailSenderConfigRequest {
  displayName: string
  fromEmail: string
  fromName?: string
  smtpHost: string
  smtpPort: number
  smtpUsername?: string
  smtpPassword?: string
  smtpTls?: boolean
  isDefault?: boolean
}
