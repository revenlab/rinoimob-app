<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePropertyStore } from '@/stores/property'
import { useCategoryStore } from '@/stores/category'
import propertyService from '@/services/property'
import { usePropertyAiGeneration } from '@/composables/usePropertyAiGeneration'
import type { CreatePropertyRequest, PropertyCondition, PropertyStatus } from '@/types/property'

const router = useRouter()
const route = useRoute()
const store = usePropertyStore()
const catStore = useCategoryStore()
const { generateTitle: aiGenerateTitle, generateDescription: aiGenerateDescription, isLoadingTitle, isLoadingDescription } = usePropertyAiGeneration()

const isEdit = computed(() => !!route.params.id)
const propertyId = computed(() => route.params.id as string | undefined)

const form = ref<CreatePropertyRequest & { status?: PropertyStatus; slug?: string }>({
  title: '',
  description: '',
  slug: '',
  operation: 'SALE',
  propertyType: 'HOUSE',
  status: 'DRAFT',
  currency: 'BRL',
  addressCountry: 'BR',
  attributes: {},
  categoryIds: [],
})

type PropertyPhotoDraft = {
  id: string
  file: File
  previewUrl: string
  altText: string
  isCover: boolean
}

type FloorPlanPhotoDraft = {
  id: string
  url: string
  previewUrl: string
  file?: File
  persisted: boolean
  isCover: boolean
}

type FloorPlanDraft = {
  id: string
  persistedId?: string
  name: string
  area?: number
  photos: FloorPlanPhotoDraft[]
}

type CepStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error'

