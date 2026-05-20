import { apiFetch, API_BASE } from '@/lib/api'
import type {
  EmailSenderConfig,
  CreateEmailSenderConfigRequest,
  UpdateEmailSenderConfigRequest,
} from '@/types/emailSender'

const BASE = `${API_BASE}/email-sender-configs`

class EmailSenderService {
  async list(): Promise<EmailSenderConfig[]> {
    return apiFetch<EmailSenderConfig[]>(BASE)
  }

  async getById(id: string): Promise<EmailSenderConfig> {
    return apiFetch<EmailSenderConfig>(`${BASE}/${id}`)
  }

  async create(data: CreateEmailSenderConfigRequest): Promise<EmailSenderConfig> {
    return apiFetch<EmailSenderConfig>(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateEmailSenderConfigRequest): Promise<EmailSenderConfig> {
    return apiFetch<EmailSenderConfig>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' })
  }
}

export default new EmailSenderService()
export type { EmailSenderConfig, CreateEmailSenderConfigRequest, UpdateEmailSenderConfigRequest }
