<template>
  <div class="space-y-4">
    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Histórico de Execuções</h3>

    <div class="relative overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Disparado em</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Event</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Status</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Caminho</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Duração</th>
            <th class="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <template v-if="executions.length > 0">
            <tr
              v-for="exec in executions"
              :key="exec.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                {{ new Date(exec.createdAt).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                {{ exec.triggerEvent }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  :class="statusBadgeClass(exec.status)"
                >
                  <span class="w-2 h-2 rounded-full" :class="statusDotClass(exec.status)" />
                  {{ exec.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs">
                <div class="flex gap-1 flex-wrap max-w-xs">
                  <span
                    v-for="(nodeId, idx) in exec.executionPath"
                    :key="idx"
                    class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                  >
                    {{ nodeId }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                {{ getDuração(exec) }}
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="expandedId = expandedId === exec.id ? null : exec.id"
                  class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  {{ expandedId === exec.id ? 'Ocultar' : 'Detalhes' }}
                </button>
              </td>
            </tr>

            <!-- Expanded Details -->
            <tr v-if="expandedId && expandedExecution" class="bg-slate-50 dark:bg-slate-800/50">
              <td colspan="6" class="px-4 py-4">
                <div class="space-y-3">
                  <div v-if="expandedExecution.errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p class="text-xs font-semibold text-red-700 dark:text-red-300">Error</p>
                    <p class="text-sm text-red-600 dark:text-red-400 font-mono mt-1">
                      {{ expandedExecution.errorMessage }}
                    </p>
                  </div>

                  <div v-if="expandedExecution.resultData" class="p-3 bg-slate-100 dark:bg-slate-900 rounded">
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">Dados do Resultado</p>
                    <pre class="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto mt-1">{{ JSON.stringify(expandedExecution.resultData, null, 2) }}</pre>
                  </div>

                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    <p v-if="expandedExecution.completedAt">
                      Duração: {{ getDuração(expandedExecution) }}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              Nenhuma execução ainda
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AutomationExecution, WorkflowExecutionStatus } from '@/types/automation'

const props = defineProps<{
  executions: AutomationExecution[]
}>()

const expandedId = ref<string | null>(null)

const expandedExecution = computed(() => {
  if (!expandedId.value) return null
  return props.executions.find(e => e.id === expandedId.value)
})

function statusBadgeClass(status: WorkflowExecutionStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'FAILED':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    case 'RUNNING':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'SKIPPED':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }
}

function statusDotClass(status: WorkflowExecutionStatus) {
  switch (status) {
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
}

function getDuração(exec: AutomationExecution): string {
  if (!exec.completedAt) return 'Executando...'
  const start = new Date(exec.createdAt).getTime()
  const end = new Date(exec.completedAt).getTime()
  const ms = end - start
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
</script>
