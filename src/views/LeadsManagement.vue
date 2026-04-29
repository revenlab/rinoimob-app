<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Leads</h1>
          <p class="text-xs text-slate-400">Gerencie o funil de atendimento</p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:translate-y-[-1px] transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo lead
        </button>
      </div>
    </template>

    <!-- Filtros por status -->
    <div class="flex items-center gap-2 mb-6 flex-wrap">
      <button
        v-for="tab in statusTabs"
        :key="tab.value ?? 'all'"
        @click="filterStatus = tab.value; loadLeads()"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
          filterStatus === tab.value
            ? 'bg-indigo-600 text-white shadow'
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
        ]"
      >
        {{ tab.label }}
        <span v-if="tab.value === undefined" class="ml-1 text-xs opacity-70">({{ leadStore.leads?.totalElements ?? 0 }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="leadStore.isLoading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Tabela de leads -->
    <div v-else class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
      <div v-if="!leads.length" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-3 opacity-30">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        <p class="text-sm font-medium">Nenhum lead encontrado</p>
        <p class="text-xs mt-1">Adicione um lead manualmente ou aguarde capturas do portal</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Nome</th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 hidden md:table-cell">Contato</th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Status</th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 hidden lg:table-cell">Origem</th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 hidden lg:table-cell">Data</th>
            <th class="px-4 py-3.5"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
            @click="openDetail(lead)"
          >
            <td class="px-6 py-4">
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ lead.name }}</p>
              <p v-if="lead.message" class="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{{ lead.message }}</p>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <p v-if="lead.email" class="text-slate-600 dark:text-slate-300 text-xs">{{ lead.email }}</p>
              <p v-if="lead.phone" class="text-slate-400 text-xs">{{ lead.phone }}</p>
            </td>
            <td class="px-4 py-4">
              <span :class="statusClass(lead.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ statusLabel(lead.status) }}
              </span>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <span class="text-xs text-slate-400">{{ lead.source === 'PORTAL' ? 'Portal' : 'Manual' }}</span>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <span class="text-xs text-slate-400">{{ formatDate(lead.createdAt) }}</span>
            </td>
            <td class="px-4 py-4 text-right" @click.stop>
              <button
                @click="openDetail(lead)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                title="Ver detalhes"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(lead)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                title="Remover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <div v-if="(leadStore.leads?.totalPages ?? 0) > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-400">
          {{ leadStore.leads?.totalElements }} lead(s) no total
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 0"
            @click="currentPage--; loadLeads()"
            class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >Anterior</button>
          <button
            :disabled="currentPage + 1 >= (leadStore.leads?.totalPages ?? 1)"
            @click="currentPage++; loadLeads()"
            class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >Próxima</button>
        </div>
      </div>
    </div>

    <!-- Modal de detalhe / edição -->
    <Teleport to="body">
      <div v-if="showDetail && selectedLead" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ selectedLead.name }}</h2>
              <span :class="statusClass(selectedLead.status)" class="mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {{ statusLabel(selectedLead.status) }}
              </span>
            </div>
            <button @click="showDetail = false" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <!-- Info -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="selectedLead.email">
                <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Email</p>
                <p class="text-slate-700 dark:text-slate-300">{{ selectedLead.email }}</p>
              </div>
              <div v-if="selectedLead.phone">
                <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Telefone</p>
                <p class="text-slate-700 dark:text-slate-300">{{ selectedLead.phone }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Origem</p>
                <p class="text-slate-700 dark:text-slate-300">{{ selectedLead.source === 'PORTAL' ? 'Portal' : 'Manual' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Data</p>
                <p class="text-slate-700 dark:text-slate-300">{{ formatDate(selectedLead.createdAt) }}</p>
              </div>
            </div>

            <div v-if="selectedLead.message">
              <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Mensagem</p>
              <p class="text-slate-700 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-700 rounded-xl p-3">{{ selectedLead.message }}</p>
            </div>

            <!-- Mudar status -->
            <div>
              <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2">Mudar status</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in allStatuses"
                  :key="s.value"
                  @click="changeStatus(s.value)"
                  :disabled="selectedLead.status === s.value || changingStatus"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border',
                    selectedLead.status === s.value
                      ? 'opacity-50 cursor-default border-transparent ' + s.activeCls
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                  ]"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- Notas -->
            <div>
              <p class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Notas</p>
              <div class="space-y-2 mb-3 max-h-40 overflow-y-auto">
                <div
                  v-for="note in selectedLead.notes"
                  :key="note.id"
                  class="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-sm"
                >
                  <p class="text-slate-700 dark:text-slate-300">{{ note.content }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ formatDate(note.createdAt) }}</p>
                </div>
                <p v-if="!selectedLead.notes.length" class="text-xs text-slate-400 italic">Nenhuma nota ainda</p>
              </div>

              <div class="flex gap-2">
                <input
                  v-model="newNote"
                  type="text"
                  placeholder="Adicionar nota..."
                  class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  @keydown.enter.prevent="submitNote"
                />
                <button
                  @click="submitNote"
                  :disabled="!newNote.trim() || addingNote"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <svg v-if="addingNote" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span v-else>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal criar lead -->
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Novo lead</h2>
            <button @click="showCreate = false" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitCreate" class="p-6 space-y-4">
            <div v-if="createError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
              {{ createError }}
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Nome *</label>
              <input v-model="createForm.name" type="text" required placeholder="Nome do lead"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label class="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Email</label>
              <input v-model="createForm.email" type="email" placeholder="email@exemplo.com"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label class="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Telefone</label>
              <input v-model="createForm.phone" type="tel" placeholder="(11) 99999-9999"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label class="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Mensagem</label>
              <textarea v-model="createForm.message" rows="3" placeholder="Interesse do cliente..."
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
            </div>

            <button type="submit" :disabled="leadStore.isLoading || !createForm.name.trim()"
              class="w-full h-11 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:translate-y-[-1px] disabled:opacity-60 transition-all duration-200">
              <svg v-if="leadStore.isLoading" class="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span v-else>Criar lead</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Confirmar exclusão -->
      <div v-if="showDeleteConfirm && leadToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-6">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Remover lead?</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Tem certeza que deseja remover <strong class="text-slate-800 dark:text-slate-200">{{ leadToDelete.name }}</strong>? Essa ação não pode ser desfeita.
          </p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 h-10 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button @click="executeDelete"
              class="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
              Remover
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useLeadStore } from '@/stores/lead'
import type { LeadResponse, LeadStatus, CreateLeadRequest } from '@/types/lead'

