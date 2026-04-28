<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePropertyStore } from '@/stores/property'
import propertyService from '@/services/property'

const route = useRoute()
const store = usePropertyStore()
const propertyId = route.params.id as string

const uploadingPhoto = ref(false)
const photoError = ref<string | null>(null)
const deletingPhotoId = ref<string | null>(null)

// Floor plan modal
const showFloorPlanModal = ref(false)
const floorPlanName = ref('')
const floorPlanArea = ref<number | undefined>()
const savingFloorPlan = ref(false)

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho', ACTIVE: 'Ativo', RESERVED: 'Reservado', SOLD: 'Vendido', ARCHIVED: 'Arquivado',
}
const statusClass: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  RESERVED: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  SOLD: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  ARCHIVED: 'bg-red-50 text-red-400 dark:bg-red-900/30 dark:text-red-400',
}
const operationLabel: Record<string, string> = {
  SALE: 'Venda', RENT: 'Aluguel', SEASONAL: 'Temporada',
}
const typeLabel: Record<string, string> = {
  HOUSE: 'Casa', APARTMENT: 'Apartamento', LAND: 'Terreno', COMMERCIAL: 'Comercial', RURAL: 'Rural',
}

const AMENITY_LABELS: Record<string, string> = {
  piscina: 'Piscina',
  varanda: 'Varanda',
  academia: 'Academia',
  churrasqueira: 'Churrasqueira',
  mobiliado: 'Mobiliado',
  aceita_pets: 'Aceita Pets',
  quintal: 'Quintal',
  sacada: 'Sacada',
  deposito: 'Depósito',
  elevador: 'Elevador',
}

const conditionLabel: Record<string, string> = {
  NEW: 'Novo',
  USED: 'Usado',
  UNDER_CONSTRUCTION: 'Em construção',
}

function activeAmenities(attrs: Record<string, unknown>): string[] {
  return Object.entries(attrs)
    .filter(([k, v]) => v === true && k in AMENITY_LABELS)
    .map(([k]) => AMENITY_LABELS[k])
}

function formatPrice(price: number | null, currency: string) {
  if (!price) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price)
}

onMounted(() => store.fetchProperty(propertyId))

async function handlePhotoUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  uploadingPhoto.value = true
  photoError.value = null
  try {
    await propertyService.uploadPhoto(propertyId, files[0])
    await store.fetchProperty(propertyId)
  } catch (e: unknown) {
    photoError.value = e instanceof Error ? e.message : 'Erro ao enviar foto'
  } finally {
    uploadingPhoto.value = false
    ;(event.target as HTMLInputElement).value = ''
  }
}

async function setCover(photoId: string) {
  await propertyService.setCoverPhoto(propertyId, photoId)
  await store.fetchProperty(propertyId)
}

async function deletePhoto(photoId: string) {
  deletingPhotoId.value = photoId
  try {
    await propertyService.deletePhoto(propertyId, photoId)
    await store.fetchProperty(propertyId)
  } finally {
    deletingPhotoId.value = null
  }
}

async function saveFloorPlan() {
  if (!floorPlanName.value.trim()) return
  savingFloorPlan.value = true
  try {
    await propertyService.addFloorPlan(propertyId, { name: floorPlanName.value, area: floorPlanArea.value })
    await store.fetchProperty(propertyId)
    showFloorPlanModal.value = false
    floorPlanName.value = ''
    floorPlanArea.value = undefined
  } finally {
    savingFloorPlan.value = false
  }
}

