export type IntegrationProvider = 'META_LEAD_ADS' | 'GRUPO_OLX'
export type IntegrationConnectionStatus = 'CONNECTING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ERROR'
export type IntegrationEventStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'BLOCKED_QUOTA' | 'IGNORED'

export interface IntegrationConnection {
  id: string
  provider: IntegrationProvider
  name: string
  status: IntegrationConnectionStatus
  externalAccountId: string | null
  externalAccountName: string | null
  inboundUrl: string | null
  feedUrl: string | null
  lastReceivedAt: string | null
  lastProcessedAt: string | null
  lastError: string | null
  pendingEvents: number
}

export interface GrupoOlxFeedStatus {
  feedUrl: string
  ready: boolean
  activeProperties: number
  publishedProperties: number
  skippedProperties: Record<string, number>
  warnings: string[]
}

export interface IntegrationAsset {
  id: string
  name: string
  type: 'PAGE' | 'FORM'
}

export interface IntegrationRoute {
  id: string
  connectionId: string
  externalResourceId: string
  externalResourceName: string | null
  pipelineId: string
  poolId: string | null
  assignedTo: string | null
  defaultPropertyId: string | null
  fieldMapping: Record<string, string>
  active: boolean
}

export interface SaveIntegrationRoute {
  externalResourceId: string
  externalResourceName?: string
  pipelineId: string
  poolId?: string
  assignedTo?: string
  defaultPropertyId?: string
  fieldMapping: Record<string, string>
  active: boolean
}

export interface IntegrationEvent {
  id: string
  connectionId: string
  provider: IntegrationProvider
  externalEventId: string
  eventType: string
  status: IntegrationEventStatus
  attemptCount: number
  lastError: string | null
  leadId: string | null
  receivedAt: string
  processedAt: string | null
}

export interface IntegrationOption {
  id: string
  label: string
}

export interface IntegrationRoutingOptions {
  pipelines: IntegrationOption[]
  pools: IntegrationOption[]
  brokers: IntegrationOption[]
  properties: IntegrationOption[]
}

export interface IntegrationEventPage {
  content: IntegrationEvent[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
