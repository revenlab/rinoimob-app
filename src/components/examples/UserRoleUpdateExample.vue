<template>
  <div>
    <!-- Example: User Role Assignment with 403 Error Handling -->
    <button
      @click="handleUpdateRole"
      :disabled="loading"
      class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
    >
      {{ loading ? 'Atualizando...' : 'Atualizar Função' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ApiError } from '@/lib/api'
import { useNotification } from '@/composables/useNotification'
import userManagementService from '@/services/userManagement'

const loading = ref(false)
const { showError, showSuccess } = useNotification()

const handleUpdateRole = async () => {
  loading.value = true
  try {
    await userManagementService.assignRole('user-id-here', {
      roleId: 'role-id-here',
    })
    showSuccess('Função atualizada com sucesso!')
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        // Motivo específico vem do backend via X-Reason header
        showError(err.reason || err.message)
      } else if (err.status === 404) {
        showError('Usuário ou função não encontrada')
      } else {
        showError(err.message)
      }
    } else {
      showError('Erro ao atualizar função')
    }
  } finally {
    loading.value = false
  }
}
</script>
