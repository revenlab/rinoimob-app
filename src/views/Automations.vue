<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Automações</h1>
          <p class="text-xs text-slate-400">Gerencie seus workflows de automação</p>
        </div>
        <button
          @click="createNewWorkflow"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md text-sm"
        >
          <PlusIcon class="w-4 h-4" />
          Novo workflow
        </button>
      </div>
    </template>

    <!-- Workflows Table -->
    <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="relative overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nome</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Descrição</th>
              <th class="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Atualizado</th>
              <th class="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <template v-if="automationStore.workflows.length > 0">
              <tr
                v-for="workflow in automationStore.workflows"
                :key="workflow.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {{ workflow.name }}
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                  {{ workflow.description || '-' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="workflow.isActive"
                      @change="(e) => toggleActive(workflow.id, (e.target as HTMLInputElement).checked)"
                      class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-xs font-semibold" :class="workflow.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'">
                      {{ workflow.isActive ? 'Ativo' : 'Inativo' }}
                    </span>
                  </label>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                  {{ new Date(workflow.updatedAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center gap-2 justify-end flex-wrap">
                    <button
                      @click="editWorkflow(workflow.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-xs shadow-sm hover:shadow"
                    >
                      <PencilSquareIcon class="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      @click="testWorkflow(workflow.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all text-xs shadow-sm hover:shadow"
                    >
                      <BeakerIcon class="w-4 h-4" />
                      Testar
                    </button>
                    <button
                      @click="openExecutionHistory(workflow.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-medium hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all text-xs shadow-sm hover:shadow"
                    >
                      <ClockIcon class="w-4 h-4" />
                      Histórico
                    </button>
                    <button
                      @click="deleteWorkflow(workflow.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 font-medium hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all text-xs shadow-sm hover:shadow"
                    >
                      <TrashIcon class="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                Nenhum workflow ainda. Crie um para começar!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedWorkflowId" class="mt-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Histórico de Execuções</h2>
          <p class="text-xs text-slate-400">
            {{ selectedWorkflowName || 'Workflow selecionado' }}
          </p>
        </div>
        <button
          @click="selectedWorkflowId = null"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs font-medium"
        >
          <XMarkIcon class="w-4 h-4" />
          Fechar
        </button>
      </div>

      <ExecutionHistory
        v-if="automationStore.executions.length > 0"
        :executions="automationStore.executions"
      />
      <div v-else class="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        Nenhuma execução encontrada para este workflow.
      </div>
    </div>

    <!-- Test Modal -->
    <TestPanel
      v-if="showTestPanel && selectedWorkflowId"
      :workflow-id="selectedWorkflowId"
      @close="showTestPanel = false; automationStore.fetchExecutions(selectedWorkflowId)"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAutomationStore } from '@/stores/automation'
import AppLayout from '@/layouts/AppLayout.vue'
import TestPanel from '@/components/workflow/TestPanel.vue'
import ExecutionHistory from '@/components/workflow/ExecutionHistory.vue'
import { PlusIcon, PencilSquareIcon, BeakerIcon, ClockIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/20/solid'

const router = useRouter()
const automationStore = useAutomationStore()

const showTestPanel = ref(false)
const selectedWorkflowId = ref<string | null>(null)
const selectedWorkflowName = ref<string | null>(null)

onMounted(async () => {
  await automationStore.fetchWorkflows()
})

async function createNewWorkflow() {
  router.push('/automations/new')
}

async function editWorkflow(workflowId: string) {
  router.push(`/automations/${workflowId}/edit`)
}

async function testWorkflow(workflowId: string) {
  selectedWorkflowId.value = workflowId
  selectedWorkflowName.value = automationStore.workflows.find(w => w.id === workflowId)?.name ?? null
  showTestPanel.value = true
}

async function openExecutionHistory(workflowId: string) {
  selectedWorkflowId.value = workflowId
  selectedWorkflowName.value = automationStore.workflows.find(w => w.id === workflowId)?.name ?? null
  showTestPanel.value = false
  await automationStore.fetchExecutions(workflowId)
}

async function deleteWorkflow(workflowId: string) {
  if (confirm('Are you sure you want to delete this workflow?')) {
    try {
      await automationStore.deleteWorkflow(workflowId)
      await automationStore.fetchWorkflows()
    } catch (e) {
      alert(`Error deleting workflow: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }
}

async function toggleActive(workflowId: string, isActive: boolean) {
  try {
    await automationStore.toggleActive(workflowId, isActive)
  } catch (e) {
    alert(`Error toggling workflow status: ${e instanceof Error ? e.message : 'Unknown error'}`)
  }
}
</script>
