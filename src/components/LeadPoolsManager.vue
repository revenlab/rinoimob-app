<template>
  <div>
    <button @click="openManager" class="ml-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium">Pools</button>

    <Teleport to="body">
      <div v-if="showManager" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" @click="close" />
        <div class="bg-white dark:bg-slate-900 rounded-xl w-[820px] max-h-[90vh] overflow-y-auto p-6 z-10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Gerenciar Bolsões de Leads</h3>
            <div class="flex items-center gap-2">
              <button @click="openCreate" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">Novo bolsão</button>
              <button @click="close" class="text-sm text-slate-500">Fechar</button>
            </div>
          </div>

          <div class="space-y-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-slate-500">
                  <th>Nome</th>
                  <th>Prioridade</th>
                  <th>Distribuição</th>
                  <th>Inatividade</th>
                  <th>Descrição</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pools" :key="p.id" class="border-t border-slate-100">
                  <td class="py-2 font-medium">{{ p.name }}</td>
                  <td>{{ p.priority ?? 100 }}</td>
                  <td>{{ routingLabel(p.routingStrategy) }}</td>
                  <td>{{ p.triggerAfterInactiveDays ? `${p.triggerAfterInactiveDays}d` : '—' }}</td>
                  <td class="truncate max-w-[200px] text-slate-500">{{ p.description }}</td>
                  <td class="text-right whitespace-nowrap">
                    <button @click="edit(p)" class="text-xs px-2 py-1 mr-2 bg-slate-100 rounded">Editar</button>
                    <button @click="remove(p)" class="text-xs px-2 py-1 bg-red-100 rounded text-red-600">Remover</button>
                  </td>
                </tr>
                <tr v-if="!pools.length">
                  <td colspan="6" class="py-6 text-center text-slate-400">Nenhum bolsão criado</td>
                </tr>
              </tbody>
            </table>

            <div v-if="showForm" class="mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-4">
              <!-- Row 1: nome + prioridade -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Nome</label>
                  <input v-model="form.name" class="w-full px-3 py-2 rounded border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Prioridade</label>
                  <input type="number" v-model.number="form.priority" class="w-full px-3 py-2 rounded border" />
                </div>
              </div>

              <!-- Row 2: distribuição + inatividade -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Tipo de distribuição</label>
                  <select v-model="form.routingStrategy" class="w-full px-3 py-2 rounded border">
                    <option value="ROUND_ROBIN">Round Robin</option>
                    <option value="OPEN_TO_ALL">Aberto para Todos</option>
                  </select>
                  <p v-if="form.routingStrategy === 'OPEN_TO_ALL'" class="text-xs text-amber-600 mt-1">
                    O lead será desatribuído para que qualquer corretor possa pegá-lo.
                  </p>
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Executar após X dias sem interações</label>
                  <input
                    type="number"
                    min="0"
                    v-model.number="form.triggerAfterInactiveDays"
                    class="w-full px-3 py-2 rounded border"
                    placeholder="Ex: 7"
                  />
                  <p class="text-xs text-slate-400 mt-1">Deixe em branco ou 0 para desativar o gatilho.</p>
                </div>
              </div>

              <!-- Row 3: corretores participantes -->
              <div>
                <label class="block text-xs text-slate-500 mb-1">Corretores participantes</label>
                <select v-model="form.brokerSelectionMode" class="w-full px-3 py-2 rounded border mb-2">
                  <option value="ALL_BROKERS">Todos os Corretores</option>
                  <option value="SPECIFIC_BROKERS">Corretores Específicos</option>
                </select>
                <div v-if="form.brokerSelectionMode === 'SPECIFIC_BROKERS'">
                  <div v-if="loadingBrokers" class="text-xs text-slate-400 py-2">Carregando corretores...</div>
                  <div v-else class="border rounded max-h-40 overflow-y-auto p-2 space-y-1 bg-white dark:bg-slate-900">
                    <label
                      v-for="b in brokers"
                      :key="b.id"
                      class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 rounded px-1 py-0.5"
                    >
                      <input type="checkbox" :value="b.id" v-model="form.brokerIds" class="accent-indigo-600" />
                      {{ b.firstName }} {{ b.lastName }}
                    </label>
                    <p v-if="!brokers.length" class="text-xs text-slate-400 py-1">Nenhum corretor encontrado.</p>
                  </div>
                </div>
              </div>

              <!-- Row 4: descrição -->
              <div>
                <label class="block text-xs text-slate-500 mb-1">Descrição</label>
                <input v-model="form.description" class="w-full px-3 py-2 rounded border" />
              </div>

              <!-- Row 5: critérios -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs text-slate-500">Critérios de entrada</label>
                  <div class="flex rounded border overflow-hidden text-xs">
                    <button
                      @click="criteriaMode = 'basic'"
                      :class="criteriaMode === 'basic' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'"
                      class="px-3 py-1"
                    >Básico</button>
                    <button
                      @click="criteriaMode = 'advanced'"
                      :class="criteriaMode === 'advanced' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'"
                      class="px-3 py-1"
                    >Avançado (JSON)</button>
                  </div>
                </div>

                <!-- Modo básico -->
                <div v-if="criteriaMode === 'basic'" class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Fonte (source)</label>
                    <input v-model="basicCriteria.source" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="PORTAL, INDICACAO..." />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Cidade (city)</label>
                    <input v-model="basicCriteria.city" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="São Paulo" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Tipo de imóvel (propertyType)</label>
                    <input v-model="basicCriteria.propertyType" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="APARTAMENTO, CASA..." />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Palavra-chave (keywordContains)</label>
                    <input v-model="basicCriteria.keywordContains" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="piscina, garagem..." />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Preço mínimo</label>
                    <input type="number" v-model.number="basicCriteria.minPrice" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="500000" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Preço máximo</label>
                    <input type="number" v-model.number="basicCriteria.maxPrice" class="w-full px-3 py-1.5 rounded border text-sm" placeholder="2000000" />
                  </div>
                </div>

                <!-- Modo avançado -->
                <div v-else>
                  <textarea
                    v-model="form.criteria"
                    rows="5"
                    class="w-full px-3 py-2 rounded border font-mono text-xs"
                    placeholder='{"source":"PORTAL","city":"São Paulo","minPrice":500000}'
                  ></textarea>
                  <p class="text-xs text-slate-400 mt-1">Campos suportados: source, city, propertyType, minPrice, maxPrice, keywordContains</p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button @click="cancelForm" class="px-3 py-2 rounded bg-white border">Cancelar</button>
                <button @click="save" class="px-3 py-2 rounded bg-indigo-600 text-white">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import leadPoolsService from '@/services/leadPools'
