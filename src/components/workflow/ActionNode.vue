<template>
  <div class="px-4 py-3 bg-green-500 text-white rounded-xl shadow-lg border-2 border-green-600 min-w-[180px]">
    <Handle type="target" :position="Position.Top" />
    <div class="flex items-center justify-between mb-2">
      <BoltIcon class="w-6 h-6" />
    </div>
    <div class="font-bold text-sm mb-1">Ação</div>
    <div class="text-xs opacity-80 leading-tight">{{ actionTypeLabel }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { BoltIcon } from '@heroicons/vue/20/solid'
import type { ActionType } from '@/types/automation'

interface Props {
  data: { actionType?: ActionType; label?: string }
}

const props = defineProps<Props>()

const actionTypeLabel = computed(() => {
  const map: Record<string, string> = {
    SEND_WHATSAPP: 'Enviar WhatsApp',
    SEND_EMAIL: 'Enviar E-mail',
    CREATE_TASK: 'Criar Tarefa',
    SEND_NOTIFICATION: 'Notificação',
    UPDATE_LEAD_STATUS: 'Atualizar Status',
    ASSIGN_LEAD: 'Atribuir Lead',
    WAIT: 'Aguardar',
  }
  return map[props.data.actionType ?? ''] ?? 'Selecione a ação'
})
</script>
