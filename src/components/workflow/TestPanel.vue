<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Testar Workflow</h2>
        <button
          @click="emit('close')"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
        >
          ✕
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Evento Gatilho Selection -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Evento Gatilho
          </label>
          <select
            v-model="triggerEvent"
            class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="">Selecione o evento...</option>
            <option value="LEAD_CREATED">Lead Criado</option>
            <option value="LEAD_STATUS_CHANGED">Status Alterado</option>
            <option value="LEAD_ASSIGNED">Lead Atribuído</option>
            <option value="TASK_CREATED">Tarefa Criada</option>
            <option value="TASK_OVERDUE">Tarefa Atrasada</option>
            <option value="TASK_COMPLETED">Tarefa Concluída</option>
            <option value="LEAD_NO_ACTIVITY">Sem Atividade</option>
          </select>
        </div>

        <!-- Trigger Data Input -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Dados do Gatilho (JSON)
          </label>
          <textarea
            v-model="triggerDataJson"
            placeholder='{"leadId": "123", "status": "NEW"}'
            class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
            rows="6"
          />
          <p v-if="dataError" class="mt-2 text-sm text-red-500">{{ dataError }}</p>
        </div>

        <!-- Executar Teste Button -->
        <button
          @click="runTest"
          :disabled="isRunning || !triggerEvent"
          class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
        >
          <span v-if="!isRunning">Executar Teste</span>
          <span v-else>Executando...</span>
        </button>

        <!-- Results -->
        <div v-if="execution" class="pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">Resultado da Execução</h3>
          
          <div class="space-y-3">
            <!-- Status -->
            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div class="w-3 h-3 rounded-full" :class="statusColor" />
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Status</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ execution.status }}</p>
              </div>
            </div>

            <!-- Caminho de Execução -->
            <div>
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Caminho de Execução</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(nodeId, idx) in execution.executionPath"
                  :key="idx"
                  class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {{ nodeId }}
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="execution.errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Error</p>
              <p class="text-sm text-red-600 dark:text-red-400 font-mono">{{ execution.errorMessage }}</p>
            </div>

            <!-- Dados do Resultado -->
            <div v-if="execution.resultData" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Dados do Resultado</p>
              <pre class="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">{{ JSON.stringify(execution.resultData, null, 2) }}</pre>
            </div>

            <!-- Timing -->
            <div class="text-xs text-slate-500 dark:text-slate-400">
              Created: {{ new Date(execution.createdAt).toLocaleString() }}
              <span v-if="execution.completedAt">
                | Completed: {{ new Date(execution.completedAt).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAutomationStore } from '@/stores/automation'
import type { AutomationExecution } from '@/types/automation'

const props = defineProps<{
  workflowId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const automationStore = useAutomationStore()
const triggerEvent = ref('')
const triggerDataJson = ref('{}')
const isRunning = ref(false)
const dataError = ref('')
const execution = ref<AutomationExecution | null>(null)

const statusColor = computed(() => {
  if (!execution.value) return 'bg-slate-400'
  switch (execution.value.status) {
    case 'COMPLETED':
      return 'bg-green-500'
    case 'FAILED':
      return 'bg-red-500'
    case 'RUNNING':
      return 'bg-yellow-500'
    case 'SKIPPED':
      return 'bg-blue-500'
    default:
      return 'bg-slate-400'
  }
})

async function runTest() {
  dataError.value = ''
  
  if (!triggerEvent.value) {
    dataError.value = 'Selecione um evento gatilho'
    return
  }

  let triggerData = {}
  try {
    triggerData = JSON.parse(triggerDataJson.value)
  } catch (e) {
    dataError.value = 'JSON inválido nos dados do gatilho'
    return
  }

  isRunning.value = true
  try {
    execution.value = await automationStore.testWorkflow(props.workflowId, triggerEvent.value, triggerData)
  } catch (e) {
    dataError.value = e instanceof Error ? e.message : 'Falha ao testar o workflow'
  } finally {
    isRunning.value = false
  }
}
</script>
