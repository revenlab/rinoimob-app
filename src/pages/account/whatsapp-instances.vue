<template>
  <div class="min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">WhatsApp Instances</h1>
        <p class="text-gray-400">Configure suas instâncias de WhatsApp para integração com leads</p>
      </div>

      <!-- Instances List -->
      <div class="space-y-4">
        <div v-if="instances.length === 0" class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-8 text-center">
          <p class="text-gray-400">Nenhuma instância de WhatsApp configurada</p>
        </div>

        <div v-else>
          <!-- Instances Table -->
          <div class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/20 bg-white/5">
                  <th class="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Número</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Atribuído a</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Auto-criar Leads</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="instance in instances" :key="instance.id" class="border-b border-white/20 hover:bg-white/5 transition">
                  <td class="px-6 py-4 text-sm">{{ instance.displayName }}</td>
                  <td class="px-6 py-4 text-sm">{{ instance.phoneNumber || '-' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-500/20 text-green-300': instance.status === 'CONNECTED',
                        'bg-yellow-500/20 text-yellow-300': instance.status === 'CONNECTING',
                        'bg-red-500/20 text-red-300': instance.status === 'DISCONNECTED',
                      }"
                    >
                      <span class="w-2 h-2 rounded-full" :class="{
                        'bg-green-400': instance.status === 'CONNECTED',
                        'bg-yellow-400': instance.status === 'CONNECTING',
                        'bg-red-400': instance.status === 'DISCONNECTED',
                      }"></span>
                      {{ instance.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span class="text-gray-300">
                      {{ instance.assignedToUserName || 'Aberto para todos' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="instance.autoCreateLeadsFromUnknownNumbers"
                        @change="toggleAutoCreateLeads(instance)"
                        :disabled="isUpdating[instance.id]"
                        class="w-4 h-4"
                      />
                      <span class="text-xs text-gray-400">
                        {{ instance.autoCreateLeadsFromUnknownNumbers ? 'Ativado' : 'Desativado' }}
                      </span>
                    </label>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      @click="openDetails(instance)"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="selectedInstance" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div class="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 max-w-md w-full p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">{{ selectedInstance.displayName }}</h2>
                <button @click="selectedInstance = null" class="text-gray-400 hover:text-white">✕</button>
              </div>

              <div class="space-y-4">
                <div>
                  <p class="text-xs text-gray-400 mb-1">Nome da Instância</p>
                  <p class="text-sm font-mono">{{ selectedInstance.instanceName }}</p>
                </div>

                <div>
                  <p class="text-xs text-gray-400 mb-1">Número de Telefone</p>
                  <p class="text-sm">{{ selectedInstance.phoneNumber || 'Não configurado' }}</p>
                </div>

                <div>
                  <p class="text-xs text-gray-400 mb-1">Status</p>
                  <p class="text-sm">{{ selectedInstance.status }}</p>
                </div>

                <div>
                  <label class="block text-xs text-gray-400 mb-2">Atribuir a Usuário</label>
                  <select
                    v-model="editingAssignedUserId"
                    :disabled="isUpdating[selectedInstance.id] || isLoadingUsers"
                    class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Aberto para todos</option>
                    <option v-for="user in tenantUsers" :key="user.id" :value="user.id">
                      {{ user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email }}
                    </option>
                  </select>
                  <button
                    v-if="editingAssignedUserId !== (selectedInstance.assignedToUserId || '')"
                    @click="updateAssignedUser"
                    :disabled="isUpdating[selectedInstance.id]"
                    class="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar
                  </button>
                </div>

                <div>
                  <p class="text-xs text-gray-400 mb-1">Criar Leads Automaticamente</p>
                  <label class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="selectedInstance.autoCreateLeadsFromUnknownNumbers"
                      @change="toggleAutoCreateLeads(selectedInstance)"
                      class="w-4 h-4"
                    />
                    <span class="text-sm">
                      {{ selectedInstance.autoCreateLeadsFromUnknownNumbers ? 'Números desconhecidos criarão novos leads' : 'Desativado' }}
                    </span>
                  </label>
                </div>

                <div class="text-xs text-gray-500 pt-2">
                  <p>Criada em: {{ new Date(selectedInstance.createdAt).toLocaleString('pt-BR') }}</p>
                </div>
              </div>

              <button
                @click="selectedInstance = null"
                class="w-full mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition"
              >
                Fechar
              </button>
            </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WhatsappInstance } from '@/types/whatsapp'
import type { UserSummary } from '@/types/lead'
import whatsappService from '@/services/whatsapp'
import userService from '@/services/user'

const instances = ref<WhatsappInstance[]>([])
const selectedInstance = ref<WhatsappInstance | null>(null)
const isUpdating = ref<Record<string, boolean>>({})
const successMessage = ref('')
const errorMessage = ref('')
const tenantUsers = ref<UserSummary[]>([])
const isLoadingUsers = ref(false)
const editingAssignedUserId = ref('')

const loadInstances = async () => {
  try {
    instances.value = await whatsappService.listInstances()
  } catch (error) {
    console.error('Erro ao carregar instâncias:', error)
    errorMessage.value = 'Erro ao carregar instâncias de WhatsApp'
    setTimeout(() => (errorMessage.value = ''), 5000)
  }
}

const loadTenantUsers = async () => {
  try {
    isLoadingUsers.value = true
    tenantUsers.value = await userService.listActive()
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
  } finally {
    isLoadingUsers.value = false
  }
}

const toggleAutoCreateLeads = async (instance: WhatsappInstance) => {
  const newValue = !instance.autoCreateLeadsFromUnknownNumbers
  isUpdating.value[instance.id] = true

  try {
    const updated = await whatsappService.updateInstanceConfig(instance.id, {
      autoCreateLeadsFromUnknownNumbers: newValue,
    })

    // Update the instance in the list
    const index = instances.value.findIndex(i => i.id === instance.id)
    if (index !== -1) {
      instances.value[index] = updated
    }

    // Update selected instance if it's open
    if (selectedInstance.value?.id === instance.id) {
      selectedInstance.value = updated
    }

    successMessage.value = newValue ? 'Auto-criação de leads ativada' : 'Auto-criação de leads desativada'
    setTimeout(() => (successMessage.value = ''), 5000)
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    errorMessage.value = 'Erro ao atualizar configuração'
    setTimeout(() => (errorMessage.value = ''), 5000)
    // Revert the checkbox
    instance.autoCreateLeadsFromUnknownNumbers = !newValue
  } finally {
    isUpdating.value[instance.id] = false
  }
}

const updateAssignedUser = async () => {
  if (!selectedInstance.value) return

  isUpdating.value[selectedInstance.value.id] = true

  try {
    const updated = await whatsappService.updateInstanceConfig(selectedInstance.value.id, {
      assignedToUserId: editingAssignedUserId.value || null,
    })

    // Update the instance in the list
    const index = instances.value.findIndex(i => i.id === selectedInstance.value?.id)
    if (index !== -1) {
      instances.value[index] = updated
    }

    // Update selected instance
    selectedInstance.value = updated
    editingAssignedUserId.value = updated.assignedToUserId || ''

    successMessage.value = 'Atribuição atualizada com sucesso'
    setTimeout(() => (successMessage.value = ''), 5000)
  } catch (error) {
    console.error('Erro ao atualizar atribuição:', error)
    errorMessage.value = 'Erro ao atualizar atribuição'
    setTimeout(() => (errorMessage.value = ''), 5000)
  } finally {
    isUpdating.value[selectedInstance.value.id] = false
  }
}

const openDetails = (instance: WhatsappInstance) => {
  selectedInstance.value = instance
  editingAssignedUserId.value = instance.assignedToUserId || ''
}

onMounted(() => {
  loadInstances()
  loadTenantUsers()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
