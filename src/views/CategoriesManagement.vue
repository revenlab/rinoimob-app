<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useCategoryStore } from '@/stores/category'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'

const store = useCategoryStore()

onMounted(() => store.fetchCategories())

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

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition'
const labelClass = 'block text-xs font-semibold tracking-wide text-slate-500 mb-1'
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900">Categorias</h1>
          <p class="text-xs text-slate-400">Gerencie as categorias de imóveis do seu tenant</p>
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

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">Nome</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">Slug</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">Descrição</th>
            <th class="text-left px-6 py-3.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">Origem</th>
            <th class="px-6 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cat in store.categories"
            :key="cat.id"
            class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
          >
            <td class="px-6 py-3.5 font-medium text-slate-900">{{ cat.name }}</td>
            <td class="px-6 py-3.5 text-slate-500 font-mono text-xs">{{ cat.slug }}</td>
            <td class="px-6 py-3.5 text-slate-400 max-w-xs truncate">{{ cat.description || '—' }}</td>
            <td class="px-6 py-3.5">
              <span
                :class="cat.isGlobal
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-emerald-50 text-emerald-700'"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {{ cat.isGlobal ? 'Sistema' : 'Tenant' }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <div v-if="!cat.isGlobal" class="flex items-center justify-end gap-2">
                <button
                  @click="openEdit(cat.id)"
                  class="text-xs text-slate-400 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-indigo-50"
                >
                  Editar
                </button>
                <button
                  v-if="deleteConfirmId !== cat.id"
                  @click="deleteConfirmId = cat.id"
                  class="text-xs text-slate-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Excluir
                </button>
                <div v-else class="flex items-center gap-1">
                  <button @click="confirmDelete(cat.id)" class="text-xs font-semibold text-red-600 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition">Confirmar</button>
                  <button @click="deleteConfirmId = null" class="text-xs text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-100 transition">Cancelar</button>
                </div>
              </div>
              <span v-else class="block text-center text-slate-200 text-xs">—</span>
            </td>
          </tr>
          <tr v-if="!store.categories.length">
            <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeModal" />
        <div class="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-base font-bold text-slate-900 mb-5">
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
            <button @click="closeModal" type="button" class="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition">
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
