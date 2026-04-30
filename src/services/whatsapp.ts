import type { WhatsappInstance, WhatsappMessage, CreateInstanceRequest, SendMessageRequest, QrCodeResponse } from '@/types/whatsapp'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/whatsapp`

class WhatsappService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    return apiFetch<T>(url, options)
  }

  async listInstances(): Promise<WhatsappInstance[]> {
    return this.request<WhatsappInstance[]>(`${BASE}/instances`)
  }

  async createInstance(data: CreateInstanceRequest): Promise<WhatsappInstance> {
    return this.request<WhatsappInstance>(`${BASE}/instances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async getQrCode(instanceId: string): Promise<QrCodeResponse> {
    return this.request<QrCodeResponse>(`${BASE}/instances/${instanceId}/qrcode`)
  }

  async getInstanceStatus(instanceId: string): Promise<WhatsappInstance> {
    return this.request<WhatsappInstance>(`${BASE}/instances/${instanceId}/status`)
  }

  async deleteInstance(instanceId: string): Promise<void> {
    return this.request<void>(`${BASE}/instances/${instanceId}`, { method: 'DELETE' })
  }

  async getMessages(leadId: string): Promise<WhatsappMessage[]> {
    return this.request<WhatsappMessage[]>(`${BASE}/leads/${leadId}/messages`)
  }

  async sendMessage(leadId: string, data: SendMessageRequest): Promise<WhatsappMessage> {
    return this.request<WhatsappMessage>(`${BASE}/leads/${leadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }
}

export default new WhatsappService()
