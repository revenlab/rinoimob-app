<template>
  <div class="min-h-screen p-6">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Domínio Customizado</h1>
        <p class="text-gray-400">Configure um domínio personalizado para seu site</p>
      </div>

      <!-- Main Glass Card -->
      <div class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl p-8">
        <!-- Domain Input Section -->
        <div class="mb-8">
          <label for="domain" class="block text-sm font-medium mb-3">
            Seu Domínio
          </label>
          <div class="space-y-2">
            <input
              id="domain"
              v-model="domainInput"
              type="text"
              placeholder="exemplo.com.br"
              class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              @keyup="validateDomain"
              :disabled="isLoading"
            />
            <p class="text-xs text-gray-400">
              Digite seu domínio sem "https://" ou "www"
            </p>
          </div>
        </div>

        <!-- Validation Message -->
        <div v-if="domainError" class="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p class="text-red-200 text-sm">{{ domainError }}</p>
        </div>
        <div v-else-if="domainInput && isValidDomain" class="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p class="text-green-200 text-sm">✓ Domínio válido</p>
        </div>

        <!-- Current Domain Display -->
        <div v-if="currentDomain" class="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p class="text-xs text-gray-400 mb-1">Domínio Atual</p>
          <p class="text-blue-300 font-mono">{{ currentDomain }}</p>
        </div>

        <!-- Preview -->
        <div v-if="domainInput && isValidDomain" class="mb-8 p-4 bg-white/5 border border-white/20 rounded-lg">
          <p class="text-xs text-gray-400 mb-2">Preview</p>
          <p class="text-gray-300 text-sm">
            Seu site estará acessível em:
            <span class="text-blue-400 font-mono">https://{{ domainInput }}</span>
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4">
          <button
            @click="saveDomain"
            :disabled="!isValidDomain || isLoading || !domainChanged"
            class="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </span>
            <span v-else>Salvar Domínio</span>
          </button>
          <button
            v-if="domainChanged"
            @click="cancelEdit"
            :disabled="isLoading"
            class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>

        <!-- Remove Domain Button -->
        <div v-if="currentDomain" class="mt-8 pt-8 border-t border-white/10">
          <button
            @click="removeDomain"
            :disabled="isLoading"
            class="w-full px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-medium rounded-lg transition disabled:opacity-50"
          >
            {{ isLoading ? 'Removendo...' : 'Remover Domínio' }}
          </button>
        </div>
      </div>

      <!-- Info Section -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-6">
          <h3 class="text-lg font-semibold mb-3">📋 Passos</h3>
          <ol class="space-y-2 text-sm text-gray-300">
            <li>1. Digite seu domínio aqui</li>
            <li>2. Clique em "Salvar Domínio"</li>
            <li>3. Configure os registros DNS</li>
            <li>4. Seu site estará pronto!</li>
          </ol>
        </div>

        <div class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-6">
          <h3 class="text-lg font-semibold mb-3">🔧 Configuração DNS</h3>
          <p class="text-sm text-gray-300 mb-2">
            Adicione um registro CNAME:
          </p>
          <code class="block text-xs bg-black/30 p-3 rounded border border-white/10 text-gray-200 overflow-x-auto">
            seu-dominio.com.br → rinoimob.com.br
          </code>
        </div>
      </div>

      <!-- Error Toast -->
      <Teleport to="body">
        <Transition name="slide">
          <div
            v-if="errorMessage"
            class="fixed bottom-6 right-6 max-w-sm px-6 py-4 bg-red-500/90 border border-red-400/50 rounded-lg shadow-lg text-white"
          >
            {{ errorMessage }}
          </div>
        </Transition>
      </Teleport>

      <!-- Success Toast -->
      <Teleport to="body">
        <Transition name="slide">
          <div
            v-if="successMessage"
            class="fixed bottom-6 right-6 max-w-sm px-6 py-4 bg-green-500/90 border border-green-400/50 rounded-lg shadow-lg text-white"
          >
            {{ successMessage }}
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import websiteConfigService from '@/services/websiteConfig'

const domainInput = ref('')
const currentDomain = ref<string | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const domainError = ref('')

// Domain validation regex - RFC 1123
const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^\.?$/

const isValidDomain = computed(() => {
  if (!domainInput.value) return false
  const domain = domainInput.value.trim()
  return domain.length > 0 && domain.length <= 255 && domainRegex.test(domain)
})

const domainChanged = computed(() => {
  return domainInput.value.trim() !== (currentDomain.value || '')
})

const validateDomain = () => {
  if (!domainInput.value) {
    domainError.value = ''
    return
  }

  const domain = domainInput.value.trim()

  if (domain.length > 255) {
    domainError.value = 'Domínio muito longo (máximo 255 caracteres)'
    return
  }

  if (!domainRegex.test(domain)) {
    domainError.value = 'Formato de domínio inválido'
    return
  }

  domainError.value = ''
}

const loadCurrentDomain = async () => {
  try {
    const data = await websiteConfigService.getCustomDomain()
    currentDomain.value = data.customDomain
    domainInput.value = data.customDomain || ''
  } catch (error) {
    console.error('Erro ao carregar domínio:', error)
    errorMessage.value = 'Erro ao carregar configuração de domínio'
    setTimeout(() => (errorMessage.value = ''), 5000)
  }
}

const saveDomain = async () => {
  if (!isValidDomain.value) {
    domainError.value = 'Domínio inválido'
    return
  }

  isLoading.value = true
  try {
    const newDomain = domainInput.value.trim() || null
    const result = await websiteConfigService.updateCustomDomain(newDomain)
    currentDomain.value = result.customDomain
    successMessage.value = newDomain ? 'Domínio atualizado com sucesso!' : 'Domínio removido com sucesso!'
    setTimeout(() => (successMessage.value = ''), 5000)
  } catch (error: any) {
    console.error('Erro ao salvar domínio:', error)
    const message = error?.response?.data?.message || 'Erro ao salvar domínio'
    errorMessage.value = message
    setTimeout(() => (errorMessage.value = ''), 5000)
  } finally {
    isLoading.value = false
  }
}

const removeDomain = async () => {
  if (!confirm('Tem certeza que deseja remover o domínio customizado?')) {
    return
  }

  isLoading.value = true
  try {
    await websiteConfigService.updateCustomDomain(null)
    currentDomain.value = null
    domainInput.value = ''
    successMessage.value = 'Domínio removido com sucesso!'
    setTimeout(() => (successMessage.value = ''), 5000)
  } catch (error: any) {
    console.error('Erro ao remover domínio:', error)
    errorMessage.value = 'Erro ao remover domínio'
    setTimeout(() => (errorMessage.value = ''), 5000)
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  domainInput.value = currentDomain.value || ''
  domainError.value = ''
}

onMounted(() => {
  loadCurrentDomain()
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
