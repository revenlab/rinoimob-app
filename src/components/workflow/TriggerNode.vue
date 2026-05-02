<template>
  <div class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg border-2 border-blue-600">
    <div class="font-bold text-sm">🟦 Trigger</div>
    <div class="text-xs mt-1">{{ triggerTypeLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TriggerType } from '@/types/automation'

interface Props {
  data: {
    triggerType?: TriggerType
    label?: string
  }
}

const props = defineProps<Props>()

const triggerTypeLabel = computed(() => {
  const map: Record<TriggerType, string> = {
    LEAD_CREATED: 'Lead Created',
    LEAD_STATUS_CHANGED: 'Status Changed',
    LEAD_ASSIGNED: 'Lead Assigned',
    TASK_CREATED: 'Task Created',
    TASK_OVERDUE: 'Task Overdue',
    TASK_COMPLETED: 'Task Completed',
    LEAD_NO_ACTIVITY: 'No Activity',
  }
  return map[props.data.triggerType!] || 'Trigger'
})
</script>
