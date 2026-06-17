<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useCategoryStore } from '@/stores/category'
import propertyService from '@/services/property'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'
import type { PropertyTypeResponse } from '@/types/property'
import { DEFAULT_PROPERTY_TYPES } from '@/types/property'

const store = useCategoryStore()

onMounted(() => {
  void store.fetchCategories()
  void fetchPropertyTypes()
})

const propertyTypes = ref<PropertyTypeResponse[]>(DEFAULT_PROPERTY_TYPES.map(type => ({ ...type })))
const propertyTypesLoading = ref(false)
const propertyTypesError = ref<string | null>(null)
const savingPropertyTypeCode = ref<string | null>(null)

async function fetchPropertyTypes() {
  propertyTypesLoading.value = true
  propertyTypesError.value = null
  try {
    propertyTypes.value = await propertyService.listPropertyTypes(false)
  } catch (e: unknown) {
    propertyTypesError.value = e instanceof Error ? e.message : 'Erro ao carregar tipos de imóveis'
    propertyTypes.value = DEFAULT_PROPERTY_TYPES.map(type => ({ ...type }))
  } finally {
    propertyTypesLoading.value = false
  }
}

async function savePropertyType(type: PropertyTypeResponse) {
  savingPropertyTypeCode.value = type.code
  propertyTypesError.value = null
  try {
    const updated = await propertyService.updatePropertyType(type.code, {
      label: type.label,
      position: type.position,
      active: type.active,
    })
    const idx = propertyTypes.value.findIndex(item => item.code === updated.code)
    if (idx !== -1) propertyTypes.value[idx] = updated
  } catch (e: unknown) {
    propertyTypesError.value = e instanceof Error ? e.message : 'Erro ao salvar tipo de imóvel'
  } finally {
    savingPropertyTypeCode.value = null
  }
}

// Modal state
const showModal = ref(false)
const editId = ref<string | null>(null)
const modalForm = ref<CreateCategoryRequest>({ name: '', slug: '', description: '' })
const modalError = ref<string | null>(null)
const isSaving = ref(false)

const deleteConfirmId = ref<string | null>(null)

function openCreate() {
  editId.value = null
  modalForm.value = { name: '', slug: '', description: '' }
  modalError.value = null
  showModal.value = true
}

function openEdit(id: string) {
  const cat = store.categories.find(c => c.id === id)
  if (!cat) return
  editId.value = id
  modalForm.value = { name: cat.name, slug: cat.slug, description: cat.description ?? '' }
  modalError.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editId.value = null
}

