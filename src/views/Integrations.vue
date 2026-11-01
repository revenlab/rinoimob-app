<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import integrationsService from '@/services/integrations'
import type {
    GrupoOlxFeedStatus,
    IntegrationAsset,
    IntegrationConnection,
    IntegrationEvent,
    IntegrationProvider,
    IntegrationRoute,
    IntegrationRoutingOptions,
} from '@/types/integration'

interface ProviderDefinition {
    provider: IntegrationProvider
    name: string
    eyebrow: string
    description: string
    logo: string
    logoAlt: string
    logoClass: string
    accentClass: string
}

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
const openProvider = ref<IntegrationProvider | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref('')
const success = ref('')
const olxName = ref('Grupo OLX')

const providerCatalog: ProviderDefinition[] = [
    {
        provider: 'META_LEAD_ADS',
        name: 'Facebook e Instagram',
        eyebrow: 'Meta Lead Ads',
        description: 'Receba leads dos formulários das páginas conectadas e distribua cada origem no funil correto.',
        logo: '/integrations/meta.svg',
        logoAlt: 'Meta',
        logoClass: 'bg-white ring-blue-100 dark:ring-blue-900/60',
        accentClass: 'from-blue-500/15 to-indigo-500/5',
    },
    {
        provider: 'GRUPO_OLX',
        name: 'Grupo OLX',
        eyebrow: 'ZAP · Viva Real · OLX',
        description: 'Homologue entradas de leads e publique o inventário de imóveis com um feed VRSync por conexão.',
        logo: '/integrations/grupo-olx.svg',
        logoAlt: 'Grupo OLX',
        logoClass: 'bg-white ring-violet-100 dark:ring-violet-900/60',
        accentClass: 'from-violet-500/15 to-fuchsia-500/5',
    },
]

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
const selectedProvider = computed(() => providerCatalog.find(item => item.provider === openProvider.value) ?? null)
const modalConnections = computed(() => openProvider.value ? connectionsFor(openProvider.value) : [])
const connectionEvents = computed(() => events.value.filter(item => item.connectionId === selectedConnectionId.value))
const resources = computed<IntegrationAsset[]>(() => selectedConnection.value?.provider === 'META_LEAD_ADS'
    ? forms.value
    : [{ id: '*', name: 'Todos os leads do Grupo OLX', type: 'FORM' }])

const statusLabel: Record<string, string> = {
    CONNECTING: 'Configuração pendente',
    ACTIVE: 'Ativa',
    PAUSED: 'Pausada',
    EXPIRED: 'Expirada',
    ERROR: 'Com erro',
}

const eventStatusLabel: Record<string, string> = {
    RECEIVED: 'Recebido',
    PROCESSING: 'Processando',
    PROCESSED: 'Processado',
    FAILED: 'Falhou',
    BLOCKED_QUOTA: 'Bloqueado pela cota',
    IGNORED: 'Ignorado',
}

function connectionsFor(provider: IntegrationProvider) {
    return connections.value.filter(item => item.provider === provider)
}

function activeConnections(provider: IntegrationProvider) {
    return connectionsFor(provider).filter(item => item.status === 'ACTIVE').length
}

function pendingEvents(provider: IntegrationProvider) {
    return connectionsFor(provider).reduce((total, item) => total + item.pendingEvents, 0)
}

function messageFrom(errorValue: unknown, fallback: string) {
    return errorValue instanceof Error ? errorValue.message : fallback
}

function showProvider(provider: IntegrationProvider, connectionId?: string) {
    openProvider.value = provider
    const providerConnections = connectionsFor(provider)
    selectedConnectionId.value = connectionId && providerConnections.some(item => item.id === connectionId)
        ? connectionId
        : providerConnections[0]?.id ?? ''
}

