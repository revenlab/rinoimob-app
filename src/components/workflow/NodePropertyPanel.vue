<template>
  <div class="space-y-4">
    <!-- Node Type Display -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Type
      </label>
      <div class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100">
        {{ node.type }}
      </div>
    </div>

    <!-- Node ID Display -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        ID
      </label>
      <div class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100 break-all">
        {{ node.id }}
      </div>
    </div>

    <!-- Trigger Type Selector -->
    <div v-if="node.type === 'TRIGGER'">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Trigger Type
      </label>
      <select
        :value="node.data?.triggerType || ''"
        @change="(e) => updateTriggerType((e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Select trigger...</option>
        <option value="LEAD_CREATED">Lead Created</option>
        <option value="LEAD_STATUS_CHANGED">Status Changed</option>
        <option value="LEAD_ASSIGNED">Lead Assigned</option>
        <option value="TASK_CREATED">Task Created</option>
        <option value="TASK_OVERDUE">Task Overdue</option>
        <option value="TASK_COMPLETED">Task Completed</option>
        <option value="LEAD_NO_ACTIVITY">No Activity</option>
      </select>
    </div>

    <!-- Condition Type Selector -->
    <div v-if="node.type === 'CONDITION'">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Condition Type
      </label>
      <select
        :value="node.data?.conditionType || ''"
        @change="(e) => updateConditionType((e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Select condition...</option>
        <option value="LEAD_STATUS_IS">Lead Status Is</option>
        <option value="LEAD_ASSIGNED_TO">Lead Assigned To</option>
        <option value="TASK_OVERDUE">Task Overdue</option>
        <option value="CUSTOM_FIELD_VALUE">Custom Field</option>
      </select>

      <!-- Condition Parameters -->
      <div v-if="node.data?.conditionType" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Condition Value
        </label>
        <input
          :value="node.data?.parameters?.value || ''"
          @input="(e) => updateParameter('value', (e.target as HTMLInputElement).value)"
          type="text"
          placeholder="Enter value"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Action Type Selector -->
    <div v-if="node.type === 'ACTION'">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Action Type
      </label>
      <select
        :value="node.data?.actionType || ''"
        @change="(e) => updateActionType((e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Select action...</option>
        <option value="SEND_WHATSAPP">Send WhatsApp</option>
        <option value="SEND_EMAIL">Send Email</option>
        <option value="CREATE_TASK">Create Task</option>
        <option value="SEND_NOTIFICATION">Send Notification</option>
        <option value="UPDATE_LEAD_STATUS">Update Status</option>
        <option value="ASSIGN_LEAD">Assign Lead</option>
        <option value="WAIT">Wait</option>
      </select>

      <!-- Action Parameters -->
      <div v-if="node.data?.actionType" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Action Parameters
        </label>
        <textarea
          :value="JSON.stringify(node.data?.parameters || {}, null, 2)"
          @input="(e) => updateParameters((e.target as HTMLTextAreaElement).value)"
          placeholder="Enter JSON parameters"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-mono text-xs"
          rows="4"
        />
      </div>
    </div>

    <!-- Delete Button -->
    <div class="pt-3 border-t border-slate-200 dark:border-slate-600">
      <button
        @click="() => emit('delete', node.id)"
        class="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Delete Node
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  update: [nodeId: string, data: any]
  delete: [nodeId: string]
}>()

function updateTriggerType(triggerType: string) {
  emit('update', props.node.id, {
    ...props.node.data,
    triggerType,
  })
}

function updateConditionType(conditionType: string) {
  emit('update', props.node.id, {
    ...props.node.data,
    conditionType,
    parameters: props.node.data?.parameters || {},
  })
}

function updateParameter(key: string, value: any) {
  emit('update', props.node.id, {
    ...props.node.data,
    parameters: {
      ...(props.node.data?.parameters || {}),
      [key]: value,
    },
  })
}

function updateActionType(actionType: string) {
  emit('update', props.node.id, {
    ...props.node.data,
    actionType,
    parameters: props.node.data?.parameters || {},
  })
}

function updateParameters(jsonStr: string) {
  try {
    const parameters = JSON.parse(jsonStr)
    emit('update', props.node.id, {
      ...props.node.data,
      parameters,
    })
  } catch {
    // Invalid JSON, skip update
  }
}
</script>