import userManagementService from '@/services/userManagement'
import type { LeadPoolResponse, CreateLeadPoolRequest, UpdateLeadPoolRequest } from '@/types/lead'
import type { UserManagementResponse } from '@/types/role'

const showManager = ref(false)
const pools = ref<LeadPoolResponse[]>([])
const showForm = ref(false)
const editing = ref<LeadPoolResponse | null>(null)
const brokers = ref<UserManagementResponse[]>([])
const loadingBrokers = ref(false)

type CriteriaMode = 'basic' | 'advanced'
const criteriaMode = ref<CriteriaMode>('basic')

const basicCriteria = ref({
  source: '',
  city: '',
  propertyType: '',
  keywordContains: '',
  minPrice: null as number | null,
  maxPrice: null as number | null,
})

const emptyForm = () => ({
  name: '',
  description: '',
  criteria: '',
  priority: 100,
  routingStrategy: 'ROUND_ROBIN',
  brokerSelectionMode: 'ALL_BROKERS',
  triggerAfterInactiveDays: null as number | null,
  brokerIds: [] as string[],
})

const form = ref(emptyForm())

// Keep criteria JSON in sync when in basic mode
watch(basicCriteria, (v) => {
  if (criteriaMode.value !== 'basic') return
  const obj: Record<string, unknown> = {}
  if (v.source) obj.source = v.source
  if (v.city) obj.city = v.city
  if (v.propertyType) obj.propertyType = v.propertyType
  if (v.keywordContains) obj.keywordContains = v.keywordContains
  if (v.minPrice != null && v.minPrice > 0) obj.minPrice = v.minPrice
  if (v.maxPrice != null && v.maxPrice > 0) obj.maxPrice = v.maxPrice
  form.value.criteria = Object.keys(obj).length ? JSON.stringify(obj) : ''
}, { deep: true })

