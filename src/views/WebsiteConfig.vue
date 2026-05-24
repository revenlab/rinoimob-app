<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Configurações do Site</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Personalize a identidade visual e os textos do seu site público.</p>
      </div>
    </template>

    <div class="space-y-6">
      <div v-if="isLoading" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-500 dark:text-slate-400">
        Carregando configurações...
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-3">
        <form class="space-y-6 xl:col-span-2" @submit.prevent="saveConfig">
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Identidade Visual</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Atualize logotipo, favicon e paleta do site.</p>
            </div>

            <div class="grid gap-5 lg:grid-cols-2">
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Logo</label>
                <div class="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                  <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                    <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo atual" class="h-full w-full object-contain">
                    <span v-else class="text-xs text-slate-400">Sem logo</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      @click="logoInputRef?.click()"
                      :disabled="isUploadingLogo"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {{ isUploadingLogo ? 'Enviando...' : 'Enviar logo' }}
                    </button>
                    <button
                      type="button"
                      @click="removeLogo"
                      :disabled="isDeletingLogo || !config.logoUrl"
                      class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                    >
                      {{ isDeletingLogo ? 'Removendo...' : 'Remover' }}
                    </button>
                  </div>
                </div>
                <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="handleLogoSelected">
              </div>

              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Favicon</label>
                <div class="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                  <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                    <img v-if="config.faviconUrl" :src="config.faviconUrl" alt="Favicon atual" class="h-10 w-10 object-contain">
                    <span v-else class="text-xs text-slate-400">Sem favicon</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      @click="faviconInputRef?.click()"
                      :disabled="isUploadingFavicon"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {{ isUploadingFavicon ? 'Enviando...' : 'Enviar favicon' }}
                    </button>
                    <button
                      type="button"
                      @click="removeFavicon"
                      :disabled="isDeletingFavicon || !config.faviconUrl"
                      class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                    >
                      {{ isDeletingFavicon ? 'Removendo...' : 'Remover' }}
                    </button>
                  </div>
                </div>
                <input ref="faviconInputRef" type="file" accept="image/*,.ico" class="hidden" @change="handleFaviconSelected">
              </div>
            </div>

            <!-- Banner Principal (Hero) -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">Banner Principal do Site</label>
              <div class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 overflow-hidden">
                <div class="relative w-full bg-slate-100 dark:bg-slate-900" style="aspect-ratio: 16/6">
                  <img
                    v-if="config.heroImageUrl"
                    :src="config.heroImageUrl"
                    alt="Banner do hero"
                    class="absolute inset-0 w-full h-full object-cover"
                  >
                  <div v-else class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm text-slate-400">Sem imagem de destaque</span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    @click="heroImageInputRef?.click()"
                    :disabled="isUploadingHeroImage"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {{ isUploadingHeroImage ? 'Enviando...' : 'Enviar banner' }}
                  </button>
                  <button
                    type="button"
                    @click="removeHeroImage"
                    :disabled="isDeletingHeroImage || !config.heroImageUrl"
                    class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                  >
                    {{ isDeletingHeroImage ? 'Removendo...' : 'Remover' }}
                  </button>
                  <span class="text-xs text-slate-400 ml-auto">Recomendado: 1440×560px (16:5.5)</span>
                </div>
              </div>
              <input ref="heroImageInputRef" type="file" accept="image/*" class="hidden" @change="handleHeroImageSelected">
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Cor primária</label>
                <div class="flex items-center gap-3">
                  <input :value="primaryColorValue" type="color" class="h-11 w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1" @input="updateColor('primaryColor', $event)">
                  <input v-model="primaryColorValue" type="text" placeholder="#0066FF" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" @blur="normalizeColor('primaryColor')">
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Cor secundária</label>
                <div class="flex items-center gap-3">
                  <input :value="secondaryColorValue" type="color" class="h-11 w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1" @input="updateColor('secondaryColor', $event)">
                  <input v-model="secondaryColorValue" type="text" placeholder="#FF6B35" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" @blur="normalizeColor('secondaryColor')">
                </div>
              </div>
            </div>
          </section>

          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Informações da Empresa</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Defina textos institucionais exibidos na home.</p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nome da empresa</label>
                <input v-model="config.companyName" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Título principal</label>
                <input v-model="config.heroTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Descrição</label>
              <textarea v-model="config.description" rows="4" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Subtítulo principal</label>
              <textarea v-model="config.heroSubtitle" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
            </div>
          </section>

          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Contato</h2>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Telefone</label>
                <input v-model="config.phone" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">E-mail</label>
                <input v-model="config.email" type="email" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Endereço</label>
              <input v-model="config.address" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </div>
          </section>

          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Redes Sociais</h2>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Instagram</label>
                <input v-model="config.instagramUrl" type="url" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Facebook</label>
                <input v-model="config.facebookUrl" type="url" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">WhatsApp</label>
              <input v-model="config.whatsappNumber" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </div>
          </section>

          <div class="flex justify-end">
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {{ isSaving ? 'Salvando...' : 'Salvar configurações' }}
            </button>
          </div>
        </form>

        <aside class="space-y-6">
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 sticky top-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Prévia do Site</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Resumo rápido da vitrine pública.</p>
              </div>
              <a
                v-if="publicWebsiteUrl"
                :href="publicWebsiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Ver site
              </a>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div class="p-4 text-white" :style="{ backgroundColor: previewPrimaryColor }">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/20">
                    <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo" class="h-full w-full object-contain">
                    <span v-else class="text-lg font-semibold">{{ previewCompanyInitial }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold">{{ config.companyName || 'Sua imobiliária' }}</p>
                    <p class="text-xs text-white/80">{{ authStore.currentTenantSubdomain ? `@${authStore.currentTenantSubdomain}` : 'Tenant atual' }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4 p-4">
                <div class="rounded-xl p-4" :style="{ backgroundColor: previewSecondaryColor }">
                  <p class="text-sm font-semibold text-slate-900">{{ config.heroTitle || 'Destaque sua marca' }}</p>
                  <p class="mt-2 text-xs text-slate-700">{{ config.heroSubtitle || 'Mostre seus imóveis com uma identidade visual consistente.' }}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
                  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ config.description || 'Adicione uma descrição para apresentar a imobiliária ao público.' }}</p>
                </div>

                <div class="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <p><span class="font-medium text-slate-900 dark:text-white">Telefone:</span> {{ config.phone || 'Não informado' }}</p>
                  <p><span class="font-medium text-slate-900 dark:text-white">E-mail:</span> {{ config.email || 'Não informado' }}</p>
                  <p><span class="font-medium text-slate-900 dark:text-white">WhatsApp:</span> {{ config.whatsappNumber || 'Não informado' }}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useNotification } from '@/composables/useNotification'
