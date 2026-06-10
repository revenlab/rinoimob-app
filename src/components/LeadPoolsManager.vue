<template>
  <div>
    <button @click="showManager = true" class="ml-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium">Pools</button>

    <Teleport to="body">
      <div v-if="showManager" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" @click="close" />
        <div class="bg-white dark:bg-slate-900 rounded-xl w-[780px] p-6 z-10">
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
                  <th>Rota</th>
                  <th>Descrição</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pools" :key="p.id" class="border-t border-slate-100">
                  <td class="py-2">{{ p.name }}</td>
                  <td>{{ p.priority ?? 100 }}</td>
                  <td>{{ p.routingStrategy ?? 'ROUND_ROBIN' }}</td>
                  <td class="truncate max-w-[250px]">{{ p.description }}</td>
                  <td class="text-right">
                    <button @click="edit(p)" class="text-xs px-2 py-1 mr-2 bg-slate-100 rounded">Editar</button>
                    <button @click="remove(p)" class="text-xs px-2 py-1 bg-red-100 rounded text-red-600">Remover</button>
                  </td>
                </tr>
                <tr v-if="!pools.length">
                  <td colspan="5" class="py-6 text-center text-slate-400">Nenhum bolsão criado</td>
                </tr>
              </tbody>
            </table>

            <div v-if="showForm" class="mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Nome</label>
                  <input v-model="form.name" class="w-full px-3 py-2 rounded border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Prioridade</label>
                  <input type="number" v-model.number="form.priority" class="w-full px-3 py-2 rounded border" />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs text-slate-500 mb-1">Routing Strategy</label>
                  <select v-model="form.routingStrategy" class="w-full px-3 py-2 rounded border">
                    <option value="ROUND_ROBIN">Round Robin</option>
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="block text-xs text-slate-500 mb-1">Descrição</label>
                  <input v-model="form.description" class="w-full px-3 py-2 rounded border" />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs text-slate-500 mb-1">Critérios (JSON)</label>
                  <textarea v-model="form.criteria" rows="6" class="w-full px-3 py-2 rounded border font-mono text-xs" placeholder='{"source":"PORTAL","city":"São Paulo","minPrice":500000}'></textarea>
                  <p class="text-xs text-slate-400 mt-1">Campos suportados: source, city, propertyType, minPrice, maxPrice, keywordContains</p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 mt-4">
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
import { ref, onMounted } from 'vue'
import leadPoolsService from '@/services/leadPools'
import type { LeadPoolResponse, CreateLeadPoolRequest, UpdateLeadPoolRequest } from '@/types/lead'

const showManager = ref(false)
const pools = ref<LeadPoolResponse[]>([])
const showForm = ref(false)
const editing = ref<LeadPoolResponse | null>(null)

const form = ref({ name: '', description: '', criteria: '', priority: 100, routingStrategy: 'ROUND_ROBIN' })

async function load() {
  try {
    pools.value = await leadPoolsService.list()
  } catch {
    pools.value = []
  }
}

onMounted(load)

function openCreate() {
  editing.value = null
  form.value = { name: '', description: '', criteria: '', priority: 100, routingStrategy: 'ROUND_ROBIN' }
  showForm.value = true
}

function edit(p: LeadPoolResponse) {
  editing.value = p
  form.value = { name: p.name, description: p.description ?? '', criteria: (p as any).criteria ?? '', priority: (p as any).priority ?? 100, routingStrategy: (p as any).routingStrategy ?? 'ROUND_ROBIN' }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editing.value = null
}

async function save() {
  // validate json
  try {
    if (form.value.criteria) JSON.parse(form.value.criteria)
  } catch (e) {
    alert('Critérios inválidos: JSON mal formado')
    return
  }

  const payload: CreateLeadPoolRequest | UpdateLeadPoolRequest = {
    name: form.value.name,
    description: form.value.description,
    // send criteria as raw string; backend expects JSONB
  }
  ;(payload as any).criteria = form.value.criteria
  ;(payload as any).priority = form.value.priority
  ;(payload as any).routingStrategy = form.value.routingStrategy

  try {
    if (editing.value) {
      await leadPoolsService.update(editing.value.id, payload as UpdateLeadPoolRequest)
    } else {
      await leadPoolsService.create(payload as CreateLeadPoolRequest)
    }
    await load()
    showForm.value = false
    editing.value = null
    // notify parent
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
}
</script>

<style scoped>
/* minimal styling kept by tailwind classes in template */
</style>
