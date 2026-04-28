<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePropertyStore } from '@/stores/property'
import type { PropertyListParams, PropertyOperation, PropertyStatus, PropertyType } from '@/types/property'

const router = useRouter()
const store = usePropertyStore()

const params = ref<PropertyListParams>({ page: 0, size: 20 })
const deleteConfirmId = ref<string | null>(null)
const viewMode = ref<'card' | 'list'>(
  (localStorage.getItem('propertiesViewMode') as 'card' | 'list') ?? 'card',
)
function setViewMode(m: 'card' | 'list') {
  viewMode.value = m
  localStorage.setItem('propertiesViewMode', m)
}

onMounted(() => store.fetchProperties(params.value))

watch(params, () => store.fetchProperties(params.value), { deep: true })

async function confirmDelete(id: string) {
  await store.deleteProperty(id)
  deleteConfirmId.value = null
}

function formatPrice(price: number | null, currency: string) {
  if (!price) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price)
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho', ACTIVE: 'Ativo', RESERVED: 'Reservado', SOLD: 'Vendido', ARCHIVED: 'Arquivado',
}
const statusClass: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  SOLD: 'bg-indigo-50 text-indigo-700',
  ARCHIVED: 'bg-red-50 text-red-400',
}
const operationLabel: Record<string, string> = {
  SALE: 'Venda', RENT: 'Aluguel', SEASONAL: 'Temporada',
}
const typeLabel: Record<string, string> = {
  HOUSE: 'Casa', APARTMENT: 'Apartamento', LAND: 'Terreno', COMMERCIAL: 'Comercial', RURAL: 'Rural',
}
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900">Imóveis</h1>
          <p class="text-xs text-slate-400">Gerencie o portfólio de imóveis do seu tenant</p>
        </div>
      <div class="flex items-center gap-3">
        <!-- View toggle -->
        <div class="flex items-center rounded-xl border border-slate-200 overflow-hidden">
          <button
            @click="setViewMode('card')"
            :class="viewMode === 'card' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-400 hover:text-slate-600'"
            class="px-3 py-2 transition"
            title="Visualização em cards"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </button>
          <button
            @click="setViewMode('list')"
            :class="viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-400 hover:text-slate-600'"
            class="px-3 py-2 border-l border-slate-200 transition"
            title="Visualização em lista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
            </svg>
          </button>
        </div>

        <RouterLink
          to="/imoveis/novo"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:-translate-y-px transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Imóvel
        </RouterLink>
      </div>
      </div>
    </template>

    <!-- Filters -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-4 mb-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          v-model="params.status"
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Todos os status</option>
          <option v-for="(label, val) in statusLabel" :key="val" :value="val">{{ label }}</option>
        </select>

        <select
          v-model="params.operation"
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Operação</option>
          <option v-for="(label, val) in operationLabel" :key="val" :value="val">{{ label }}</option>
        </select>

        <select
          v-model="params.propertyType"
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Tipo</option>
          <option v-for="(label, val) in typeLabel" :key="val" :value="val">{{ label }}</option>
        </select>

        <input
          v-model="params.city"
          type="text"
          placeholder="Cidade..."
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <input
          v-model.number="params.bedrooms"
          type="number"
          min="0"
          placeholder="Quartos"
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <button
          @click="() => { params = { page: 0, size: 20 }; store.fetchProperties(params) }"
          class="col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 transition"
        >
          Limpar filtros
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
      {{ store.error }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="!store.properties?.content?.length"
      class="flex flex-col items-center justify-center py-24 text-slate-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-16 h-16 mb-4 text-slate-200">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-sm font-medium">Nenhum imóvel encontrado</p>
      <RouterLink to="/imoveis/novo" class="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
        Cadastrar primeiro imóvel →
      </RouterLink>
    </div>

    <!-- Card Grid -->
    <div v-else-if="viewMode === 'card'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="p in store.properties!.content"
        :key="p.id"
        class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col group"
      >
        <!-- Cover image -->
        <div class="h-40 bg-slate-100 overflow-hidden relative">
          <img
            v-if="p.coverPhotoUrl"
            :src="p.coverPhotoUrl"
            :alt="p.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21l6.75-6.75 1.5 1.5M21 3l-9 9" />
            </svg>
          </div>
          <span
            class="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="statusClass[p.status] || 'bg-slate-100 text-slate-500'"
          >{{ statusLabel[p.status] }}</span>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-1">
            <p class="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{{ p.title }}</p>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
              {{ operationLabel[p.operation] }}
            </span>
          </div>

          <p class="text-xs text-slate-400 mb-2">{{ typeLabel[p.propertyType] }}</p>

          <p class="text-base font-bold text-slate-900 mb-2">{{ formatPrice(p.price, p.currency) }}</p>

          <!-- Category badges -->
          <div v-if="p.categories?.length" class="flex flex-wrap gap-1 mb-2">
            <span
              v-for="cat in p.categories"
              :key="cat.id"
              class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700"
            >{{ cat.name }}</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span v-if="p.bedrooms">🛏 {{ p.bedrooms }}</span>
            <span v-if="p.bathrooms">🚿 {{ p.bathrooms }}</span>
            <span v-if="p.areaTotal">📐 {{ p.areaTotal }}m²</span>
          </div>

          <p v-if="p.addressCity" class="text-xs text-slate-400 mb-4">
            📍 {{ p.addressCity }}, {{ p.addressState }}
          </p>

          <div class="mt-auto flex gap-2">
            <RouterLink
              :to="`/imoveis/${p.id}`"
              class="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
            >
              Ver
            </RouterLink>
            <RouterLink
              :to="`/imoveis/${p.id}/editar`"
              class="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition"
            >
              Editar
            </RouterLink>
            <button
              @click="deleteConfirmId = p.id"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            <th class="px-4 py-3 text-left">Imóvel</th>
            <th class="px-4 py-3 text-left hidden md:table-cell">Tipo / Operação</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell">Localização</th>
            <th class="px-4 py-3 text-left hidden sm:table-cell">Preço</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in store.properties!.content"
            :key="p.id"
            class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
          >
            <!-- Imóvel -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img
                    v-if="p.coverPhotoUrl"
                    :src="p.coverPhotoUrl"
                    :alt="p.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21l6.75-6.75 1.5 1.5M21 3l-9 9" />
                    </svg>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 truncate max-w-[180px]">{{ p.title }}</p>
                  <div v-if="p.categories?.length" class="flex flex-wrap gap-1 mt-0.5">
                    <span
                      v-for="cat in p.categories"
                      :key="cat.id"
                      class="text-[9px] font-medium px-1.5 py-px rounded-full bg-violet-50 text-violet-700"
                    >{{ cat.name }}</span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Tipo / Operação -->
            <td class="px-4 py-3 hidden md:table-cell">
              <p class="text-slate-700">{{ typeLabel[p.propertyType] }}</p>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{{ operationLabel[p.operation] }}</span>
            </td>

            <!-- Localização -->
            <td class="px-4 py-3 hidden lg:table-cell text-slate-500">
              <span v-if="p.addressCity">{{ p.addressCity }}, {{ p.addressState }}</span>
              <span v-else class="text-slate-300">—</span>
              <div class="flex gap-2 text-[11px] text-slate-400 mt-0.5">
                <span v-if="p.bedrooms">🛏 {{ p.bedrooms }}</span>
                <span v-if="p.bathrooms">🚿 {{ p.bathrooms }}</span>
                <span v-if="p.areaTotal">📐 {{ p.areaTotal }}m²</span>
              </div>
            </td>

            <!-- Preço -->
            <td class="px-4 py-3 hidden sm:table-cell font-bold text-slate-900">
              {{ formatPrice(p.price, p.currency) }}
            </td>

            <!-- Status -->
            <td class="px-4 py-3">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="statusClass[p.status] || 'bg-slate-100 text-slate-500'"
              >{{ statusLabel[p.status] }}</span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <RouterLink
                  :to="`/imoveis/${p.id}`"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Ver"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </RouterLink>
                <RouterLink
                  :to="`/imoveis/${p.id}/editar`"
                  class="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </RouterLink>
                <button
                  @click="deleteConfirmId = p.id"
                  class="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Remover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="store.properties && store.properties.totalPages > 1"
      class="flex items-center justify-center gap-2 mt-8"
    >
      <button
        :disabled="params.page === 0"
        @click="params.page = (params.page ?? 0) - 1"
        class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ← Anterior
      </button>
      <span class="text-sm text-slate-500">
        Página {{ (params.page ?? 0) + 1 }} de {{ store.properties.totalPages }}
      </span>
      <button
        :disabled="(params.page ?? 0) + 1 >= (store.properties?.totalPages ?? 1)"
        @click="params.page = (params.page ?? 0) + 1"
        class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Próxima →
      </button>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div
        v-if="deleteConfirmId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        @click.self="deleteConfirmId = null"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-base font-bold text-slate-900 mb-2">Remover imóvel?</h3>
          <p class="text-sm text-slate-500 mb-6">Esta ação marca o imóvel como removido. Você poderá recuperá-lo depois.</p>
          <div class="flex gap-3">
            <button
              @click="deleteConfirmId = null"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete(deleteConfirmId!)"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