import websiteConfigService from '@/services/websiteConfig'
import { useAuthStore } from '@/stores/auth'
import type { TenantWebsiteConfig } from '@/types/tenantsAdmin'

const DEFAULT_PRIMARY_COLOR = '#0066FF'
const DEFAULT_SECONDARY_COLOR = '#FF6B35'
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/

const authStore = useAuthStore()
const { showError, showSuccess } = useNotification()

const config = ref<Partial<TenantWebsiteConfig>>({})
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingLogo = ref(false)
const isDeletingLogo = ref(false)
const isUploadingFavicon = ref(false)
const isDeletingFavicon = ref(false)
const isUploadingHeroImage = ref(false)
const isDeletingHeroImage = ref(false)
const logoInputRef = ref<HTMLInputElement | null>(null)
const faviconInputRef = ref<HTMLInputElement | null>(null)
const heroImageInputRef = ref<HTMLInputElement | null>(null)

const primaryColorValue = computed({
  get: () => config.value.primaryColor ?? DEFAULT_PRIMARY_COLOR,
  set: value => {
    config.value.primaryColor = value
  },
})

const secondaryColorValue = computed({
  get: () => config.value.secondaryColor ?? DEFAULT_SECONDARY_COLOR,
  set: value => {
    config.value.secondaryColor = value
  },
})