type ViaCepResponse = {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

const propertyPhotos = ref<PropertyPhotoDraft[]>([])
const floorPlansDraft = ref<FloorPlanDraft[]>([])
const cepStatus = ref<CepStatus>('idle')
let cepLookupTimer: ReturnType<typeof setTimeout> | undefined
let cepLookupSequence = 0

function createDraftId() {
  return crypto.randomUUID()
}

function revokeDraft(draft: { previewUrl: string }) {
  URL.revokeObjectURL(draft.previewUrl)
}

function addPropertyPhotos(files: FileList | null) {
  if (!files?.length) return

  const next = Array.from(files).map(file => ({
    id: createDraftId(),
    file,
    previewUrl: URL.createObjectURL(file),
    altText: '',
    isCover: false,
  }))

  if (propertyPhotos.value.length === 0 && next.length > 0) {
    next[0].isCover = true
  }

  propertyPhotos.value = [...propertyPhotos.value, ...next]
}

function handlePropertyPhotosChange(event: Event) {
  addPropertyPhotos((event.target as HTMLInputElement).files)
  ;(event.target as HTMLInputElement).value = ''
}

function removePropertyPhoto(id: string) {
  const draft = propertyPhotos.value.find(photo => photo.id === id)
  if (!draft) return
  revokeDraft(draft)
  propertyPhotos.value = propertyPhotos.value.filter(photo => photo.id !== id)
  if (!propertyPhotos.value.some(photo => photo.isCover) && propertyPhotos.value.length > 0) {
    propertyPhotos.value[0].isCover = true
  }
}

function setPropertyCover(id: string) {
  propertyPhotos.value = propertyPhotos.value.map(photo => ({
    ...photo,
    isCover: photo.id === id,
  }))
}

function addFloorPlan() {
  floorPlansDraft.value = [
    ...floorPlansDraft.value,
    {
      id: createDraftId(),
      persistedId: undefined,
      name: '',
      area: undefined,
      photos: [],
    },
  ]
}

async function removeFloorPlan(id: string) {
  const plan = floorPlansDraft.value.find(item => item.id === id)
  if (!plan) return
  plan.photos.forEach(revokeDraft)
  if (plan.persistedId && propertyId.value) {
    try {
      await propertyService.deleteFloorPlan(propertyId.value, plan.persistedId)
    } catch (e: unknown) {
      formError.value = e instanceof Error ? e.message : 'Erro ao remover planta'
      return
    }
  }
  floorPlansDraft.value = floorPlansDraft.value.filter(item => item.id !== id)
}

function addFloorPlanPhotos(planId: string, files: FileList | null) {
  if (!files?.length) return
  const plan = floorPlansDraft.value.find(item => item.id === planId)
  if (!plan) return

  const nextFiles = Array.from(files)
  const pid = propertyId.value
  if (plan.persistedId && pid) {
    void (async () => {
      for (const file of nextFiles) {
        const uploaded = await propertyService.uploadFloorPlanPhoto(pid, plan.persistedId!, file)
        plan.photos.push({
          id: uploaded.id,
          url: uploaded.url,
          previewUrl: uploaded.url,
          persisted: true,
          isCover: uploaded.isCover,
        })
      }
    })().catch((e: unknown) => {
      formError.value = e instanceof Error ? e.message : 'Erro ao enviar imagem da planta'
    })
    return
  }

  const next = nextFiles.map(file => ({
    id: createDraftId(),
    file,
    previewUrl: URL.createObjectURL(file),
    url: '',
    persisted: false,
    isCover: false,
  }))

  if (!plan.photos.some(photo => photo.isCover) && next.length > 0) {
    next[0].isCover = true
  }

  plan.photos = [...plan.photos, ...next]
}

function handleFloorPlanPhotosChange(planId: string, event: Event) {
  addFloorPlanPhotos(planId, (event.target as HTMLInputElement).files)
  ;(event.target as HTMLInputElement).value = ''
}

function removeFloorPlanPhoto(planId: string, photoId: string) {
  const plan = floorPlansDraft.value.find(item => item.id === planId)
  const photo = plan?.photos.find(item => item.id === photoId)
  if (!plan || !photo) return
  if (plan.persistedId && photo.persisted && propertyId.value) {
    propertyService.deleteFloorPlanPhoto(propertyId.value, plan.persistedId, photo.id)
      .then(() => {
        plan.photos = plan.photos.filter(item => item.id !== photoId)
      })
      .catch((e: unknown) => {
        formError.value = e instanceof Error ? e.message : 'Erro ao remover imagem da planta'
      })
    return
  }

  revokeDraft(photo)
  plan.photos = plan.photos.filter(item => item.id !== photoId)
  if (!plan.photos.some(item => item.isCover) && plan.photos.length > 0) {
    plan.photos[0].isCover = true
  }
}

async function setFloorPlanCover(planId: string, photoId: string) {
  const plan = floorPlansDraft.value.find(item => item.id === planId)
  if (!plan) return

  if (plan.persistedId && propertyId.value) {
    await propertyService.setFloorPlanPhotoCover(propertyId.value, plan.persistedId, photoId)
  }

  const index = plan.photos.findIndex(photo => photo.id === photoId)
  if (index < 0) return
  const [selected] = plan.photos.splice(index, 1)
  plan.photos.unshift(selected)
  plan.photos = plan.photos.map((photo, idx) => ({ ...photo, isCover: idx === 0 }))
}

onBeforeUnmount(() => {
  if (cepLookupTimer) {
    clearTimeout(cepLookupTimer)
  }
  propertyPhotos.value.forEach(revokeDraft)
  floorPlansDraft.value.forEach(plan => plan.photos.forEach(revokeDraft))
})

onMounted(async () => {
  catStore.fetchCategories()
  if (isEdit.value && propertyId.value) {
    await store.fetchProperty(propertyId.value)
    const p = store.currentProperty
    if (p) {
      form.value = {
        title: p.title,
        description: p.description ?? '',
        slug: (p as any).slug ?? '',
        operation: p.operation,
        propertyType: p.propertyType,
        status: p.status,
        condition: p.condition ?? undefined,
        referenceCode: p.referenceCode ?? '',
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
        floorNumber: p.floorNumber ?? undefined,
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
        attributes: p.attributes ?? {},
        categoryIds: p.categories?.map(c => c.id) ?? [],
      }

      floorPlansDraft.value = p.floorPlans.map(plan => ({
        id: plan.id,
        persistedId: plan.id,
        name: plan.name,
        area: plan.area ?? undefined,
        photos: plan.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          previewUrl: photo.url,
          persisted: true,
          isCover: photo.isCover,
        })),
      }))
    }
  }
})

const isSaving = ref(false)
const formError = ref<string | null>(null)

