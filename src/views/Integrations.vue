<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import integrationsService from '@/services/integrations'
import type {
  IntegrationAsset,
  IntegrationConnection,
  IntegrationEvent,
  GrupoOlxFeedStatus,
  IntegrationRoute,
  IntegrationRoutingOptions,
} from '@/types/integration'

const route = useRoute()
const router = useRouter()
const connections = ref<IntegrationConnection[]>([])
const events = ref<IntegrationEvent[]>([])
const options = ref<IntegrationRoutingOptions>({ pipelines: [], pools: [], brokers: [], properties: [] })
const pages = ref<IntegrationAsset[]>([])
const forms = ref<IntegrationAsset[]>([])
const routes = ref<IntegrationRoute[]>([])
const grupoOlxFeed = ref<GrupoOlxFeedStatus | null>(null)
const selectedConnectionId = ref('')
const loading = ref(true)
const actionLoading = ref(false)
const error = ref('')
const success = ref('')
const olxName = ref('Grupo OLX')

const routeForm = reactive({
  externalResourceId: '',
  externalResourceName: '',
  pipelineId: '',
  assignmentMode: 'AUTO' as 'AUTO' | 'POOL' | 'BROKER',
  poolId: '',
  assignedTo: '',
  defaultPropertyId: '',
  nameField: 'full_name',
  emailField: 'email',
  phoneField: 'phone_number',
  messageField: 'message',
})

const selectedConnection = computed(() => connections.value.find(item => item.id === selectedConnectionId.value) ?? null)
const resources = computed<IntegrationAsset[]>(() => selectedConnection.value?.provider === 'META_LEAD_ADS'
  ? forms.value
  : [{ id: '*', name: 'Todos os leads do Grupo OLX', type: 'FORM' }])

const statusLabel: Record<string, string> = {
  CONNECTING: 'Conectando', ACTIVE: 'Ativa', PAUSED: 'Pausada', EXPIRED: 'Expirada', ERROR: 'Com erro',
}

const eventStatusLabel: Record<string, string> = {
  RECEIVED: 'Recebido', PROCESSING: 'Processando', PROCESSED: 'Processado', FAILED: 'Falhou',
  BLOCKED_QUOTA: 'Bloqueado pela cota', IGNORED: 'Ignorado',
}

function messageFrom(errorValue: unknown, fallback: string) {
  return errorValue instanceof Error ? errorValue.message : fallback
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [connectionList, routingOptions, eventPage] = await Promise.all([
      integrationsService.listConnections(),
      integrationsService.routingOptions(),
      integrationsService.listEvents(),
    ])
    connections.value = connectionList
    options.value = routingOptions
    events.value = eventPage.content
    const callbackConnection = typeof route.query.connectionId === 'string' ? route.query.connectionId : ''
    if (callbackConnection && connectionList.some(item => item.id === callbackConnection)) {
      selectedConnectionId.value = callbackConnection
      await router.replace({ query: {} })
    } else if (!selectedConnectionId.value && connectionList[0]) {
      selectedConnectionId.value = connectionList[0].id
    }
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível carregar as integrações.')
  } finally {
    loading.value = false
  }
}

async function startMeta() {
  actionLoading.value = true
  error.value = ''
  try {
    const response = await integrationsService.startMetaOAuth()
    window.location.assign(response.authorizationUrl)
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível iniciar a conexão com o Meta.')
    actionLoading.value = false
  }
}

async function createOlx() {
  if (!olxName.value.trim()) return
  actionLoading.value = true
  try {
    const created = await integrationsService.createGrupoOlx(olxName.value.trim())
    connections.value.push(created)
    selectedConnectionId.value = created.id
    success.value = 'Conexão criada. Copie a URL para a homologação do Grupo OLX.'
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível criar a conexão.')
  } finally {
    actionLoading.value = false
  }
}

async function loadConnectionDetails() {
  const connection = selectedConnection.value
  pages.value = []
  forms.value = []
  routes.value = []
  grupoOlxFeed.value = null
  resetRouteForm()
  if (!connection) return
  actionLoading.value = true
  try {
    routes.value = await integrationsService.listRoutes(connection.id)
    if (connection.provider === 'META_LEAD_ADS') {
      if (connection.externalAccountId) forms.value = await integrationsService.listMetaForms(connection.id)
      else pages.value = await integrationsService.listMetaPages(connection.id)
    } else {
      grupoOlxFeed.value = await integrationsService.grupoOlxFeedStatus(connection.id)
      routeForm.externalResourceId = '*'
      routeForm.externalResourceName = 'Todos os leads do Grupo OLX'
      loadExistingRoute('*')
    }
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível carregar os detalhes da conexão.')
  } finally {
    actionLoading.value = false
  }
}

