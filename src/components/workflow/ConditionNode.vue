<template>
  <div class="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-lg border-2 border-yellow-600">
    <div class="font-bold text-sm">? Condition</div>
    <div class="text-xs mt-1">{{ conditionTypeLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ConditionType } from '@/types/automation'

interface Props {
  data: {
    conditionType?: ConditionType
    label?: string
  }
}

const props = defineProps<Props>()

const conditionTypeLabel = computed(() => {
  const map: Record<ConditionType, string> = {
    LEAD_STATUS_IS: 'Lead Status Is',
    LEAD_ASSIGNED_TO: 'Lead Assigned To',
    TASK_OVERDUE: 'Task Overdue',
    CUSTOM_FIELD_VALUE: 'Custom Field',
  }
  return map[props.data.conditionType!] || 'Condition'
})
</script>
