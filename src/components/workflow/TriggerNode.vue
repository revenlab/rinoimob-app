<template>
  <div class="px-4 py-3 bg-blue-500 text-white rounded-xl shadow-lg border-2 border-blue-600 min-w-[180px]">
    <div class="flex items-center justify-between mb-2">
      <PlayIcon class="w-6 h-6" />
    </div>
    <div class="font-bold text-sm mb-1">Gatilho</div>
    <div class="text-xs opacity-80 leading-tight">{{ triggerTypeLabel }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { PlayIcon } from '@heroicons/vue/20/solid'
import type { TriggerType } from '@/types/automation'

interface Props {
  data: { triggerType?: TriggerType; label?: string }
}

const props = defineProps<Props>()

const triggerTypeLabel = computed(() => {
  const map: Record<string, string> = {
    LEAD_CREATED: 'Lead Criado',
    LEAD_STATUS_CHANGED: 'Status Alterado',
    LEAD_ASSIGNED: 'Lead Atribuído',
    TASK_CREATED: 'Tarefa Criada',
    TASK_OVERDUE: 'Tarefa Atrasada',
    TASK_COMPLETED: 'Tarefa Concluída',
    LEAD_NO_ACTIVITY: 'Sem Atividade',
  }
  return map[props.data.triggerType ?? ''] ?? 'Selecione o gatilho'
})
</script>
