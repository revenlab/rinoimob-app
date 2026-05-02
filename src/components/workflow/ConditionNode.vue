<template>
  <div class="px-4 py-3 bg-yellow-500 text-white rounded-xl shadow-lg border-2 border-yellow-600 min-w-[180px]">
    <Handle type="target" :position="Position.Top" />
    <div class="flex items-center justify-between mb-2">
      <ArrowPathIcon class="w-6 h-6" />
    </div>
    <div class="font-bold text-sm mb-1">Condição</div>
    <div class="text-xs opacity-80 leading-tight mb-2">{{ conditionTypeLabel }}</div>
    <div class="flex justify-between text-xs gap-2">
      <span class="bg-green-600 px-2 py-1 rounded text-xs font-medium">Sim</span>
      <span class="bg-red-600 px-2 py-1 rounded text-xs font-medium">Não</span>
    </div>
    <Handle type="source" :position="Position.Bottom" id="true" :style="{ left: '25%' }" />
    <Handle type="source" :position="Position.Bottom" id="false" :style="{ left: '75%' }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ArrowPathIcon } from '@heroicons/vue/20/solid'
import type { ConditionType } from '@/types/automation'

interface Props {
  data: { conditionType?: ConditionType; label?: string }
}

const props = defineProps<Props>()

const conditionTypeLabel = computed(() => {
  const map: Record<string, string> = {
    LEAD_STATUS_IS: 'Status do Lead',
    LEAD_ASSIGNED_TO: 'Atribuído a',
    TASK_OVERDUE: 'Tarefa Atrasada',
    CUSTOM_FIELD_VALUE: 'Campo Customizado',
  }
  return map[props.data.conditionType ?? ''] ?? 'Selecione a condição'
})
</script>
