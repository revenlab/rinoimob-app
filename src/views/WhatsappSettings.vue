<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">WhatsApp</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Gerencie seus números de WhatsApp</p>
        </div>
      </div>
    </template>

    <!-- Add Instance Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Adicionar número</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nome do número</label>
            <input
              v-model="newDisplayName"
              type="text"
              placeholder="Ex: Atendimento, Suporte..."
              class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Telefone (com DDI) <span class="text-slate-400 font-normal">— opcional</span></label>
            <input
              v-model="newPhoneNumber"
              type="text"
              placeholder="+55 11 99999-9999"
              class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="closeAddModal"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleCreateInstance"
            :disabled="!newDisplayName.trim() || creatingInstance"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
          >
            <span v-if="creatingInstance">Criando...</span>
            <span v-else>Criar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQrModal && qrInstance" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Conectar WhatsApp</h2>
          <button @click="closeQrModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ qrInstance.displayName }}</span>
          <span :class="statusBadgeClass(qrInstance.status)" class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold">
            {{ statusLabel(qrInstance.status) }}
          </span>
        </div>

        <div v-if="qrInstance.status === 'CONNECTED'" class="text-center py-6">
          <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-emerald-600 dark:text-emerald-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Conectado com sucesso!</p>
        </div>

        <div v-else class="space-y-4">
          <div class="flex flex-col items-center justify-center py-4">
            <template v-if="qrImageUrl">
              <img
                :src="qrImageUrl"
                class="w-56 h-56 mx-auto rounded-xl"
                alt="QR Code WhatsApp"
              />
            </template>
            <div v-else class="text-center py-4">
              <svg class="animate-spin w-8 h-8 text-indigo-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Aguardando QR Code da Evolution API...</p>
              <button
                @click="refreshQr"
                :disabled="loadingQr"
                class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >Atualizar manualmente</button>
            </div>
          </div>

          <div v-if="qrData?.pairingCode" class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Código de pareamento</p>
            <p class="text-2xl font-bold tracking-[0.2em] text-slate-900 dark:text-white font-mono">{{ qrData.pairingCode }}</p>
          </div>

          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p class="font-medium text-slate-600 dark:text-slate-300">Como conectar:</p>
            <p>1. Abra o WhatsApp no celular</p>
            <p>2. Vá em <strong>Dispositivos conectados</strong></p>
            <p>3. Toque em <strong>Conectar novo dispositivo</strong></p>
            <p>4. Escaneie o QR Code acima</p>
          </div>
        </div>

        <div class="flex gap-3 mt-4">
          <button
            v-if="qrInstance.status !== 'CONNECTED'"
            @click="refreshQr"
            :disabled="loadingQr"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <span v-if="loadingQr">Atualizando...</span>
            <span v-else>Atualizar</span>
          </button>
          <button
            @click="closeQrModal"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Números Cadastrados</h2>
        <button
          @click="openAddModal"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar número
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <svg class="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <div v-else-if="instances.length === 0" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
        <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nenhum número cadastrado</p>
        <p class="text-xs text-slate-400 dark:text-slate-500">Adicione um número para começar a enviar mensagens</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="instance in instances"
          :key="instance.id"
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-wrap"
        >
          <!-- Status dot -->
          <span
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :class="{
              'bg-emerald-500': instance.status === 'CONNECTED',
              'bg-amber-400': instance.status === 'CONNECTING',
              'bg-red-500': instance.status === 'DISCONNECTED',
            }"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ instance.displayName }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">{{ instance.phoneNumber ?? 'sem número' }}</p>
          </div>

          <!-- Status badge -->
          <span :class="statusBadgeClass(instance.status)" class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0">
            {{ statusLabel(instance.status) }}
          </span>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="openConfigModal(instance)"
              class="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Configurações da instância"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.041.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.542-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.005-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.145-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              v-if="instance.status !== 'CONNECTED'"
              @click="openQrModal(instance)"
              class="px-3 py-1.5 text-xs font-medium border border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Ver QR Code
            </button>
            <button
              v-else
              @click="openQrModal(instance)"
              class="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Reconectar
            </button>
            <button
              @click="handleDelete(instance)"
              class="px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-800/50 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Config Modal -->
    <div v-if="showConfigModal && configInstance" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Configurar: {{ configInstance.displayName }}</h2>
          <button @click="closeConfigModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-5">
          <!-- Auto-create leads toggle -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">Criar leads automaticamente</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Mensagens de números desconhecidos criam novos leads</p>
            </div>
            <button
              @click="configAutoCreate = !configAutoCreate"
              :class="configAutoCreate ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'"
              class="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            >
              <span
                :class="configAutoCreate ? 'translate-x-5' : 'translate-x-0.5'"
                class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200"
              />
            </button>
          </div>

          <!-- User assignment -->
          <div>
            <label class="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">Atribuir a corretor</label>
            <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">Deixe em branco para que qualquer usuário possa usar este número</p>
            <select
              v-model="configAssignedUserId"
              :disabled="loadingUsers"
              class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <option value="">Aberto para todos</option>
              <option v-for="user in tenantUsers" :key="user.id" :value="user.id">
                {{ user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeConfigModal"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveInstanceConfig"
            :disabled="savingConfig"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
          >
            {{ savingConfig ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import QRCode from 'qrcode'
import AppLayout from '@/layouts/AppLayout.vue'
import whatsappService from '@/services/whatsapp'
import userService from '@/services/user'
import type { WhatsappInstance, QrCodeResponse } from '@/types/whatsapp'
import type { UserSummary } from '@/types/lead'

const instances = ref<WhatsappInstance[]>([])
const loading = ref(false)

// Add modal state
const showAddModal = ref(false)
const newDisplayName = ref('')
const newPhoneNumber = ref('')
const creatingInstance = ref(false)

// QR modal state
const showQrModal = ref(false)
const qrInstance = ref<WhatsappInstance | null>(null)
const qrData = ref<QrCodeResponse | null>(null)
const loadingQr = ref(false)
const qrImageUrl = ref<string | null>(null)

// Config modal state
const showConfigModal = ref(false)
const configInstance = ref<WhatsappInstance | null>(null)
const configAutoCreate = ref(false)
const configAssignedUserId = ref('')
const savingConfig = ref(false)
const tenantUsers = ref<UserSummary[]>([])
const loadingUsers = ref(false)

// Polling intervals
let statusPollInterval: ReturnType<typeof setInterval> | null = null
let qrPollInterval: ReturnType<typeof setInterval> | null = null

// Generate QR image from code string whenever qrData changes
watch(() => qrData.value?.code, async (code) => {
  if (!code) { qrImageUrl.value = null; return }
  if (code.startsWith('data:image')) {
    qrImageUrl.value = code
  } else {
    qrImageUrl.value = await QRCode.toDataURL(code, { width: 256, margin: 1 })
  }
})

async function fetchInstances() {
  loading.value = true
  try {
    instances.value = await whatsappService.listInstances()
  } catch { /* best-effort */ } finally {
    loading.value = false
  }
}

function statusLabel(status: WhatsappInstance['status']) {
  const map = { CONNECTED: 'Conectado', CONNECTING: 'Conectando...', DISCONNECTED: 'Desconectado' }
  return map[status]
}

function statusBadgeClass(status: WhatsappInstance['status']) {
  if (status === 'CONNECTED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (status === 'CONNECTING') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
}

// ── Add modal ─────────────────────────────────────────────────────────────
function openAddModal() {
  newDisplayName.value = ''
  newPhoneNumber.value = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

async function handleCreateInstance() {
  if (!newDisplayName.value.trim()) return
  creatingInstance.value = true
  try {
    const created = await whatsappService.createInstance({
      displayName: newDisplayName.value.trim(),
      phoneNumber: newPhoneNumber.value.trim(),
    })
    closeAddModal()
    await fetchInstances()
    // auto-open QR modal for the new instance
    openQrModal(created)
  } catch (e: any) {
    alert(e?.message ?? 'Erro ao criar instância')
  } finally {
    creatingInstance.value = false
  }
}

// ── QR modal ──────────────────────────────────────────────────────────────
async function openQrModal(instance: WhatsappInstance) {
  qrInstance.value = instance
  qrData.value = null
  showQrModal.value = true
  await refreshQr()
  startQrPolling()
}

function closeQrModal() {
  showQrModal.value = false
  qrInstance.value = null
  qrData.value = null
  qrImageUrl.value = null
  stopQrPolling()
}

async function refreshQr() {
  if (!qrInstance.value) return
  loadingQr.value = true
  try {
    qrData.value = await whatsappService.getQrCode(qrInstance.value.id)
    // Also refresh instance status
    const updated = await whatsappService.getInstanceStatus(qrInstance.value.id)
    qrInstance.value = updated
    // Update in list
    const idx = instances.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) instances.value[idx] = updated
  } catch { /* best-effort */ } finally {
    loadingQr.value = false
  }
}

function startQrPolling() {
  stopQrPolling()
  // Poll every 3s while code is null (QR still generating), every 15s once we have it
  const tick = async () => {
    if (!showQrModal.value || qrInstance.value?.status === 'CONNECTED') {
      stopQrPolling()
      return
    }
    await refreshQr()
    const interval = qrData.value?.code ? 15000 : 3000
    qrPollInterval = setTimeout(tick, interval) as unknown as ReturnType<typeof setInterval>
  }
  qrPollInterval = setTimeout(tick, 3000) as unknown as ReturnType<typeof setInterval>
}

function stopQrPolling() {
  if (qrPollInterval) {
    clearTimeout(qrPollInterval as unknown as ReturnType<typeof setTimeout>)
    qrPollInterval = null
  }
}

// ── Background status polling for CONNECTING instances ───────────────────
function startStatusPolling() {
  statusPollInterval = setInterval(async () => {
    const hasConnecting = instances.value.some(i => i.status === 'CONNECTING')
    if (!hasConnecting) return
    try {
      instances.value = await whatsappService.listInstances()
    } catch { /* best-effort */ }
  }, 30000)
}

// ── Config modal ──────────────────────────────────────────────────────────
async function openConfigModal(instance: WhatsappInstance) {
  configInstance.value = instance
  configAutoCreate.value = instance.autoCreateLeadsFromUnknownNumbers ?? false
  configAssignedUserId.value = instance.assignedToUserId ?? ''
  showConfigModal.value = true

  if (tenantUsers.value.length === 0) {
    loadingUsers.value = true
    try {
      tenantUsers.value = await userService.listActive()
    } catch { /* best-effort */ } finally {
      loadingUsers.value = false
    }
  }
}

function closeConfigModal() {
  showConfigModal.value = false
  configInstance.value = null
}

async function saveInstanceConfig() {
  if (!configInstance.value) return
  savingConfig.value = true
  try {
    const updated = await whatsappService.updateInstanceConfig(configInstance.value.id, {
      autoCreateLeadsFromUnknownNumbers: configAutoCreate.value,
      assignedToUserId: configAssignedUserId.value || null,
    })
    const idx = instances.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) instances.value[idx] = updated
    closeConfigModal()
  } catch (e: any) {
    alert(e?.message ?? 'Erro ao salvar configurações')
  } finally {
    savingConfig.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
async function handleDelete(instance: WhatsappInstance) {
  if (!confirm(`Remover "${instance.displayName}"? Essa ação não pode ser desfeita.`)) return
  try {
    await whatsappService.deleteInstance(instance.id)
    instances.value = instances.value.filter(i => i.id !== instance.id)
  } catch (e: any) {
    alert(e?.message ?? 'Erro ao remover instância')
  }
}

onMounted(async () => {
  await fetchInstances()
  startStatusPolling()
})

onUnmounted(() => {
  if (statusPollInterval) clearInterval(statusPollInterval)
  stopQrPolling()
})
</script>