const previewPrimaryColor = computed(() => normalizeHexColor(config.value.primaryColor) ?? DEFAULT_PRIMARY_COLOR)
const previewSecondaryColor = computed(() => normalizeHexColor(config.value.secondaryColor) ?? DEFAULT_SECONDARY_COLOR)
const previewCompanyInitial = computed(() => (config.value.companyName?.trim().charAt(0) || 'R').toUpperCase())
const publicWebsiteUrl = computed(() => buildWebsiteUrl(authStore.currentTenantSubdomain))

function normalizeHexColor(value?: string | null): string | null {
  if (!value) return null
  const normalized = value.trim().toUpperCase()
  return HEX_COLOR_REGEX.test(normalized) ? normalized : null
}

function buildWebsiteUrl(subdomain: string | null): string | null {
  if (!subdomain || typeof window === 'undefined') return null

  if (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')) {
    return `http://${subdomain}.localhost:3000`
  }

  const hostParts = window.location.hostname.split('.')
  const websiteHost = hostParts.length > 2
    ? [subdomain, ...hostParts.slice(1)].join('.')
    : `${subdomain}.${window.location.hostname}`

  return `${window.location.protocol}//${websiteHost}`
}

function applyConfig(data: TenantWebsiteConfig) {
  config.value = { ...data }
}

function updateColor(field: 'primaryColor' | 'secondaryColor', event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  config.value[field] = target.value.toUpperCase()
}

function normalizeColor(field: 'primaryColor' | 'secondaryColor') {
  const normalized = normalizeHexColor(config.value[field])
  config.value[field] = normalized ?? null
}

function resetFileInput(target: HTMLInputElement | null) {
  if (target) {
    target.value = ''
  }
}

async function loadConfig() {
  isLoading.value = true
  try {
    const response = await websiteConfigService.getConfig()
    applyConfig(response)
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao carregar configurações do site')
  } finally {
    isLoading.value = false
  }
}

async function saveConfig() {
  isSaving.value = true
  try {
    normalizeColor('primaryColor')
    normalizeColor('secondaryColor')
    const response = await websiteConfigService.updateConfig(config.value)
    applyConfig(response)
    showSuccess('Configurações salvas!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao salvar configurações do site')
  } finally {
    isSaving.value = false
  }
}

async function handleLogoSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingLogo.value = true
  try {
    const response = await websiteConfigService.uploadLogo(target.files[0])
    applyConfig(response)
    showSuccess('Logo atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar logo')
  } finally {
    isUploadingLogo.value = false
    resetFileInput(target)
  }
}

async function removeLogo() {
  if (!config.value.logoUrl) return

  isDeletingLogo.value = true
  try {
    const response = await websiteConfigService.deleteLogo()
    applyConfig(response)
    showSuccess('Logo removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover logo')
  } finally {
    isDeletingLogo.value = false
    resetFileInput(logoInputRef.value)
  }
}

async function handleFaviconSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingFavicon.value = true
  try {
    const response = await websiteConfigService.uploadFavicon(target.files[0])
    applyConfig(response)
    showSuccess('Favicon atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar favicon')
  } finally {
    isUploadingFavicon.value = false
    resetFileInput(target)
  }
}

async function removeFavicon() {
  if (!config.value.faviconUrl) return

  isDeletingFavicon.value = true
  try {
    const response = await websiteConfigService.deleteFavicon()
    applyConfig(response)
    showSuccess('Favicon removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover favicon')
  } finally {
    isDeletingFavicon.value = false
    resetFileInput(faviconInputRef.value)
  }
}

async function handleHeroImageSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingHeroImage.value = true
  try {
    const response = await websiteConfigService.uploadHeroImage(target.files[0])
    applyConfig(response)
    showSuccess('Banner do hero atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar banner')
  } finally {
    isUploadingHeroImage.value = false
    resetFileInput(target)
  }
}

async function removeHeroImage() {
  if (!config.value.heroImageUrl) return

  isDeletingHeroImage.value = true
  try {
    const response = await websiteConfigService.deleteHeroImage()
    applyConfig(response)
    showSuccess('Banner removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover banner')
  } finally {
    isDeletingHeroImage.value = false
    resetFileInput(heroImageInputRef.value)
  }
}

onMounted(() => {
  loadConfig()
})
</script>