function closeProvider() {
    openProvider.value = null
    selectedConnectionId.value = ''
    pages.value = []
    forms.value = []
    routes.value = []
    grupoOlxFeed.value = null
    resetRouteForm()
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

        if (route.query.meta === 'error') {
            showProvider('META_LEAD_ADS')
            await loadConnectionDetails()
            error.value = 'Esta tentativa de autorização expirou ou já foi utilizada. Clique em Reconectar com a Meta para iniciar uma nova tentativa.'
            await router.replace({ query: {} })
        }
        const callbackConnection = typeof route.query.connectionId === 'string' ? route.query.connectionId : ''
        if (route.query.olx === 'error') {
            showProvider('GRUPO_OLX')
            await loadConnectionDetails()
            error.value = 'A autorização da OLX expirou ou já foi utilizada. Inicie uma nova conexão com a OLX.'
            await router.replace({ query: {} })
        }
        const callbackItem = connectionList.find(item => item.id === callbackConnection)
        if (callbackItem) {
            showProvider(callbackItem.provider, callbackItem.id)
            await nextTick()
            if (callbackItem.lastError) error.value = callbackItem.lastError
            else success.value = callbackItem.provider === 'GRUPO_OLX'
                ? 'OLX autorizada e recebimento de leads configurado. Configure o roteamento abaixo.'
                : 'Autorização recebida. Selecione a página para concluir a conexão.'
            await router.replace({ query: {} })
        }
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível carregar as integrações.')
    } finally {
        loading.value = false
    }
}

async function startMeta() {
    await authorizeMeta()
}

async function reconnectMeta() {
    if (selectedConnection.value) await authorizeMeta(selectedConnection.value.id)
}

async function recoverMetaLeads() {
    const connection = selectedConnection.value
    if (!connection) return
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        await integrationsService.requestMetaSync(connection.id)
        await loadConnectionDetails()
        success.value = 'Busca de leads pendentes solicitada. Os formulários serão conferidos em instantes; atualize o status para acompanhar.'
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível solicitar a recuperação dos leads.')
    } finally {
        actionLoading.value = false
    }
}

async function authorizeMeta(connectionId?: string) {
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        const response = connectionId
            ? await integrationsService.reconnectMetaOAuth(connectionId)
            : await integrationsService.startMetaOAuth()
        window.location.assign(response.authorizationUrl)
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível iniciar a conexão com o Meta.')
        actionLoading.value = false
    }
}

async function createOlx() {
    if (!olxName.value.trim()) return
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        const created = await integrationsService.createGrupoOlx(olxName.value.trim())
        connections.value.push(created)
        selectedConnectionId.value = created.id
        olxName.value = 'Grupo OLX'
        success.value = 'Conexão criada. Copie as URLs para iniciar a homologação.'
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível criar a conexão.')
    } finally {
        actionLoading.value = false
    }
}

async function authorizeOlx(connectionId?: string) {
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        const response = connectionId
            ? await integrationsService.reconnectOlxOAuth(connectionId)
            : await integrationsService.startOlxOAuth()
        window.location.assign(response.authorizationUrl)
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível iniciar a autorização da OLX.')
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
    if (!connection || !openProvider.value) return

    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        routes.value = await integrationsService.listRoutes(connection.id)
        if (connection.provider === 'META_LEAD_ADS') {
            if (!connection.metaAuthorized) return
            if (connection.externalAccountId && ['ACTIVE', 'PAUSED'].includes(connection.status)) {
                forms.value = await integrationsService.listMetaForms(connection.id)
            } else {
                pages.value = (await integrationsService.listMetaPages(connection.id))
                    .filter(page => !connection.externalAccountId || page.id === connection.externalAccountId)
            }
        } else {
            if (!connection.olxOAuth) grupoOlxFeed.value = await integrationsService.grupoOlxFeedStatus(connection.id)
            routeForm.externalResourceId = '*'
            routeForm.externalResourceName = 'Todos os leads do Grupo OLX'
            loadExistingRoute('*')
        }
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível carregar os detalhes da conexão.')
        try {
            connections.value = await integrationsService.listConnections()
        } catch {
            // Preserve the original provider error if refreshing also fails.
        }
    } finally {
        actionLoading.value = false
    }
}

async function activatePage(page: IntegrationAsset) {
    const connection = selectedConnection.value
    if (!connection) return
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        const updated = await integrationsService.activateMetaPage(connection.id, page)
        replaceConnection(updated)
        pages.value = []
        forms.value = await integrationsService.listMetaForms(connection.id)
        success.value = `Página ${page.name} conectada.`
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível conectar a página.')
        try {
            connections.value = await integrationsService.listConnections()
        } catch {
            // Preserve the original activation error if refreshing also fails.
        }
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
    success.value = ''
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
        success.value = 'Roteamento atualizado.'
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível salvar o roteamento.')
    } finally {
        actionLoading.value = false
    }
}