const generatedTitle = computed(() => {
  const parts: string[] = []
  
  if (form.value.bedrooms && form.value.bedrooms > 0) {
    parts.push(`${form.value.bedrooms}q`)
  }
  
  if (form.value.propertyType) {
    const typeMap: Record<string, string> = {
      'HOUSE': 'Casa',
      'APARTMENT': 'Apartamento',
      'LAND': 'Terreno',
      'COMMERCIAL': 'Comercial',
      'RURAL': 'Rural'
    }
    parts.push(typeMap[form.value.propertyType] || form.value.propertyType)
  }
  
  if (form.value.addressCity) {
    parts.push(`em ${form.value.addressCity}`)
  }
  
  if (form.value.operation) {
    const opMap: Record<string, string> = {
      'SALE': 'Venda',
      'RENT': 'Aluguel',
      'SEASONAL': 'Temporada'
    }
    parts.push(opMap[form.value.operation] || form.value.operation)
  }
  
  return parts.join(' - ')
})

const generatedDescription = computed(() => {
  const parts: string[] = ['Imóvel']
  
  if (form.value.areaTotal) {
    parts.push(`com ${form.value.areaTotal} m²`)
  }
  
  const features: string[] = []
  if (form.value.bedrooms && form.value.bedrooms > 0) {
    features.push(`${form.value.bedrooms} quarto(s)`)
  }
  if (form.value.suites && form.value.suites > 0) {
    features.push(`${form.value.suites} suíte(s)`)
  }
  if (form.value.bathrooms && form.value.bathrooms > 0) {
    features.push(`${form.value.bathrooms} banheiro(s)`)
  }
  if (form.value.parking && form.value.parking > 0) {
    features.push(`${form.value.parking} vaga(s) de garagem`)
  }
  
  if (features.length > 0) {
    return `${parts[0]} ${parts.slice(1).join(', ')}, ${features.join(', ')}.`
  }
  
  return parts.join(', ') + '.'
})

const generatedSlug = computed(() => {
  if (!form.value.title?.trim() && !form.value.bedrooms && !form.value.propertyType) {
    return ''
  }
  
  // Use provided title or fall back to generated title
  const titleToSlugify = form.value.title?.trim() || generatedTitle.value
  
  if (!titleToSlugify) {
    return ''
  }
  
  const base = titleToSlugify
    .toLowerCase()
    .replaceAll(/[àáäâã]/g, 'a')
    .replaceAll(/[èéëê]/g, 'e')
    .replaceAll(/[ìíïî]/g, 'i')
    .replaceAll(/[òóöôõ]/g, 'o')
    .replaceAll(/[ùúüû]/g, 'u')
    .replaceAll(/[ç]/g, 'c')
    .replaceAll(/[^a-z0-9]+/g, '-')       // Replace non-alphanumeric with single dash
    .replaceAll(/-+/g, '-')               // Collapse multiple dashes to single dash
    .replaceAll(/^-|-$/g, '')             // Remove leading/trailing dashes
  
  return base
})

const AMENITIES = [
  { key: 'piscina', label: 'Piscina' },
  { key: 'varanda', label: 'Varanda' },
  { key: 'academia', label: 'Academia' },
  { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'mobiliado', label: 'Mobiliado' },
  { key: 'aceita_pets', label: 'Aceita Pets' },
  { key: 'quintal', label: 'Quintal' },
  { key: 'sacada', label: 'Sacada' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'elevador', label: 'Elevador' },
]

function toggleAmenity(key: string) {
  const attrs = form.value.attributes ?? {}
  if (attrs[key]) {
    const { [key]: _, ...rest } = attrs
    form.value.attributes = rest
  } else {
    form.value.attributes = { ...attrs, [key]: true }
  }
}

function toggleCategory(id: string) {
  const ids = form.value.categoryIds ?? []
  if (ids.includes(id)) {
    form.value.categoryIds = ids.filter(i => i !== id)
  } else {
    form.value.categoryIds = [...ids, id]
  }
}

function onlyDigits(value: string | undefined) {
  return (value ?? '').replace(/\D/g, '')
}

function formatCep(value: string | undefined) {
  const digits = onlyDigits(value).slice(0, 8)
  if (digits.length <= 5) {
    return digits
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

async function fetchAddressByCep(digits: string, currentSequence: number) {
  cepStatus.value = 'loading'

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) {
      throw new Error('ViaCEP request failed')
    }

    const data = await response.json() as ViaCepResponse
    if (currentSequence !== cepLookupSequence) return

    if (data.erro) {
      cepStatus.value = 'not_found'
      return
    }

    form.value.addressStreet = data.logradouro || form.value.addressStreet
    form.value.addressNeighborhood = data.bairro || form.value.addressNeighborhood
    form.value.addressCity = data.localidade || form.value.addressCity
    form.value.addressState = data.uf || form.value.addressState
    form.value.addressCountry = 'BR'
    cepStatus.value = 'success'
  } catch {
    if (currentSequence === cepLookupSequence) {
      cepStatus.value = 'error'
    }
  }
}

