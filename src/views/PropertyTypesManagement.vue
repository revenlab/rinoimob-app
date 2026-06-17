<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import propertyService from '@/services/property'
import type { PropertyTypeResponse } from '@/types/property'
import { DEFAULT_PROPERTY_TYPES } from '@/types/property'

const propertyTypes = ref<PropertyTypeResponse[]>(DEFAULT_PROPERTY_TYPES.map(type => ({ ...type })))
const loading = ref(false)
const error = ref<string | null>(null)
const savingCode = ref<string | null>(null)
const uploadingCode = ref<string | null>(null)
const deletingCode = ref<string | null>(null)

onMounted(() => {
  void fetchPropertyTypes()
})

async function fetchPropertyTypes() {
  loading.value = true
  error.value = null
  try {
    propertyTypes.value = await propertyService.listPropertyTypes(false)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar tipos de imóveis'
    propertyTypes.value = DEFAULT_PROPERTY_TYPES.map(type => ({ ...type }))
  } finally {
    loading.value = false
  }
}

async function savePropertyType(type: PropertyTypeResponse) {
  savingCode.value = type.code
  error.value = null
  try {
    const updated = await propertyService.updatePropertyType(type.code, {
      label: type.label,
      position: type.position,
      active: type.active,
      cardColor: type.cardColor?.trim() || null,
    })
    replaceType(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao salvar tipo de imóvel'
  } finally {
    savingCode.value = null
  }
}

async function uploadCoverImage(type: PropertyTypeResponse, event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  uploadingCode.value = type.code
  error.value = null
  try {
    const updated = await propertyService.uploadPropertyTypeCoverImage(type.code, file)
    replaceType(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao enviar capa'
  } finally {
    if (input) input.value = ''
    uploadingCode.value = null
  }
}

async function deleteCoverImage(type: PropertyTypeResponse) {
  deletingCode.value = type.code
  error.value = null
  try {
    const updated = await propertyService.deletePropertyTypeCoverImage(type.code)
    replaceType(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro ao remover capa'
  } finally {
    deletingCode.value = null
  }
}

function replaceType(updated: PropertyTypeResponse) {
  const idx = propertyTypes.value.findIndex(item => item.code === updated.code)
  if (idx !== -1) {
    propertyTypes.value[idx] = updated
  }
}

function colorInputValue(type: PropertyTypeResponse) {
  return type.cardColor || '#1E3A8A'
}

function updateCardColor(type: PropertyTypeResponse, event: Event) {
  const input = event.target as HTMLInputElement | null
  type.cardColor = input?.value || '#1E3A8A'
}

function cardStyle(type: PropertyTypeResponse) {
  if (type.coverImageUrl) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%), url(${type.coverImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  const base = type.cardColor || '#1E3A8A'
  return {
    background: `linear-gradient(135deg, ${base} 0%, ${withOpacity(base, 0.72)} 100%)`,
  }
}

function withOpacity(hex: string, opacity: number) {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return hex
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `#${clean}${alpha}`.toUpperCase()
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white dark:focus:bg-slate-600 transition'
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full gap-4">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Tipos de imóveis</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500">Edite os tipos padrão do tenant e defina como cada card aparece no website.</p>
        </div>
        <button
          @click="fetchPropertyTypes"
          :disabled="loading"
          class="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
        >
          {{ loading ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </template>

    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div
        v-for="type in propertyTypes"
        :key="type.code"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden"
      >
        <div class="grid lg:grid-cols-[220px_1fr]">
          <div class="relative min-h-[220px] p-5 flex flex-col justify-end" :style="cardStyle(type)">
            <div class="absolute inset-0 bg-black/10" />
            <div class="relative">
              <div class="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase mb-2">{{ type.code }}</div>
              <div class="text-2xl font-semibold text-white leading-tight">{{ type.label }}</div>
              <div class="text-sm text-white/80 mt-1">{{ type.coverImageUrl ? 'Card com imagem de capa' : 'Card com cor personalizada' }}</div>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <label class="block">
                <span class="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1">Nome</span>
                <input v-model="type.label" type="text" :class="inputClass" />
              </label>
              <label class="block">
                <span class="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1">Ordem</span>
                <input v-model.number="type.position" type="number" :class="inputClass" />
              </label>
            </div>

            <div class="grid md:grid-cols-[160px_1fr] gap-4 items-end">
              <label class="block">
                <span class="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1">Cor do card</span>
                <div class="flex items-center gap-3">
                  <input :value="colorInputValue(type)" type="color" class="h-11 w-16 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-1" @input="updateCardColor(type, $event)" />
                  <input v-model="type.cardColor" type="text" placeholder="#1E3A8A" :class="inputClass" />
                </div>
              </label>

              <div class="flex flex-wrap items-center gap-3">
                <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <input v-model="type.active" type="checkbox" class="accent-indigo-600" />
                  Ativo no cadastro e no site
                </label>
                <label class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="uploadCoverImage(type, $event)" />
                  {{ uploadingCode === type.code ? 'Enviando capa...' : 'Enviar capa' }}
                </label>
                <button
                  v-if="type.coverImageUrl"
                  @click="deleteCoverImage(type)"
                  :disabled="deletingCode === type.code"
                  class="px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {{ deletingCode === type.code ? 'Removendo...' : 'Remover capa' }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end">
              <button
                @click="savePropertyType(type)"
                :disabled="savingCode === type.code || !type.label.trim()"
                class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {{ savingCode === type.code ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