async function toggleConnection() {
    const connection = selectedConnection.value
    if (!connection || !['ACTIVE', 'PAUSED'].includes(connection.status)) return
    actionLoading.value = true
    error.value = ''
    success.value = ''
    try {
        const updated = await integrationsService.updateStatus(
            connection.id,
            connection.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
        )
        replaceConnection(updated)
        success.value = updated.status === 'ACTIVE' ? 'Conexão ativada.' : 'Conexão pausada.'
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
        success.value = 'Evento enviado novamente para processamento.'
    } catch (caught) {
        error.value = messageFrom(caught, 'Não foi possível reenfileirar o evento.')
    }
}

async function copyText(value: string | null, label: string) {
    if (!value) return
    await navigator.clipboard.writeText(value)
    success.value = `${label} copiada.`
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
watch(openProvider, (provider) => {
    document.body.classList.toggle('overflow-hidden', Boolean(provider))
})
onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
onMounted(() => void loadAll())
</script>

<template>
    <AppLayout>
        <div class="space-y-6">
            <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Central de homologações</p>
                    <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Integrações</h1>
                    <p class="mt-1 max-w-3xl text-sm text-slate-500">
                        Conecte canais, acompanhe homologações e configure o destino de cada lead em um único lugar.
                    </p>
                </div>
                <button
                    type="button"
                    class="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    :disabled="loading"
                    @click="loadAll"
                >
                    Atualizar central
                </button>
            </header>

            <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ error }}
            </div>
            <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {{ success }}
            </div>

            <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                Carregando integrações...
            </div>

            <section v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <button
                    v-for="provider in providerCatalog"
                    :key="provider.provider"
                    type="button"
                    class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                    @click="showProvider(provider.provider)"
                >
                    <div class="absolute inset-0 bg-gradient-to-br opacity-80" :class="provider.accentClass" />
                    <div class="relative">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <span class="flex h-12 w-12 items-center justify-center rounded-2xl p-2 shadow-sm ring-1" :class="provider.logoClass">
                                    <img :src="provider.logo" :alt="provider.logoAlt" class="h-full w-full object-contain">
                                </span>
                                <div>
                                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{{ provider.eyebrow }}</p>
                                    <h2 class="mt-1 text-lg font-bold text-slate-900 dark:text-white">{{ provider.name }}</h2>
                                </div>
                            </div>
                            <span class="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900/70 dark:text-slate-300">
                                {{ connectionsFor(provider.provider).length }} {{ connectionsFor(provider.provider).length === 1 ? 'conexão' : 'conexões' }}
                            </span>
                        </div>

                        <p class="mt-5 min-h-[42px] text-sm leading-6 text-slate-600 dark:text-slate-300">{{ provider.description }}</p>

                        <dl class="mt-6 grid grid-cols-2 gap-3">
                            <div class="rounded-2xl border border-white/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ativas</dt>
                                <dd class="mt-1 text-xl font-bold text-slate-900 dark:text-white">{{ activeConnections(provider.provider) }}</dd>
                            </div>
                            <div class="rounded-2xl border border-white/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pendências</dt>
                                <dd class="mt-1 text-xl font-bold text-slate-900 dark:text-white">{{ pendingEvents(provider.provider) }}</dd>
                            </div>
                        </dl>

                        <div class="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm font-semibold text-indigo-600 dark:border-slate-700 dark:text-indigo-300">
                            <span>{{ connectionsFor(provider.provider).length ? 'Gerenciar homologações' : 'Adicionar integração' }}</span>
                            <span class="transition group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </button>
            </section>

            <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div class="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                    <h2 class="font-semibold text-slate-900 dark:text-white">Atividade recente</h2>
                    <p class="text-sm text-slate-500">Eventos de todas as integrações, sem exposição de payloads ou credenciais.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-900/40">
                            <tr>
                                <th class="px-5 py-3">Recebido</th>
                                <th class="px-5 py-3">Integração</th>
                                <th class="px-5 py-3">Status</th>
                                <th class="px-5 py-3">Resultado</th>
                                <th class="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                            <tr v-for="event in events" :key="event.id">
                                <td class="whitespace-nowrap px-5 py-3">{{ formatDate(event.receivedAt) }}</td>
                                <td class="px-5 py-3">{{ event.provider === 'META_LEAD_ADS' ? 'Meta Lead Ads' : 'Grupo OLX' }}</td>
                                <td class="px-5 py-3">{{ eventStatusLabel[event.status] }}</td>
                                <td class="max-w-md px-5 py-3">
                                    <RouterLink v-if="event.leadId" :to="`/leads/${event.leadId}`" class="text-indigo-600 hover:underline">Abrir lead</RouterLink>
                                    <span v-else :class="event.lastError ? 'text-red-600' : 'text-slate-400'">{{ event.lastError || 'Aguardando' }}</span>
                                </td>
                                <td class="px-5 py-3 text-right">
                                    <button v-if="['FAILED', 'BLOCKED_QUOTA'].includes(event.status)" class="font-semibold text-indigo-600 hover:underline" @click="retryEvent(event)">Reprocessar</button>
                                </td>
                            </tr>
                            <tr v-if="events.length === 0">
                                <td colspan="5" class="px-5 py-10 text-center text-slate-400">Nenhum evento recebido.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <Teleport to="body">
            <div
                v-if="openProvider && selectedProvider"
                class="fixed inset-0 isolate z-[10000] flex items-center justify-center p-3 sm:p-6"
                role="dialog"
                aria-modal="true"
                :aria-label="`Gerenciar ${selectedProvider.name}`"
                @click.self="closeProvider"
            >
                <button
                    type="button"
                    class="absolute inset-0 z-0 cursor-default bg-slate-950/65 backdrop-blur-sm"
                    aria-label="Fechar integrações"
                    @click="closeProvider"
                />
                <section class="relative z-10 flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl dark:bg-slate-900">
                    <header class="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
                        <div class="flex min-w-0 items-center gap-3">
                            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 ring-1" :class="selectedProvider.logoClass">
                                <img :src="selectedProvider.logo" :alt="selectedProvider.logoAlt" class="h-full w-full object-contain">
                            </span>
                            <div class="min-w-0">
                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ selectedProvider.eyebrow }}</p>
                                <h2 class="truncate text-lg font-bold text-slate-900 dark:text-white">Gerenciar {{ selectedProvider.name }}</h2>
                            </div>
                        </div>
                        <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white" aria-label="Fechar" @click="closeProvider">✕</button>
                    </header>

                    <div class="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
                        <aside class="overflow-y-auto border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 lg:border-b-0 lg:border-r">
                            <div class="flex items-center justify-between">
                                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Conexões</p>
                                <span class="text-xs text-slate-400">{{ modalConnections.length }}</span>
                            </div>

                            <div class="mt-3 space-y-2">
                                <button
                                    v-for="connection in modalConnections"
                                    :key="connection.id"
                                    type="button"
                                    class="w-full rounded-2xl border p-3 text-left transition"
                                    :class="selectedConnectionId === connection.id
                                        ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900'
                                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'"
                                    @click="selectedConnectionId = connection.id"
                                >
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="min-w-0">
                                            <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ connection.externalAccountName || connection.name }}</p>
                                            <p class="mt-1 text-xs text-slate-400">{{ formatDate(connection.lastReceivedAt) }}</p>
                                        </div>
                                        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="connection.status === 'ACTIVE' ? 'bg-emerald-500' : connection.status === 'ERROR' ? 'bg-red-500' : 'bg-amber-400'" />
                                    </div>
                                    <div class="mt-3 flex items-center justify-between text-xs">
                                        <span class="text-slate-500">{{ statusLabel[connection.status] }}</span>
                                        <span v-if="connection.pendingEvents" class="font-semibold text-amber-600">{{ connection.pendingEvents }} pendências</span>
                                    </div>
                                </button>
                            </div>

                            <div class="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
                                <button
                                    v-if="openProvider === 'META_LEAD_ADS'"
                                    type="button"
                                    class="w-full rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                    :disabled="actionLoading"
                                    @click="startMeta"
                                >
                                    + Conectar nova conta
                                </button>
                                <form v-else class="space-y-2" @submit.prevent="createOlx">
                                    <label class="text-xs font-semibold text-slate-500">Canal Pro · Imóveis</label>
                                    <input v-model="olxName" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900" placeholder="Ex.: Canal Pro Matriz">
                                    <button class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="actionLoading || !olxName.trim()">+ Adicionar conexão</button>
                                    <p class="text-xs text-slate-500">Para imóveis, cadastre a URL de leads no Canal Pro após a homologação do CRM.</p>
                                    <button type="button" class="w-full rounded-xl border border-violet-400 px-4 py-2.5 text-sm font-semibold text-violet-700 disabled:opacity-50 dark:text-violet-300" :disabled="actionLoading" @click="authorizeOlx()">Conectar conta OLX</button>
                                    <p class="text-xs text-slate-500">A API de leads OLX atende às categorias habilitadas pela OLX. A documentação atual lista veículos.</p>
                                </form>
                            </div>
                        </aside>

                        <main class="min-h-0 overflow-y-auto p-4 sm:p-6">
                            <p v-if="error" role="alert" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>
                            <p v-if="success" role="status" class="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</p>
                            <div v-if="!selectedConnection" class="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                                <span class="flex h-16 w-16 items-center justify-center rounded-2xl p-3 ring-1" :class="selectedProvider.logoClass">
                                    <img :src="selectedProvider.logo" :alt="selectedProvider.logoAlt" class="h-full w-full object-contain">
                                </span>
                                <h3 class="mt-5 text-lg font-bold text-slate-900 dark:text-white">Nenhuma conexão configurada</h3>
                                <p class="mt-2 max-w-md text-sm text-slate-500">Adicione a primeira conexão para iniciar a homologação e configurar o roteamento de leads.</p>
                            </div>

                            <div v-else class="space-y-5">
                                <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div class="flex flex-wrap items-center gap-2">
                                                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedConnection.externalAccountName || selectedConnection.name }}</h3>
                                                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{{ statusLabel[selectedConnection.status] }}</span>
                                            </div>
                                            <p class="mt-1 text-sm text-slate-500">Último lead: {{ formatDate(selectedConnection.lastReceivedAt) }}</p>
                                        </div>
                                        <button
                                            v-if="['ACTIVE', 'PAUSED'].includes(selectedConnection.status)"
                                            type="button"
                                            class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
                                            :disabled="actionLoading"
                                            @click="toggleConnection"
                                        >
                                            {{ selectedConnection.status === 'ACTIVE' ? 'Pausar conexão' : 'Ativar conexão' }}
                                        </button>
                                    </div>
                                    <p v-if="selectedConnection.lastError" class="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{{ selectedConnection.lastError }}</p>
                                </section>

                                <section v-if="selectedConnection.provider === 'META_LEAD_ADS'" class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
                                    <h3 class="font-semibold text-slate-900 dark:text-white">Status da conexão Meta</h3>
                                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                        {{ selectedConnection.status === 'ACTIVE' ? 'Página conectada e recebimento de leads autorizado pela Meta.'
                                            : selectedConnection.status === 'PAUSED' ? 'O recebimento de leads está pausado.'
                                            : selectedConnection.status === 'ERROR' || selectedConnection.status === 'EXPIRED' ? 'A conexão precisa de atenção. Reconecte para renovar a autorização.'
                                            : selectedConnection.metaAuthorized ? 'Autorização recebida. Selecione a página abaixo para concluir a conexão.'
                                            : 'A autorização na Meta ainda não foi concluída. Esta tentativa não está ativa.' }}
                                    </p>
                                    <button type="button" class="mt-4 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="actionLoading" @click="reconnectMeta">
                                        {{ actionLoading ? 'Aguarde...' : 'Reconectar com a Meta' }}
                                    </button>
                                    <p v-if="selectedConnection.metaAuthorized && selectedConnection.status === 'CONNECTING' && !pages.length && !actionLoading" class="mt-3 text-sm text-amber-700">Nenhuma página disponível. Confira suas permissões no Facebook e reconecte.</p>
                                </section>

                                <section v-if="selectedConnection.provider === 'META_LEAD_ADS' && routes.length" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
                                        <div>
                                            <h3 class="font-semibold text-slate-900 dark:text-white">Recuperação de leads</h3>
                                            <p class="mt-1 max-w-lg text-sm text-slate-500">Os formulários configurados são conferidos periodicamente para recuperar leads que não chegaram. Leads já recebidos não são duplicados.</p>
                                        </div>
                                        <div class="flex flex-wrap gap-2">
                                            <button type="button" class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-600" :disabled="actionLoading" @click="loadConnectionDetails">Atualizar status</button>
                                            <button type="button" class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="actionLoading || selectedConnection.status !== 'ACTIVE'" @click="recoverMetaLeads">Buscar leads pendentes</button>
                                        </div>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                                            <thead class="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-900/40">
                                                <tr><th class="px-5 py-3">Formulário</th><th class="px-5 py-3">Última conferência</th><th class="px-5 py-3">Recuperados</th><th class="px-5 py-3">Situação</th></tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                                <tr v-for="mapping in routes" :key="mapping.id">
                                                    <td class="px-5 py-3">{{ mapping.externalResourceName || mapping.externalResourceId }}</td>
                                                    <td class="whitespace-nowrap px-5 py-3">{{ formatDate(mapping.lastSyncAt) }}</td>
                                                    <td class="px-5 py-3">{{ mapping.recoveredLeads ?? 0 }}</td>
                                                    <td class="max-w-sm px-5 py-3" :class="mapping.syncError ? 'text-red-600' : 'text-slate-500'">{{ !mapping.active ? 'Pausado' : mapping.syncError || (mapping.syncInProgress ? 'Em andamento' : mapping.lastSyncAt ? 'Atualizado' : 'Aguardando primeira conferência') }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <section v-if="selectedConnection.olxOAuth" class="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900 dark:bg-violet-950/20">
                                    <h3 class="font-semibold text-slate-900 dark:text-white">Autorização OLX</h3>
                                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ selectedConnection.olxAuthorized ? 'Conta autorizada e webhook cadastrado na OLX.' : 'Autorize sua conta para cadastrar o recebimento de leads na OLX.' }}</p>
                                    <button type="button" class="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="actionLoading" @click="authorizeOlx(selectedConnection.id)">Reconectar com a OLX</button>
                                </section>

                                <section v-if="selectedConnection.inboundUrl" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Entrada de leads</p>
                                    <p class="mt-1 text-sm text-slate-500">{{ selectedConnection.olxOAuth ? 'A URL é cadastrada automaticamente após a autorização da conta OLX.' : 'Cadastre esta URL no Canal Pro durante a homologação.' }}</p>
                                    <div class="mt-3 flex gap-2">
                                        <code class="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3 py-2.5 text-xs dark:bg-slate-900">{{ selectedConnection.inboundUrl }}</code>
                                        <button class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-indigo-600" @click="copyText(selectedConnection.inboundUrl, 'URL')">Copiar</button>
                                    </div>
                                </section>

                                <section v-if="grupoOlxFeed" class="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900 dark:bg-violet-950/20">
                                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p class="text-xs font-bold uppercase tracking-wide text-violet-500">Publicação de imóveis · VRSync</p>
                                            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ grupoOlxFeed.publishedProperties }} de {{ grupoOlxFeed.activeProperties }} imóveis ativos serão publicados.</p>
                                        </div>
                                        <span class="w-fit rounded-full px-2.5 py-1 text-xs font-semibold" :class="grupoOlxFeed.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'">{{ grupoOlxFeed.ready ? 'Pronto para homologar' : 'Requer ajustes' }}</span>
                                    </div>
                                    <div class="mt-3 flex gap-2">
                                        <code class="min-w-0 flex-1 truncate rounded-xl bg-white px-3 py-2.5 text-xs dark:bg-slate-900">{{ grupoOlxFeed.feedUrl }}</code>
                                        <button class="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white" @click="copyText(grupoOlxFeed.feedUrl, 'URL do feed')">Copiar feed</button>
                                    </div>
                                    <ul v-if="grupoOlxFeed.warnings.length" class="mt-3 space-y-1 text-xs text-amber-800 dark:text-amber-300">
                                        <li v-for="warning in grupoOlxFeed.warnings" :key="warning">• {{ warning }}</li>
                                    </ul>
                                </section>

                                <section v-if="pages.length" class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
                                    <h3 class="font-semibold text-slate-900 dark:text-white">Escolha a página do Facebook</h3>
                                    <p class="mt-1 text-sm text-slate-500">A conexão só ficará ativa após a confirmação da página pela Meta.</p>
                                    <div class="mt-4 flex flex-wrap gap-2">
                                        <button v-for="page in pages" :key="page.id" class="rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-slate-900" :disabled="actionLoading" @click="activatePage(page)">{{ page.name }}</button>
                                    </div>
                                </section>

                                <section v-if="resources.length" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    <div>
                                        <h3 class="font-semibold text-slate-900 dark:text-white">Roteamento de leads</h3>
                                        <p class="mt-1 text-sm text-slate-500">Selecione uma origem e defina funil, distribuição e imóvel padrão.</p>
                                    </div>
                                    <div class="mt-5 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
                                        <div class="space-y-2">
                                            <button
                                                v-for="resource in resources"
                                                :key="resource.id"
                                                class="w-full rounded-xl border px-3 py-2.5 text-left text-sm"
                                                :class="routeForm.externalResourceId === resource.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700'"
                                                @click="chooseResource(resource)"
                                            >
                                                <span class="block font-semibold">{{ resource.name }}</span>
                                                <span class="mt-0.5 block text-xs opacity-70">{{ routes.some(item => item.externalResourceId === resource.id) ? 'Configurada' : 'Pendente' }}</span>
                                            </button>
                                        </div>

                                        <form v-if="routeForm.externalResourceId" class="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:grid-cols-2" @submit.prevent="saveRoute">
                                            <label class="text-sm text-slate-600 dark:text-slate-300">Funil
                                                <select v-model="routeForm.pipelineId" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                                                    <option value="" disabled>Selecione</option>
                                                    <option v-for="item in options.pipelines" :key="item.id" :value="item.id">{{ item.label }}</option>
                                                </select>
                                            </label>
                                            <label class="text-sm text-slate-600 dark:text-slate-300">Distribuição
                                                <select v-model="routeForm.assignmentMode" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                                                    <option value="AUTO">Regras automáticas</option>
                                                    <option value="POOL">Bolsão específico</option>
                                                    <option value="BROKER">Corretor específico</option>
                                                </select>
                                            </label>
                                            <label v-if="routeForm.assignmentMode === 'POOL'" class="text-sm text-slate-600 dark:text-slate-300">Bolsão
                                                <select v-model="routeForm.poolId" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                                                    <option value="" disabled>Selecione</option>
                                                    <option v-for="item in options.pools" :key="item.id" :value="item.id">{{ item.label }}</option>
                                                </select>
                                            </label>
                                            <label v-if="routeForm.assignmentMode === 'BROKER'" class="text-sm text-slate-600 dark:text-slate-300">Corretor
                                                <select v-model="routeForm.assignedTo" required class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                                                    <option value="" disabled>Selecione</option>
                                                    <option v-for="item in options.brokers" :key="item.id" :value="item.id">{{ item.label }}</option>
                                                </select>
                                            </label>
                                            <label class="text-sm text-slate-600 dark:text-slate-300">Imóvel padrão
                                                <select v-model="routeForm.defaultPropertyId" class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600">
                                                    <option value="">Nenhum</option>
                                                    <option v-for="item in options.properties" :key="item.id" :value="item.id">{{ item.label }}</option>
                                                </select>
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
                                    <div class="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                                        <h3 class="font-semibold text-slate-900 dark:text-white">Eventos desta conexão</h3>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                                            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                                <tr v-for="event in connectionEvents" :key="event.id">
                                                    <td class="whitespace-nowrap px-5 py-3">{{ formatDate(event.receivedAt) }}</td>
                                                    <td class="px-5 py-3">{{ eventStatusLabel[event.status] }}</td>
                                                    <td class="max-w-sm px-5 py-3"><RouterLink v-if="event.leadId" :to="`/leads/${event.leadId}`" class="text-indigo-600 hover:underline">Abrir lead</RouterLink><span v-else class="text-slate-400">{{ event.lastError || 'Aguardando' }}</span></td>
                                                    <td class="px-5 py-3 text-right"><button v-if="['FAILED', 'BLOCKED_QUOTA'].includes(event.status)" class="font-semibold text-indigo-600" @click="retryEvent(event)">Reprocessar</button></td>
                                                </tr>
                                                <tr v-if="connectionEvents.length === 0"><td colspan="4" class="px-5 py-8 text-center text-slate-400">Nenhum evento nesta conexão.</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </main>
                    </div>
                </section>
            </div>
        </Teleport>
    </AppLayout>
</template>