watch(
  () => form.value.addressZip,
  (value) => {
    const formatted = formatCep(value)
    if ((value ?? '') !== formatted) {
      form.value.addressZip = formatted
      return
    }

    if (cepLookupTimer) {
      clearTimeout(cepLookupTimer)
    }

    const currentSequence = ++cepLookupSequence
    const digits = onlyDigits(value)
    if (digits.length !== 8) {
      cepStatus.value = 'idle'
      return
    }

    cepLookupTimer = setTimeout(() => {
      void fetchAddressByCep(digits, currentSequence)
    }, 350)
  }
)

async function generateTitleWithAi() {
  const title = await aiGenerateTitle({
    bedrooms: form.value.bedrooms?.toString(),
    bathrooms: form.value.bathrooms?.toString(),
    suites: form.value.suites?.toString(),
    propertyType: form.value.propertyType,
    city: form.value.addressCity,
    neighborhood: form.value.addressNeighborhood,
    price: form.value.price,
    currency: form.value.currency,
    operation: form.value.operation,
  })
  if (title) {
    form.value.title = title
  }
}

async function generateDescriptionWithAi() {
  const description = await aiGenerateDescription({
    bedrooms: form.value.bedrooms?.toString(),
    bathrooms: form.value.bathrooms?.toString(),
    suites: form.value.suites?.toString(),
    parking: form.value.parking?.toString(),
    areaTotal: form.value.areaTotal?.toString(),
    propertyType: form.value.propertyType,
    city: form.value.addressCity,
    neighborhood: form.value.addressNeighborhood,
    price: form.value.price,
    currency: form.value.currency,
    operation: form.value.operation,
  })
  if (description) {
    form.value.description = description
  }
}

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
    await uploadPropertyMedia(result.id)
    router.push(`/imoveis/${result.id}`)
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Erro ao salvar imóvel'
  } finally {
    isSaving.value = false
  }
}