const leadStore = useLeadStore()

const filterStatus = ref<LeadStatus | undefined>(undefined)
const currentPage = ref(0)

const leads = computed(() => leadStore.leads?.content ?? [])

const statusTabs = [
  { label: 'Todos', value: undefined },
  { label: 'Novos', value: 'NEW' as LeadStatus },
  { label: 'Em contato', value: 'CONTACTED' as LeadStatus },
  { label: 'Qualificados', value: 'QUALIFIED' as LeadStatus },
  { label: 'Ganhos', value: 'WON' as LeadStatus },
  { label: 'Perdidos', value: 'LOST' as LeadStatus },
]

const allStatuses = [
  { value: 'NEW' as LeadStatus, label: 'Novo', activeCls: 'bg-blue-100 text-blue-700' },
  { value: 'CONTACTED' as LeadStatus, label: 'Em contato', activeCls: 'bg-amber-100 text-amber-700' },
  { value: 'QUALIFIED' as LeadStatus, label: 'Qualificado', activeCls: 'bg-violet-100 text-violet-700' },
  { value: 'WON' as LeadStatus, label: 'Ganho', activeCls: 'bg-emerald-100 text-emerald-700' },
  { value: 'LOST' as LeadStatus, label: 'Perdido', activeCls: 'bg-red-100 text-red-600' },
]

const statusLabel = (status: LeadStatus) => allStatuses.find(s => s.value === status)?.label ?? status
const statusClass = (status: LeadStatus): string => {
  const map: Record<LeadStatus, string> = {
    NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    CONTACTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    QUALIFIED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    WON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    LOST: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  }
  return map[status] ?? ''
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// Detail modal
const showDetail = ref(false)
const selectedLead = ref<LeadResponse | null>(null)
const newNote = ref('')
const addingNote = ref(false)
const changingStatus = ref(false)

const openDetail = async (lead: LeadResponse) => {
  await leadStore.fetchLead(lead.id)
  selectedLead.value = leadStore.currentLead
  showDetail.value = true
}

const submitNote = async () => {
  if (!newNote.value.trim() || !selectedLead.value) return
  addingNote.value = true
  try {
    await leadStore.addNote(selectedLead.value.id, { content: newNote.value.trim() })
    selectedLead.value = leadStore.currentLead
    newNote.value = ''
  } finally {
    addingNote.value = false
  }
}

const changeStatus = async (status: LeadStatus) => {
  if (!selectedLead.value) return
  changingStatus.value = true
  try {
    const updated = await leadStore.updateLead(selectedLead.value.id, { status })
    selectedLead.value = updated
  } finally {
    changingStatus.value = false
  }
}

// Create modal
const showCreate = ref(false)
const createError = ref<string | null>(null)
const createForm = ref<CreateLeadRequest>({ name: '', email: '', phone: '', message: '', source: 'MANUAL' })

const openCreateModal = () => {
  createForm.value = { name: '', email: '', phone: '', message: '', source: 'MANUAL' }
  createError.value = null
  showCreate.value = true
}

const submitCreate = async () => {
  createError.value = null
  try {
    await leadStore.createLead(createForm.value)
    showCreate.value = false
  } catch (e: unknown) {
    createError.value = e instanceof Error ? e.message : 'Erro ao criar lead'
  }
}

// Delete
const showDeleteConfirm = ref(false)
const leadToDelete = ref<LeadResponse | null>(null)

const confirmDelete = (lead: LeadResponse) => {
  leadToDelete.value = lead
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  if (!leadToDelete.value) return
  await leadStore.deleteLead(leadToDelete.value.id)
  showDeleteConfirm.value = false
  leadToDelete.value = null
}

const loadLeads = () => {
  leadStore.fetchLeads({ status: filterStatus.value, page: currentPage.value, size: 20 })
}

onMounted(loadLeads)
</script>
