<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Configurações de E-mail</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Gerencie remetentes e servidores SMTP para automações</p>
        </div>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow hover:opacity-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar
        </button>
      </div>
    </template>

    <!-- Add / Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @keydown.esc="closeModal"
    >
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-base font-semibold text-slate-900 dark:text-white mb-5">
          {{ editingConfig ? 'Editar remetente' : 'Novo remetente' }}
        </h2>

        <div class="space-y-4">
          <!-- Display Name -->
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nome de exibição <span class="text-red-500">*</span></label>
            <input
              v-model="form.displayName"
              type="text"
              placeholder="Ex: Suporte, Vendas..."
              class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- From Email -->
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">E-mail remetente <span class="text-red-500">*</span></label>
              <input
                v-model="form.fromEmail"
                type="email"
                placeholder="noreply@empresa.com"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <!-- From Name -->
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nome do remetente</label>
              <input
                v-model="form.fromName"
                type="text"
                placeholder="Minha Empresa"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <!-- SMTP Host + Port -->
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Servidor SMTP <span class="text-red-500">*</span></label>
              <input
                v-model="form.smtpHost"
                type="text"
                placeholder="smtp.empresa.com"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Porta <span class="text-red-500">*</span></label>
              <input
                v-model.number="form.smtpPort"
                type="number"
                min="1"
                max="65535"
                placeholder="587"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <!-- SMTP Username + Password -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Usuário SMTP</label>
              <input
                v-model="form.smtpUsername"
                type="text"
                placeholder="usuario@empresa.com"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Senha SMTP
                <span v-if="editingConfig" class="text-slate-400 font-normal">— deixe em branco para manter</span>
              </label>
              <input
                v-model="form.smtpPassword"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <!-- TLS + Default -->
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input v-model="form.smtpTls" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-slate-700 dark:text-slate-300">Usar TLS/STARTTLS</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input v-model="form.isDefault" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-slate-700 dark:text-slate-300">Definir como padrão</span>
            </label>
          </div>

          <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
          >
            {{ submitting ? 'Salvando...' : editingConfig ? 'Salvar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deletingConfig" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-base font-semibold text-slate-900 dark:text-white mb-2">Remover configuração</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tem certeza que deseja remover <strong class="text-slate-700 dark:text-slate-200">{{ deletingConfig.displayName }}</strong>?
          Workflows que usam este remetente passarão a usar o envio padrão do sistema.
        </p>
        <div class="flex gap-3">
          <button
            @click="deletingConfig = null"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="submitting"
            class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:bg-red-700"
          >
            {{ submitting ? 'Removendo...' : 'Remover' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Configs List -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="configs.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-slate-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum remetente configurado</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-xs">Adicione um remetente de e-mail para usar em automações com SMTP personalizado.</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="config in configs"
        :key="config.id"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ config.displayName }}</span>
              <span
                v-if="config.isDefault"
                class="shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              >
                padrão
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {{ config.fromName ? `${config.fromName} ` : '' }}&lt;{{ config.fromEmail }}&gt;
            </p>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="openEditModal(config)"
              class="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              @click="deletingConfig = config"
              class="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Remover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        <div class="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 003 3h10.5a3 3 0 003-3m-16.5 0V6.375A2.625 2.625 0 017.875 3.75h8.25A2.625 2.625 0 0118.75 6.375v7.875" />
            </svg>
            <span class="truncate">{{ config.smtpHost }}:{{ config.smtpPort }}</span>
            <span v-if="config.smtpTls" class="text-emerald-600 dark:text-emerald-400 font-medium">TLS</span>
          </div>
          <div v-if="config.smtpUsername" class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span class="truncate">{{ config.smtpUsername }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import emailSenderService, { type EmailSenderConfig } from '@/services/emailSender'
import { useNotification } from '@/composables/useNotification'

const { showSuccess, showError } = useNotification()

const configs = ref<EmailSenderConfig[]>([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const formError = ref('')
const editingConfig = ref<EmailSenderConfig | null>(null)
const deletingConfig = ref<EmailSenderConfig | null>(null)

const defaultForm = () => ({
  displayName: '',
  fromEmail: '',
  fromName: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpTls: true,
  isDefault: false,
})

const form = reactive(defaultForm())

async function load() {
  loading.value = true
  try {
    configs.value = await emailSenderService.list()
  } catch {
    showError('Erro ao carregar configurações de e-mail')
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingConfig.value = null
  Object.assign(form, defaultForm())
  formError.value = ''
  showModal.value = true
}

function openEditModal(config: EmailSenderConfig) {
  editingConfig.value = config
  Object.assign(form, {
    displayName: config.displayName,
    fromEmail: config.fromEmail,
    fromName: config.fromName ?? '',
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpUsername: config.smtpUsername ?? '',
    smtpPassword: '',
    smtpTls: config.smtpTls,
    isDefault: config.isDefault,
  })
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingConfig.value = null
}

async function handleSubmit() {
  formError.value = ''
  if (!form.displayName.trim()) {
    formError.value = 'Nome de exibição é obrigatório'
    return
  }
  if (!form.fromEmail.trim()) {
    formError.value = 'E-mail remetente é obrigatório'
    return
  }
  if (!form.smtpHost.trim()) {
    formError.value = 'Servidor SMTP é obrigatório'
    return
  }
  if (!form.smtpPort || form.smtpPort < 1 || form.smtpPort > 65535) {
    formError.value = 'Porta SMTP inválida (1–65535)'
    return
  }

  submitting.value = true
  try {
    const payload = {
      displayName: form.displayName.trim(),
      fromEmail: form.fromEmail.trim(),
      fromName: form.fromName.trim() || undefined,
      smtpHost: form.smtpHost.trim(),
      smtpPort: form.smtpPort,
      smtpUsername: form.smtpUsername.trim() || undefined,
      smtpPassword: form.smtpPassword || undefined,
      smtpTls: form.smtpTls,
      isDefault: form.isDefault,
    }

    if (editingConfig.value) {
      const updated = await emailSenderService.update(editingConfig.value.id, payload)
      const idx = configs.value.findIndex((c) => c.id === updated.id)
      if (idx >= 0) configs.value[idx] = updated
      // Clear default flag on others if this one became default
      if (updated.isDefault) {
        configs.value.forEach((c) => { if (c.id !== updated.id) c.isDefault = false })
      }
      showSuccess('Remetente atualizado com sucesso')
    } else {
      const created = await emailSenderService.create(payload)
      if (created.isDefault) {
        configs.value.forEach((c) => { c.isDefault = false })
      }
      configs.value.push(created)
      showSuccess('Remetente criado com sucesso')
    }
    closeModal()
  } catch {
    formError.value = 'Erro ao salvar. Verifique os dados e tente novamente.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingConfig.value) return
  submitting.value = true
  try {
    await emailSenderService.delete(deletingConfig.value.id)
    configs.value = configs.value.filter((c) => c.id !== deletingConfig.value!.id)
    deletingConfig.value = null
    showSuccess('Remetente removido')
  } catch {
    showError('Erro ao remover remetente')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>