async function activatePage(page: IntegrationAsset) {
  const connection = selectedConnection.value
  if (!connection) return
  actionLoading.value = true
  try {
    const updated = await integrationsService.activateMetaPage(connection.id, page)
    replaceConnection(updated)
    pages.value = []
    forms.value = await integrationsService.listMetaForms(connection.id)
    success.value = `Página ${page.name} conectada.`
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível conectar a página.')
  } finally {
    actionLoading.value = false
  }
}

function chooseResource(asset: IntegrationAsset) {
  resetRouteForm()
  routeForm.externalResourceId = asset.id
  routeForm.externalResourceName = asset.name
  loadExistingRoute(asset.id)
}

function loadExistingRoute(resourceId: string) {
  const existing = routes.value.find(item => item.externalResourceId === resourceId)
  if (!existing) {
    routeForm.pipelineId = options.value.pipelines[0]?.id ?? ''
    return
  }
  routeForm.pipelineId = existing.pipelineId
  routeForm.defaultPropertyId = existing.defaultPropertyId ?? ''
  routeForm.assignmentMode = existing.assignedTo ? 'BROKER' : existing.poolId ? 'POOL' : 'AUTO'
  routeForm.assignedTo = existing.assignedTo ?? ''
  routeForm.poolId = existing.poolId ?? ''
  routeForm.nameField = existing.fieldMapping.name ?? 'full_name'
  routeForm.emailField = existing.fieldMapping.email ?? 'email'
  routeForm.phoneField = existing.fieldMapping.phone ?? 'phone_number'
  routeForm.messageField = existing.fieldMapping.message ?? 'message'
}

async function saveRoute() {
  const connection = selectedConnection.value
  if (!connection || !routeForm.externalResourceId || !routeForm.pipelineId) {
    error.value = 'Selecione a origem e o funil.'
    return
  }
  actionLoading.value = true
  error.value = ''
  try {
    const saved = await integrationsService.saveRoute(connection.id, {
      externalResourceId: routeForm.externalResourceId,
      externalResourceName: routeForm.externalResourceName,
      pipelineId: routeForm.pipelineId,
      poolId: routeForm.assignmentMode === 'POOL' ? routeForm.poolId || undefined : undefined,
      assignedTo: routeForm.assignmentMode === 'BROKER' ? routeForm.assignedTo || undefined : undefined,
      defaultPropertyId: routeForm.defaultPropertyId || undefined,
      fieldMapping: connection.provider === 'META_LEAD_ADS' ? {
        name: routeForm.nameField,
        email: routeForm.emailField,
        phone: routeForm.phoneField,
        message: routeForm.messageField,
      } : {},
      active: true,
    })
    const index = routes.value.findIndex(item => item.externalResourceId === saved.externalResourceId)
    if (index >= 0) routes.value[index] = saved
    else routes.value.push(saved)
    success.value = 'Roteamento salvo.'
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível salvar o roteamento.')
  } finally {
    actionLoading.value = false
  }
}

