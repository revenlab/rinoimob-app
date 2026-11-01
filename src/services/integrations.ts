import { apiFetch, API_BASE } from '@/lib/api'
import type {
  IntegrationAsset,
  IntegrationConnection,
  IntegrationConnectionStatus,
  IntegrationEventPage,
  GrupoOlxFeedStatus,
  IntegrationRoute,
  IntegrationRoutingOptions,
  SaveIntegrationRoute,
} from '@/types/integration'

const BASE = `${API_BASE}/integrations`

class IntegrationsService {
  listConnections(): Promise<IntegrationConnection[]> {
    return apiFetch<IntegrationConnection[]>(BASE)
  }

  routingOptions(): Promise<IntegrationRoutingOptions> {
    return apiFetch<IntegrationRoutingOptions>(`${BASE}/routing-options`)
  }

  createGrupoOlx(name: string): Promise<IntegrationConnection> {
    return apiFetch<IntegrationConnection>(`${BASE}/grupo-olx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }

  grupoOlxFeedStatus(connectionId: string): Promise<GrupoOlxFeedStatus> {
    return apiFetch<GrupoOlxFeedStatus>(`${BASE}/${connectionId}/grupo-olx/feed-status`)
  }

  startMetaOAuth(): Promise<{ authorizationUrl: string }> {
    return apiFetch<{ authorizationUrl: string }>(`${BASE}/meta/oauth/start`, { method: 'POST' })
  }

  startOlxOAuth(): Promise<{ authorizationUrl: string }> {
    return apiFetch<{ authorizationUrl: string }>(`${BASE}/grupo-olx/oauth/start`, { method: 'POST' })
  }

  reconnectOlxOAuth(connectionId: string): Promise<{ authorizationUrl: string }> {
    return apiFetch<{ authorizationUrl: string }>(`${BASE}/${connectionId}/grupo-olx/oauth/reconnect`, { method: 'POST' })
  }

  reconnectMetaOAuth(connectionId: string): Promise<{ authorizationUrl: string }> {
    return apiFetch<{ authorizationUrl: string }>(`${BASE}/${connectionId}/meta/oauth/reconnect`, { method: 'POST' })
  }

  requestMetaSync(connectionId: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${connectionId}/meta/sync`, { method: 'POST' })
  }

  listMetaPages(connectionId: string): Promise<IntegrationAsset[]> {
    return apiFetch<IntegrationAsset[]>(`${BASE}/${connectionId}/meta/pages`)
  }

  activateMetaPage(connectionId: string, page: IntegrationAsset): Promise<IntegrationConnection> {
    return apiFetch<IntegrationConnection>(`${BASE}/${connectionId}/meta/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: page.id, pageName: page.name }),
    })
  }

  listMetaForms(connectionId: string): Promise<IntegrationAsset[]> {
    return apiFetch<IntegrationAsset[]>(`${BASE}/${connectionId}/meta/forms`)
  }

  listRoutes(connectionId: string): Promise<IntegrationRoute[]> {
    return apiFetch<IntegrationRoute[]>(`${BASE}/${connectionId}/routes`)
  }

  saveRoute(connectionId: string, payload: SaveIntegrationRoute): Promise<IntegrationRoute> {
    return apiFetch<IntegrationRoute>(`${BASE}/${connectionId}/routes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  updateStatus(connectionId: string, status: IntegrationConnectionStatus): Promise<IntegrationConnection> {
    return apiFetch<IntegrationConnection>(`${BASE}/${connectionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  listEvents(page = 0): Promise<IntegrationEventPage> {
    return apiFetch<IntegrationEventPage>(`${BASE}/events?page=${page}&size=20`)
  }

  retryEvent(eventId: string): Promise<void> {
    return apiFetch<void>(`${BASE}/events/${eventId}/retry`, { method: 'POST' })
  }
}

export default new IntegrationsService()