async function deleteFloorPlan(planId: string) {
  await propertyService.deleteFloorPlan(propertyId, planId)
  await store.fetchProperty(propertyId)
}
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center gap-3">
        <RouterLink to="/imoveis" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </RouterLink>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-slate-900 dark:text-white truncate">{{ store.currentProperty?.title ?? '...' }}</h1>
          <div v-if="store.currentProperty" class="flex items-center gap-2 mt-0.5">
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :class="statusClass[store.currentProperty.status]">
              {{ statusLabel[store.currentProperty.status] }}
            </span>
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ typeLabel[store.currentProperty.propertyType] }} · {{ operationLabel[store.currentProperty.operation] }}</span>
          </div>
        </div>
        <RouterLink
          v-if="store.currentProperty"
          :to="`/imoveis/${propertyId}/editar`"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 transition"
        >
          Editar
        </RouterLink>
      </div>
    </template>

    <div v-if="store.isLoading" class="flex justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
      {{ store.error }}
    </div>

    <template v-else-if="store.currentProperty">
      <div class="max-w-5xl space-y-6">
        <!-- Info grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Details -->
          <div class="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6 space-y-5">
            <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">Detalhes</h2>

            <div v-if="store.currentProperty.description" class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ store.currentProperty.description }}
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div v-if="store.currentProperty.bedrooms">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Quartos</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.bedrooms }}</p>
              </div>
              <div v-if="store.currentProperty.suites">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Suítes</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.suites }}</p>
              </div>
              <div v-if="store.currentProperty.bathrooms">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Banheiros</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.bathrooms }}</p>
              </div>
              <div v-if="store.currentProperty.parking">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Vagas</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.parking }}</p>
              </div>
              <div v-if="store.currentProperty.areaTotal">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Área total</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.areaTotal }}m²</p>
              </div>
              <div v-if="store.currentProperty.areaUseful">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Área útil</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.areaUseful }}m²</p>
              </div>
            </div>

            <div v-if="store.currentProperty.addressStreet" class="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">Endereço</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">
                {{ store.currentProperty.addressStreet }}{{ store.currentProperty.addressNumber ? `, ${store.currentProperty.addressNumber}` : '' }}
                <span v-if="store.currentProperty.addressComplement"> — {{ store.currentProperty.addressComplement }}</span>
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ store.currentProperty.addressNeighborhood }}
                <span v-if="store.currentProperty.addressCity">, {{ store.currentProperty.addressCity }}</span>
                <span v-if="store.currentProperty.addressState"> - {{ store.currentProperty.addressState }}</span>
                <span v-if="store.currentProperty.addressZip"> · {{ store.currentProperty.addressZip }}</span>
              </p>
            </div>

            <!-- Extra info -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div v-if="store.currentProperty.condition">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Condição</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ conditionLabel[store.currentProperty.condition] ?? store.currentProperty.condition }}</p>
              </div>
              <div v-if="store.currentProperty.floorNumber != null">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Andar</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ store.currentProperty.floorNumber }}º</p>
              </div>
              <div v-if="store.currentProperty.referenceCode">
                <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Código</p>
                <p class="text-slate-800 dark:text-slate-200 font-semibold font-mono">{{ store.currentProperty.referenceCode }}</p>
              </div>
            </div>

            <!-- Categories -->
            <div v-if="store.currentProperty.categories?.length" class="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">Categorias</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cat in store.currentProperty.categories"
                  :key="cat.id"
                  class="text-xs font-medium px-3 py-1 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >{{ cat.name }}</span>
              </div>
            </div>

            <!-- Amenities -->
            <div v-if="activeAmenities(store.currentProperty.attributes).length" class="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">Comodidades</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="label in activeAmenities(store.currentProperty.attributes)"
                  :key="label"
                  class="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                >{{ label }}</span>
              </div>
            </div>
          </div>

          <!-- Price card -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
            <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-4">Valores</h2>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {{ formatPrice(store.currentProperty.price, store.currentProperty.currency) }}
            </p>
            <div class="space-y-2">
              <div v-if="store.currentProperty.condoFee" class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">Condomínio</span>
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatPrice(store.currentProperty.condoFee, store.currentProperty.currency) }}</span>
              </div>
              <div v-if="store.currentProperty.taxes" class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">IPTU/mês</span>
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatPrice(store.currentProperty.taxes, store.currentProperty.currency) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">Fotos</h2>
            <label class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 cursor-pointer transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span v-if="uploadingPhoto">Enviando...</span>
              <span v-else>Adicionar foto</span>
              <input type="file" accept="image/*" class="hidden" :disabled="uploadingPhoto" @change="handlePhotoUpload" />
            </label>
          </div>

          <div v-if="photoError" class="mb-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">{{ photoError }}</div>

          <div v-if="!store.currentProperty.photos.length" class="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-12 h-12 mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21l6.75-6.75 1.5 1.5M21 3l-9 9" />
            </svg>
            <p class="text-sm">Nenhuma foto adicionada</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
              v-for="photo in store.currentProperty.photos"
              :key="photo.id"
              class="relative group rounded-xl overflow-hidden border-2 transition"
              :class="photo.isCover ? 'border-indigo-400' : 'border-slate-200 dark:border-slate-600'"
            >
              <img :src="photo.url" :alt="photo.altText ?? ''" class="w-full h-28 object-cover" />
              <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  v-if="!photo.isCover"
                  @click="setCover(photo.id)"
                  title="Definir como capa"
                  class="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
                <button
                  @click="deletePhoto(photo.id)"
                  :disabled="deletingPhotoId === photo.id"
                  title="Remover foto"
                  class="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <div v-if="photo.isCover" class="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                CAPA
              </div>
            </div>
          </div>
        </div>

        <!-- Floor Plans -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">Plantas</h2>
            <button
              @click="showFloorPlanModal = true"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adicionar planta
            </button>
          </div>

          <div v-if="!store.currentProperty.floorPlans.length" class="text-center text-sm text-slate-300 dark:text-slate-600 py-8">
            Nenhuma planta adicionada
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="plan in store.currentProperty.floorPlans"
              :key="plan.id"
              class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50"
            >
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ plan.name }}</p>
                <p v-if="plan.area" class="text-xs text-slate-400 dark:text-slate-500">{{ plan.area }}m²</p>
              </div>
              <button
                @click="deleteFloorPlan(plan.id)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Floor plan modal -->
    <Teleport to="body">
      <div
        v-if="showFloorPlanModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        @click.self="showFloorPlanModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">Nova planta</h3>
          <div class="space-y-3 mb-6">
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome *</label>
              <input
                v-model="floorPlanName"
                type="text"
                placeholder="Ex.: Térreo, 1º Andar..."
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Área (m²)</label>
              <input
                v-model.number="floorPlanArea"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="showFloorPlanModal = false"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              Cancelar
            </button>
            <button
              @click="saveFloorPlan"
              :disabled="savingFloorPlan || !floorPlanName.trim()"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-700 to-indigo-700 disabled:opacity-50 transition"
            >
              {{ savingFloorPlan ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