async function handleSave() {
  if (!modalForm.value.name.trim()) { modalError.value = 'Nome é obrigatório'; return }
  isSaving.value = true
  modalError.value = null
  try {
    if (editId.value) {
      const data: UpdateCategoryRequest = { name: modalForm.value.name, slug: modalForm.value.slug || undefined, description: modalForm.value.description || undefined }
      await store.updateCategory(editId.value, data)
    } else {
      await store.createCategory({ ...modalForm.value })
    }
    closeModal()
  } catch (e: unknown) {
    modalError.value = e instanceof Error ? e.message : 'Erro ao salvar categoria'
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete(id: string) {
  try {
    await store.deleteCategory(id)
  } catch (e: unknown) {
    // ignore — global categories are protected server-side
  }
  deleteConfirmId.value = null
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white dark:focus:bg-slate-600 transition'
const labelClass = 'block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1'
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Categorias e tipos</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500">Gerencie categorias e rótulos de tipos de imóveis do tenant</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:-translate-y-px transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Categoria
        </button>
      </div>
    </template>

    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Tipos de imóveis</h2>
          <p class="text-xs text-slate-400 dark:text-slate-500">Controle o nome, ordem e disponibilidade dos tipos usados no cadastro e no site.</p>
        </div>
        <button
          @click="fetchPropertyTypes"
          :disabled="propertyTypesLoading"
          class="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
        >
          {{ propertyTypesLoading ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
      <div v-if="propertyTypesError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
        {{ propertyTypesError }}
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-700">
        <div
          v-for="type in propertyTypes"
          :key="type.code"
          class="grid grid-cols-1 md:grid-cols-[120px_1fr_120px_120px] gap-3 px-6 py-4 items-center"
        >
          <div class="font-mono text-xs text-slate-400 dark:text-slate-500">{{ type.code }}</div>
          <input v-model="type.label" type="text" :class="inputClass" />
          <input v-model.number="type.position" type="number" :class="inputClass" />
          <div class="flex items-center justify-between gap-3">
            <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <input v-model="type.active" type="checkbox" class="accent-indigo-600" />
              Ativo
            </label>
            <button
              @click="savePropertyType(type)"
              :disabled="savingPropertyTypeCode === type.code || !type.label.trim()"
              class="text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {{ savingPropertyTypeCode === type.code ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700">
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">Nome</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">Slug</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">Descrição</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">Origem</th>
            <th class="px-6 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cat in store.categories"
            :key="cat.id"
            :class="cat.isGlobal ? 'border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30' : 'border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors'"
          >
            <td class="px-6 py-3.5 font-medium" :class="cat.isGlobal ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'">
              <div class="flex items-center gap-2">
                <svg v-if="cat.isGlobal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-slate-300 shrink-0" title="Categoria do sistema — não editável">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                {{ cat.name }}
              </div>
            </td>
            <td class="px-6 py-3.5 font-mono text-xs" :class="cat.isGlobal ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'">{{ cat.slug }}</td>
            <td class="px-6 py-3.5 max-w-xs truncate" :class="cat.isGlobal ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'">{{ cat.description || '—' }}</td>
            <td class="px-6 py-3.5">
              <span
                :class="cat.isGlobal
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {{ cat.isGlobal ? 'Sistema' : 'Tenant' }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <div v-if="!cat.isGlobal" class="flex items-center justify-end gap-2">
                <button
                  @click="openEdit(cat.id)"
                  class="text-xs text-slate-400 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                >
                  Editar
                </button>
                <button
                  v-if="deleteConfirmId !== cat.id"
                  @click="deleteConfirmId = cat.id"
                  class="text-xs text-slate-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  Excluir
                </button>
                <div v-else class="flex items-center gap-1">
                  <button @click="confirmDelete(cat.id)" class="text-xs font-semibold text-red-600 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition">Confirmar</button>
                  <button @click="deleteConfirmId = null" class="text-xs text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                </div>
              </div>
              <div v-else class="flex items-center justify-end">
                <span class="text-[10px] text-slate-300 dark:text-slate-600 italic">somente leitura</span>
              </div>
            </td>
          </tr>
          <tr v-if="!store.categories.length">
            <td colspan="5" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Nenhuma categoria cadastrada</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeModal" />
        <div class="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-5">
            {{ editId ? 'Editar Categoria' : 'Nova Categoria' }}
          </h2>

          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
            {{ modalError }}
          </div>

          <div class="space-y-4">
            <div>
              <label :class="labelClass">Nome *</label>
              <input v-model="modalForm.name" type="text" :class="inputClass" placeholder="Ex.: Lançamentos" autofocus />
            </div>
            <div>
              <label :class="labelClass">Slug <span class="text-slate-300 font-normal">(opcional — gerado automaticamente)</span></label>
              <input v-model="modalForm.slug" type="text" :class="inputClass" placeholder="Ex.: lancamentos" />
            </div>
            <div>
              <label :class="labelClass">Descrição</label>
              <textarea v-model="modalForm.description" rows="2" :class="inputClass" placeholder="Descrição opcional..." />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button @click="closeModal" type="button" class="px-4 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Cancelar
            </button>
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-700 to-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:-translate-y-px transition-all disabled:opacity-50"
            >
              {{ isSaving ? 'Salvando...' : (editId ? 'Salvar' : 'Criar') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
