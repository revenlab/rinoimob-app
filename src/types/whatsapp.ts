export interface WhatsappInstance {
  id: string
  instanceName: string
  displayName: string
  phoneNumber: string | null
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
  createdAt: string
}

export interface WhatsappMessage {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  content: string
  status: string
  instanceId: string
  instanceDisplayName: string | null
  sentByUserId: string | null
  sentByUserName: string | null
  createdAt: string
}

export interface CreateInstanceRequest {
  displayName: string
  phoneNumber: string
}

export interface SendMessageRequest {
  instanceId: string
  text: string
}

export interface QrCodeResponse {
  pairingCode: string | null
  code: string | null
  status: string
}