async function toggleConnection() {
  const connection = selectedConnection.value
  if (!connection) return
  actionLoading.value = true
  try {
    const updated = await integrationsService.updateStatus(connection.id, connection.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')
    replaceConnection(updated)
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível alterar a conexão.')
  } finally {
    actionLoading.value = false
  }
}

async function retryEvent(event: IntegrationEvent) {
  try {
    await integrationsService.retryEvent(event.id)
    event.status = 'RECEIVED'
    event.lastError = null
  } catch (caught) {
    error.value = messageFrom(caught, 'Não foi possível reenfileirar o evento.')
  }
}

async function copyInboundUrl() {
  if (!selectedConnection.value?.inboundUrl) return
  await navigator.clipboard.writeText(selectedConnection.value.inboundUrl)
  success.value = 'URL copiada.'
}

async function copyFeedUrl() {
  if (!grupoOlxFeed.value?.feedUrl) return
  await navigator.clipboard.writeText(grupoOlxFeed.value.feedUrl)
  success.value = 'URL do feed copiada.'
}

function replaceConnection(updated: IntegrationConnection) {
  const index = connections.value.findIndex(item => item.id === updated.id)
  if (index >= 0) connections.value[index] = updated
}

function resetRouteForm() {
  routeForm.externalResourceId = ''
  routeForm.externalResourceName = ''
  routeForm.pipelineId = ''
  routeForm.assignmentMode = 'AUTO'
  routeForm.poolId = ''
  routeForm.assignedTo = ''
  routeForm.defaultPropertyId = ''
  routeForm.nameField = 'full_name'
  routeForm.emailField = 'email'
  routeForm.phoneField = 'phone_number'
  routeForm.messageField = 'message'
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('pt-BR') : 'Ainda não ocorreu'
}

watch(selectedConnectionId, () => void loadConnectionDetails())
onMounted(() => void loadAll())
</script>

<template>
  <AppLayout>
    <main class="p-6 lg:p-8 space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Captação automática</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Integrações de leads</h1>
        <p class="mt-1 text-sm text-slate-500">Conecte formulários e portais ao CRM, com roteamento e diagnóstico por origem.</p>
      </div>
      <button class="rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="actionLoading" @click="startMeta">
        Conectar com Facebook
      </button>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">Carregando integrações...</div>
    <template v-else>
      <section class="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div class="grid gap-4 md:grid-cols-2">
          <button
            v-for="connection in connections"
            :key="connection.id"
            class="rounded-2xl border bg-white p-5 text-left shadow-sm transition dark:bg-slate-800"
            :class="selectedConnectionId === connection.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-700'"
            @click="selectedConnectionId = connection.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ connection.provider === 'META_LEAD_ADS' ? 'Meta Lead Ads' : 'ZAP · Viva Real · OLX' }}</p>
                <h2 class="mt-1 font-semibold text-slate-900 dark:text-white">{{ connection.externalAccountName || connection.name }}</h2>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{{ statusLabel[connection.status] }}</span>
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div><dt class="text-slate-400">Último lead</dt><dd class="mt-1 text-slate-700 dark:text-slate-200">{{ formatDate(connection.lastReceivedAt) }}</dd></div>
              <div><dt class="text-slate-400">Pendências</dt><dd class="mt-1 text-slate-700 dark:text-slate-200">{{ connection.pendingEvents }}</dd></div>
            </dl>
            <p v-if="connection.lastError" class="mt-3 line-clamp-2 text-xs text-red-600">{{ connection.lastError }}</p>
          </button>

          <div v-if="connections.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 dark:border-slate-700 dark:bg-slate-800">
            Nenhuma conexão configurada. Conecte o Meta ou crie o endpoint do Grupo OLX.
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 class="font-semibold text-slate-900 dark:text-white">Grupo OLX</h2>
          <p class="mt-1 text-sm text-slate-500">Cria um endpoint para homologação de ZAP, Viva Real e OLX.</p>
          <input v-model="olxName" class="mt-4 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-600" placeholder="Nome da conexão">
          <button class="mt-3 w-full rounded-xl border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50 dark:text-indigo-300" :disabled="actionLoading" @click="createOlx">Criar endpoint</button>
        </div>
      </section>

      <section v-if="selectedConnection" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-semibold text-slate-900 dark:text-white">Configurar {{ selectedConnection.name }}</h2>
            <p class="text-sm text-slate-500">Defina para onde cada formulário ou portal enviará os leads.</p>
          </div>
          <button class="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" :disabled="actionLoading || selectedConnection.status === 'CONNECTING'" @click="toggleConnection">
            {{ selectedConnection.status === 'ACTIVE' ? 'Pausar' : 'Ativar' }}
          </button>
        </div>

        <div v-if="selectedConnection.inboundUrl" class="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Entrada de leads · URL para homologação</p>
          <div class="mt-2 flex gap-2">
            <code class="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-800">{{ selectedConnection.inboundUrl }}</code>
            <button class="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-indigo-600" @click="copyInboundUrl">Copiar</button>
          </div>
        </div>

        <div v-if="grupoOlxFeed" class="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-indigo-500">Publicação de imóveis · VRSync</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {{ grupoOlxFeed.publishedProperties }} de {{ grupoOlxFeed.activeProperties }} imóveis ativos serão publicados no feed.
              </p>
            </div>
            <span class="w-fit rounded-full px-2.5 py-1 text-xs font-semibold" :class="grupoOlxFeed.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'">
              {{ grupoOlxFeed.ready ? 'Pronto para homologar' : 'Requer ajustes' }}
            </span>
          </div>
          <div class="mt-3 flex gap-2">
            <code class="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-800">{{ grupoOlxFeed.feedUrl }}</code>
            <button class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white" @click="copyFeedUrl">Copiar feed</button>
          </div>
          <p class="mt-2 text-xs text-slate-500">Cadastre esta URL no Canal Pro. O Grupo OLX consulta o arquivo automaticamente duas vezes ao dia.</p>
          <ul v-if="grupoOlxFeed.warnings.length" class="mt-3 space-y-1 text-xs text-amber-800 dark:text-amber-300">
            <li v-for="warning in grupoOlxFeed.warnings" :key="warning">• {{ warning }}</li>
          </ul>
          <details v-if="Object.keys(grupoOlxFeed.skippedProperties).length" class="mt-3 text-xs text-slate-600 dark:text-slate-300">
            <summary class="cursor-pointer font-medium">Ver imóveis não publicados</summary>
            <ul class="mt-2 space-y-1">
              <li v-for="(count, reason) in grupoOlxFeed.skippedProperties" :key="reason">{{ count }} · {{ reason }}</li>
            </ul>
          </details>
        </div>

        <div v-if="pages.length" class="mt-5">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Escolha a página do Facebook</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="page in pages" :key="page.id" class="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" @click="activatePage(page)">{{ page.name }}</button>
          </div>
        </div>

        <div v-if="resources.length" class="mt-6 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Origens disponíveis</p>
            <div class="mt-2 space-y-2">
              <button v-for="resource in resources" :key="resource.id" class="w-full rounded-xl border px-3 py-2 text-left text-sm" :class="routeForm.externalResourceId === resource.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700'" @click="chooseResource(resource)">
                {{ resource.name }}
              </button>
            </div>
          </div>

          <form v-if="routeForm.externalResourceId" class="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 md:grid-cols-2" @submit.prevent="saveRoute">
            <label class="text-sm text-slate-600 dark:text-slate-300">Funil
              <select v-model="routeForm.pipelineId" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                <option value="" disabled>Selecione</option><option v-for="item in options.pipelines" :key="item.id" :value="item.id">{{ item.label }}</option>
              </select>
            </label>
            <label class="text-sm text-slate-600 dark:text-slate-300">Distribuição
              <select v-model="routeForm.assignmentMode" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                <option value="AUTO">Regras automáticas</option><option value="POOL">Bolsão específico</option><option value="BROKER">Corretor específico</option>
              </select>
            </label>
            <label v-if="routeForm.assignmentMode === 'POOL'" class="text-sm text-slate-600 dark:text-slate-300">Bolsão
              <select v-model="routeForm.poolId" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"><option value="" disabled>Selecione</option><option v-for="item in options.pools" :key="item.id" :value="item.id">{{ item.label }}</option></select>
            </label>
            <label v-if="routeForm.assignmentMode === 'BROKER'" class="text-sm text-slate-600 dark:text-slate-300">Corretor
              <select v-model="routeForm.assignedTo" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"><option value="" disabled>Selecione</option><option v-for="item in options.brokers" :key="item.id" :value="item.id">{{ item.label }}</option></select>
            </label>
            <label class="text-sm text-slate-600 dark:text-slate-300">Imóvel padrão (opcional)
              <select v-model="routeForm.defaultPropertyId" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"><option value="">Nenhum</option><option v-for="item in options.properties" :key="item.id" :value="item.id">{{ item.label }}</option></select>
            </label>

            <template v-if="selectedConnection.provider === 'META_LEAD_ADS'">
              <label class="text-sm text-slate-600 dark:text-slate-300">Campo de nome<input v-model="routeForm.nameField" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"></label>
              <label class="text-sm text-slate-600 dark:text-slate-300">Campo de e-mail<input v-model="routeForm.emailField" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"></label>
              <label class="text-sm text-slate-600 dark:text-slate-300">Campo de telefone<input v-model="routeForm.phoneField" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"></label>
              <label class="text-sm text-slate-600 dark:text-slate-300">Campo de mensagem<input v-model="routeForm.messageField" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"></label>
            </template>
            <button class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 md:col-span-2" :disabled="actionLoading">Salvar roteamento</button>
          </form>
        </div>
      </section>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="border-b border-slate-200 px-5 py-4 dark:border-slate-700"><h2 class="font-semibold text-slate-900 dark:text-white">Eventos recentes</h2><p class="text-sm text-slate-500">Acompanhamento sem exposição do payload ou das credenciais.</p></div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead class="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-900/40"><tr><th class="px-5 py-3">Recebido</th><th class="px-5 py-3">Provedor</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Resultado</th><th class="px-5 py-3"></th></tr></thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="event in events" :key="event.id"><td class="whitespace-nowrap px-5 py-3">{{ formatDate(event.receivedAt) }}</td><td class="px-5 py-3">{{ event.provider === 'META_LEAD_ADS' ? 'Meta' : 'Grupo OLX' }}</td><td class="px-5 py-3">{{ eventStatusLabel[event.status] }}</td><td class="max-w-md px-5 py-3"><RouterLink v-if="event.leadId" :to="`/leads/${event.leadId}`" class="text-indigo-600 hover:underline">Abrir lead</RouterLink><span v-else :class="event.lastError ? 'text-red-600' : 'text-slate-400'">{{ event.lastError || 'Aguardando' }}</span></td><td class="px-5 py-3"><button v-if="['FAILED', 'BLOCKED_QUOTA'].includes(event.status)" class="text-indigo-600 hover:underline" @click="retryEvent(event)">Reprocessar</button></td></tr>
              <tr v-if="events.length === 0"><td colspan="5" class="px-5 py-8 text-center text-slate-400">Nenhum evento recebido.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
    </main>
  </AppLayout>
</template>