// When switching to basic mode, parse existing JSON into fields
watch(criteriaMode, (mode) => {
  if (mode === 'basic' && form.value.criteria) {
    try {
      const parsed = JSON.parse(form.value.criteria)
      basicCriteria.value = {
        source: parsed.source ?? '',
        city: parsed.city ?? '',
        propertyType: parsed.propertyType ?? '',
        keywordContains: parsed.keywordContains ?? '',
        minPrice: parsed.minPrice ?? null,
        maxPrice: parsed.maxPrice ?? null,
      }
    } catch {
      // invalid JSON — stay in advanced
      criteriaMode.value = 'advanced'
    }
  }
})

// Load brokers when SPECIFIC_BROKERS is selected
watch(() => form.value.brokerSelectionMode, async (mode) => {
  if (mode === 'SPECIFIC_BROKERS' && brokers.value.length === 0) {
    loadingBrokers.value = true
    try {
      brokers.value = await userManagementService.list()
    } catch {
      brokers.value = []
    } finally {
      loadingBrokers.value = false
    }
  }
})

async function load() {
  try {
    pools.value = await leadPoolsService.list()
  } catch {
    pools.value = []
  }
}

onMounted(load)

function routingLabel(strategy?: string) {
  if (strategy === 'OPEN_TO_ALL') return 'Aberto p/ Todos'
  return 'Round Robin'
}

function openManager() {
  showManager.value = true
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  basicCriteria.value = { source: '', city: '', propertyType: '', keywordContains: '', minPrice: null, maxPrice: null }
  criteriaMode.value = 'basic'
  showForm.value = true
}

function edit(p: LeadPoolResponse) {
  editing.value = p
  form.value = {
    name: p.name,
    description: p.description ?? '',
    criteria: p.criteria ?? '',
    priority: p.priority ?? 100,
    routingStrategy: p.routingStrategy ?? 'ROUND_ROBIN',
    brokerSelectionMode: p.brokerSelectionMode ?? 'ALL_BROKERS',
    triggerAfterInactiveDays: p.triggerAfterInactiveDays ?? null,
    brokerIds: p.brokerIds ? [...p.brokerIds] : [],
  }
  // detect mode: if criteria is set and parseable, offer basic
  if (p.criteria) {
    try {
      const parsed = JSON.parse(p.criteria)
      basicCriteria.value = {
        source: parsed.source ?? '',
        city: parsed.city ?? '',
        propertyType: parsed.propertyType ?? '',
        keywordContains: parsed.keywordContains ?? '',
        minPrice: parsed.minPrice ?? null,
        maxPrice: parsed.maxPrice ?? null,
      }
      criteriaMode.value = 'basic'
    } catch {
      criteriaMode.value = 'advanced'
    }
  } else {
    basicCriteria.value = { source: '', city: '', propertyType: '', keywordContains: '', minPrice: null, maxPrice: null }
    criteriaMode.value = 'basic'
  }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editing.value = null
}

async function save() {
  if (criteriaMode.value === 'advanced' && form.value.criteria) {
    try {
      JSON.parse(form.value.criteria)
    } catch {
      alert('Critérios inválidos: JSON mal formado')
      return
    }
  }
  if (form.value.brokerSelectionMode === 'SPECIFIC_BROKERS' && form.value.brokerIds.length === 0) {
    alert('Selecione ao menos um corretor para o bolsão.')
    return
  }

  const payload: CreateLeadPoolRequest & UpdateLeadPoolRequest = {
    name: form.value.name,
    description: form.value.description,
    criteria: form.value.criteria || undefined,
    priority: form.value.priority,
    routingStrategy: form.value.routingStrategy,
    brokerSelectionMode: form.value.brokerSelectionMode,
    triggerAfterInactiveDays: form.value.triggerAfterInactiveDays ?? undefined,
    brokerIds: form.value.brokerSelectionMode === 'SPECIFIC_BROKERS' ? form.value.brokerIds : [],
  }

  try {
    if (editing.value) {
      await leadPoolsService.update(editing.value.id, payload)
    } else {
      await leadPoolsService.create(payload)
    }
    await load()
    showForm.value = false
    editing.value = null
    emitUpdated()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Erro ao salvar')
  }
}

async function remove(p: LeadPoolResponse) {
  if (!confirm(`Remover bolsão "${p.name}"?`)) return
  try {
    await leadPoolsService.delete(p.id)
    await load()
    emitUpdated()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Erro ao remover')
  }
}

const emit = defineEmits<{ (e: 'updated'): void }>()
function emitUpdated() {
  emit('updated')
}

function close() {
  showManager.value = false
  showForm.value = false
}
</script>

<style scoped>
/* minimal styling kept by tailwind classes in template */
</style>
