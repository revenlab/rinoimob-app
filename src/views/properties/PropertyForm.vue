<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePropertyStore } from '@/stores/property'
import type { CreatePropertyRequest, PropertyOperation, PropertyStatus, PropertyType } from '@/types/property'

const router = useRouter()
const route = useRoute()
const store = usePropertyStore()

const isEdit = computed(() => !!route.params.id)
const propertyId = computed(() => route.params.id as string | undefined)

const form = ref<CreatePropertyRequest & { status?: PropertyStatus }>({
  title: '',
  description: '',
  operation: 'SALE',
  propertyType: 'HOUSE',
  status: 'DRAFT',
  currency: 'BRL',
  addressCountry: 'BR',
})

const isSaving = ref(false)
const formError = ref<string | null>(null)

onMounted(async () => {
  if (isEdit.value && propertyId.value) {
    await store.fetchProperty(propertyId.value)
    const p = store.currentProperty
    if (p) {
      form.value = {
        title: p.title,
        description: p.description ?? '',
        operation: p.operation,
        propertyType: p.propertyType,
        status: p.status,
        price: p.price ?? undefined,
        currency: p.currency,
        taxes: p.taxes ?? undefined,
        condoFee: p.condoFee ?? undefined,
        areaTotal: p.areaTotal ?? undefined,
        areaUseful: p.areaUseful ?? undefined,
        bedrooms: p.bedrooms ?? undefined,
        suites: p.suites ?? undefined,
        bathrooms: p.bathrooms ?? undefined,
        parking: p.parking ?? undefined,
        addressStreet: p.addressStreet ?? '',
        addressNumber: p.addressNumber ?? '',
        addressComplement: p.addressComplement ?? '',
        addressNeighborhood: p.addressNeighborhood ?? '',
        addressCity: p.addressCity ?? '',
        addressState: p.addressState ?? '',
        addressCountry: p.addressCountry,
        addressZip: p.addressZip ?? '',
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
      }
    }
  }
})

async function handleSubmit() {
  if (!form.value.title.trim()) { formError.value = 'Título é obrigatório'; return }
  formError.value = null
  isSaving.value = true
  try {
    let result
    if (isEdit.value && propertyId.value) {
      result = await store.updateProperty(propertyId.value, form.value)
    } else {
      result = await store.createProperty(form.value)
    }
    router.push(`/imoveis/${result.id}`)
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Erro ao salvar imóvel'
  } finally {
    isSaving.value = false
  }
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition'
const labelClass = 'block text-xs font-semibold tracking-wide text-slate-500 mb-1'
</script>

<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center gap-3">
        <RouterLink to="/imoveis" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </RouterLink>
        <div>
          <h1 class="text-lg font-bold text-slate-900">{{ isEdit ? 'Editar Imóvel' : 'Novo Imóvel' }}</h1>
          <p class="text-xs text-slate-400">{{ isEdit ? 'Atualize as informações do imóvel' : 'Preencha os dados do novo imóvel' }}</p>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="max-w-4xl space-y-6">

      <!-- Error -->
      <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
        {{ formError }}
      </div>

      <!-- Basic info -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 mb-5">Informações básicas</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label :class="labelClass">Título *</label>
            <input v-model="form.title" type="text" :class="inputClass" placeholder="Ex.: Apartamento 3 quartos no centro" required />
          </div>
          <div>
            <label :class="labelClass">Descrição</label>
            <textarea v-model="form.description" rows="4" :class="inputClass" placeholder="Descreva o imóvel..." />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label :class="labelClass">Operação *</label>
              <select v-model="form.operation" :class="inputClass" required>
                <option value="SALE">Venda</option>
                <option value="RENT">Aluguel</option>
                <option value="SEASONAL">Temporada</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Tipo *</label>
              <select v-model="form.propertyType" :class="inputClass" required>
                <option value="HOUSE">Casa</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="LAND">Terreno</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Status</label>
              <select v-model="form.status" :class="inputClass">
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativo</option>
                <option value="RESERVED">Reservado</option>
                <option value="SOLD">Vendido</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 mb-5">Valores</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label :class="labelClass">Preço</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" :class="inputClass" placeholder="0,00" />
          </div>
          <div>
            <label :class="labelClass">Moeda</label>
            <select v-model="form.currency" :class="inputClass">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">IPTU/mês</label>
            <input v-model.number="form.taxes" type="number" min="0" step="0.01" :class="inputClass" placeholder="0,00" />
          </div>
          <div>
            <label :class="labelClass">Condomínio</label>
            <input v-model.number="form.condoFee" type="number" min="0" step="0.01" :class="inputClass" placeholder="0,00" />
          </div>
        </div>
      </div>

      <!-- Characteristics -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 mb-5">Características</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label :class="labelClass">Área total (m²)</label>
            <input v-model.number="form.areaTotal" type="number" min="0" step="0.01" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Área útil (m²)</label>
            <input v-model.number="form.areaUseful" type="number" min="0" step="0.01" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Quartos</label>
            <input v-model.number="form.bedrooms" type="number" min="0" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Suítes</label>
            <input v-model.number="form.suites" type="number" min="0" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Banheiros</label>
            <input v-model.number="form.bathrooms" type="number" min="0" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Vagas</label>
            <input v-model.number="form.parking" type="number" min="0" :class="inputClass" />
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 mb-5">Endereço</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label :class="labelClass">Rua / Av.</label>
            <input v-model="form.addressStreet" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Número</label>
            <input v-model="form.addressNumber" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Complemento</label>
            <input v-model="form.addressComplement" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Bairro</label>
            <input v-model="form.addressNeighborhood" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">CEP</label>
            <input v-model="form.addressZip" type="text" :class="inputClass" placeholder="00000-000" />
          </div>
          <div>
            <label :class="labelClass">Cidade</label>
            <input v-model="form.addressCity" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Estado</label>
            <input v-model="form.addressState" type="text" :class="inputClass" placeholder="SP" maxlength="2" />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pb-8">
        <RouterLink
          to="/imoveis"
          class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
        >
          Cancelar
        </RouterLink>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-700 to-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span v-if="isSaving" class="flex items-center gap-2">
            <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Salvando...
          </span>
          <span v-else>{{ isEdit ? 'Salvar alterações' : 'Criar imóvel' }}</span>
        </button>
      </div>
    </form>
  </AppLayout>
</template>