async function uploadPropertyMedia(id: string) {
  const coverDraft = propertyPhotos.value.find(photo => photo.isCover) ?? propertyPhotos.value[0] ?? null
  let coverPhotoId: string | null = null

  for (const draft of propertyPhotos.value) {
    const photo = await propertyService.uploadPhoto(id, draft.file, draft.altText || undefined)
    if (draft === coverDraft) {
      coverPhotoId = photo.id
    }
  }

  if (coverPhotoId) {
    await propertyService.setCoverPhoto(id, coverPhotoId)
  }

  for (const planDraft of floorPlansDraft.value) {
    if (planDraft.persistedId) continue
    if (!planDraft.name.trim()) continue

    const plan = await propertyService.addFloorPlan(id, {
      name: planDraft.name.trim(),
      area: planDraft.area,
    })

    for (const photoDraft of planDraft.photos) {
      if (photoDraft.file) {
        await propertyService.uploadFloorPlanPhoto(id, plan.id, photoDraft.file)
      }
    }
  }
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white dark:focus:bg-slate-600 transition'
const labelClass = 'block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1'
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
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ isEdit ? 'Editar Imóvel' : 'Novo Imóvel' }}</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500">{{ isEdit ? 'Atualize as informações do imóvel' : 'Preencha os dados do novo imóvel' }}</p>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="max-w-4xl space-y-6">

      <!-- Error -->
      <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
        {{ formError }}
      </div>

      <!-- Characteristics (FIRST) -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Características</h2>
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
          <div>
            <label :class="labelClass">Andar</label>
            <input v-model.number="form.floorNumber" type="number" min="0" :class="inputClass" placeholder="Ex.: 5" />
          </div>
          <div>
            <label :class="labelClass">Condição</label>
            <select v-model="form.condition" :class="inputClass">
              <option value="">Não informado</option>
              <option value="NEW">Novo</option>
              <option value="USED">Usado</option>
              <option value="UNDER_CONSTRUCTION">Em construção</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Código de referência</label>
            <input v-model="form.referenceCode" type="text" :class="inputClass" placeholder="Ex.: AP-001" />
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Valores</h2>
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

      <!-- Operation/Type with Preview -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Operação e tipo</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        <div v-if="generatedTitle" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p class="text-xs text-blue-900 dark:text-blue-300">
            <strong>Preview do título:</strong> {{ generatedTitle }}
          </p>
        </div>
      </div>

      <!-- Amenities -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Comodidades</h2>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <label
            v-for="a in AMENITIES"
            :key="a.key"
            class="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="!!(form.attributes ?? {})[a.key]"
              @change="toggleAmenity(a.key)"
              class="w-4 h-4 accent-indigo-600 rounded"
            />
            <span class="text-sm text-slate-600 dark:text-slate-300">{{ a.label }}</span>
          </label>
        </div>
      </div>

      <!-- Categories -->
      <div v-if="catStore.categories.length" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Categorias</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in catStore.categories"
            :key="cat.id"
            type="button"
            @click="toggleCategory(cat.id)"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-medium border transition',
              (form.categoryIds ?? []).includes(cat.id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            ]"
          >
            {{ cat.name }}
            <span v-if="cat.isGlobal" class="ml-1 opacity-60 text-[10px]">Sistema</span>
          </button>
        </div>
      </div>

      <!-- Media -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6 space-y-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">Mídia</h2>

        <div>
          <div class="flex items-center justify-between gap-3 mb-3">
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Fotos do imóvel</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Selecione uma ou mais imagens e marque a de destaque.</p>
            </div>
            <label class="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 cursor-pointer transition">
              Adicionar fotos
              <input type="file" accept="image/*" multiple class="hidden" @change="handlePropertyPhotosChange" />
            </label>
          </div>

          <div v-if="propertyPhotos.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
              v-for="photo in propertyPhotos"
              :key="photo.id"
              class="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
              :class="photo.isCover ? 'ring-2 ring-indigo-500 border-indigo-400' : ''"
            >
              <img :src="photo.previewUrl" alt="" class="w-full h-28 object-cover" />
              <div class="p-2 space-y-2">
                <input
                  v-model="photo.altText"
                  type="text"
                  class="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  placeholder="Texto alternativo"
                />
                <div class="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    @click="setPropertyCover(photo.id)"
                    class="text-[11px] font-semibold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {{ photo.isCover ? 'Imagem de destaque' : 'Definir destaque' }}
                  </button>
                  <button
                    type="button"
                    @click="removePropertyPhoto(photo.id)"
                    class="text-[11px] font-semibold px-2 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <span v-if="photo.isCover" class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Destaque
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 dark:text-slate-500">Nenhuma foto selecionada.</p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Plantas</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Cada planta pode ter uma ou mais imagens.</p>
            </div>
            <button
              type="button"
              @click="addFloorPlan"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 transition"
            >
              Adicionar planta
            </button>
          </div>

          <div v-if="floorPlansDraft.length" class="space-y-4">
            <div
              v-for="plan in floorPlansDraft"
              :key="plan.id"
              class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-4 space-y-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <input
                    v-model="plan.name"
                    type="text"
                    :disabled="!!plan.persistedId"
                    :class="inputClass"
                    placeholder="Nome da planta"
                  />
                  <input
                    v-model.number="plan.area"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="!!plan.persistedId"
                    :class="inputClass"
                    placeholder="Área (m²)"
                  />
                </div>
                <button
                  type="button"
                  @click="removeFloorPlan(plan.id)"
                  class="px-3 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30"
                >
                  Remover planta
                </button>
              </div>

              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500">
                    {{ plan.persistedId ? 'Planta salva' : 'Nova planta' }}
                  </p>
                </div>
                <label class="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800 cursor-pointer transition">
                  Adicionar imagens da planta
                  <input type="file" accept="image/*" multiple class="hidden" @change="event => handleFloorPlanPhotosChange(plan.id, event)" />
                </label>
              </div>

              <div v-if="plan.photos.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div
                  v-for="(photo, index) in plan.photos"
                  :key="photo.id"
                  class="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  :class="photo.isCover ? 'sm:col-span-2 sm:row-span-2' : ''"
                >
                  <img
                    :src="photo.previewUrl"
                    alt=""
                    class="w-full object-cover transition duration-300 group-hover:scale-105"
                    :class="photo.isCover ? 'h-56' : 'h-24'"
                  />
                  <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-end justify-between p-2">
                    <button
                      type="button"
                      @click="setFloorPlanCover(plan.id, photo.id)"
                      class="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/90 text-indigo-700 opacity-0 group-hover:opacity-100 transition"
                    >
                      {{ photo.isCover ? 'Destaque' : 'Definir destaque' }}
                    </button>
                    <button
                      type="button"
                      @click="removeFloorPlanPhoto(plan.id, photo.id)"
                      class="px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      Remover
                    </button>
                  </div>
                  <span
                    v-if="photo.isCover"
                    class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white"
                  >
                    Destaque
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 dark:text-slate-500">Nenhuma planta adicionada.</p>
        </div>
      </div>

      <!-- Address -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Endereço</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">CEP</label>
            <input
              v-model="form.addressZip"
              type="text"
              :class="inputClass"
              placeholder="00000-000"
              inputmode="numeric"
              autocomplete="postal-code"
              maxlength="9"
            />
            <p v-if="cepStatus === 'loading'" class="mt-1 text-xs text-indigo-600 dark:text-indigo-300">Buscando CEP...</p>
            <p v-else-if="cepStatus === 'not_found'" class="mt-1 text-xs text-amber-600 dark:text-amber-300">CEP não encontrado. Preencha o endereço manualmente.</p>
            <p v-else-if="cepStatus === 'error'" class="mt-1 text-xs text-red-600 dark:text-red-300">Não foi possível consultar o CEP agora.</p>
            <p v-else-if="cepStatus === 'success'" class="mt-1 text-xs text-emerald-600 dark:text-emerald-300">Endereço preenchido pelo CEP.</p>
          </div>
          <div>
            <label :class="labelClass">País</label>
            <input v-model="form.addressCountry" type="text" :class="inputClass" placeholder="BR" maxlength="2" />
          </div>
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
            <label :class="labelClass">Cidade</label>
            <input v-model="form.addressCity" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Estado</label>
            <input v-model="form.addressState" type="text" :class="inputClass" placeholder="SP" maxlength="2" />
          </div>
          <div class="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <p class="text-xs text-slate-400 dark:text-slate-500 mb-3">Coordenadas opcionais controlam o ponto exato exibido no mapa público.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label :class="labelClass">Latitude</label>
                <input v-model.number="form.lat" type="number" step="any" :class="inputClass" placeholder="-23.55052" />
              </div>
              <div>
                <label :class="labelClass">Longitude</label>
                <input v-model.number="form.lng" type="number" step="any" :class="inputClass" placeholder="-46.63331" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final: Title, Description, Slug (LAST) -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <h2 class="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-5">Título, descrição e URL</h2>
        
        <!-- Title with Auto-generated Preview and AI Button -->
        <div class="grid grid-cols-1 gap-4 mb-6">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label :class="labelClass">Título *</label>
              <button
                type="button"
                @click="generateTitleWithAi"
                :disabled="isLoadingTitle"
                title="Gerar título com IA"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg v-if="!isLoadingTitle" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
            <div v-if="generatedTitle && !form.title" class="mb-2 text-xs italic text-slate-400 dark:text-slate-500">
              Sugestão: <span class="text-slate-600 dark:text-slate-300">{{ generatedTitle }}</span>
            </div>
            <input 
              v-model="form.title" 
              type="text" 
              :class="inputClass" 
              :placeholder="generatedTitle || 'Ex.: Apartamento 3 quartos no centro'" 
              required 
            />
          </div>
          
          <!-- Description with Auto-generated and AI Button -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label :class="labelClass">Descrição</label>
              <button
                type="button"
                @click="generateDescriptionWithAi"
                :disabled="isLoadingDescription"
                title="Gerar descrição com IA"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg v-if="!isLoadingDescription" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
            <div v-if="generatedDescription && !form.description" class="mb-2 text-xs italic text-slate-400 dark:text-slate-500">
              Sugestão: <span class="text-slate-600 dark:text-slate-300">{{ generatedDescription }}</span>
            </div>
            <textarea 
              v-model="form.description" 
              rows="4" 
              :class="inputClass" 
              :placeholder="generatedDescription || 'Descreva o imóvel...'" 
            />
          </div>
          
          <!-- Slug -->
          <div>
            <label :class="labelClass">URL amigável (slug)</label>
            <div v-if="generatedSlug && !form.slug" class="mb-2 text-xs italic text-slate-400 dark:text-slate-500">
              Sugestão: <code class="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{{ generatedSlug }}</code>
            </div>
            <input 
              v-model="form.slug" 
              type="text" 
              :class="inputClass" 
              :placeholder="generatedSlug || 'auto-gerado-a-partir-do-titulo'" 
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pb-8">
        <RouterLink
          to="/imoveis"
          class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
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
