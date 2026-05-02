<template>
  <div class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg border-2 border-green-600">
    <div class="font-bold text-sm">✓ Action</div>
    <div class="text-xs mt-1">{{ actionTypeLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ActionType } from '@/types/automation'

interface Props {
  data: {
    actionType?: ActionType
    label?: string
  }
}

const props = defineProps<Props>()

const actionTypeLabel = computed(() => {
  const map: Record<ActionType, string> = {
    SEND_WHATSAPP: 'Send WhatsApp',
    SEND_EMAIL: 'Send Email',
    CREATE_TASK: 'Create Task',
    SEND_NOTIFICATION: 'Send Notification',
    UPDATE_LEAD_STATUS: 'Update Status',
    ASSIGN_LEAD: 'Assign Lead',
    WAIT: 'Wait',
  }
  return map[props.data.actionType!] || 'Action'
})
</script>
