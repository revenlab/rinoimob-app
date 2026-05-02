<template>
  <div class="space-y-6">
    <!-- List View -->
    <div v-if="!selectedWorkflow" class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Automations</h1>
        <button
          @click="createNew"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          + New Workflow
        </button>
      </div>

      <!-- Workflows Table -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="relative overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Name</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Updated</th>
                <th class="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
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
                        {{ workflow.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </label>
                  </td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                    {{ new Date(workflow.updatedAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex gap-2 justify-end">
                      <button
                        @click="editWorkflow(workflow.id)"
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        @click="testWorkflow(workflow.id)"
                        class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                      >
                        Test
                      </button>
                      <button
                        @click="deleteWorkflow(workflow.id)"
                        class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No workflows yet. Create one to get started!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Editor View -->
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ selectedWorkflow?.name || 'New Workflow' }}</h1>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ selectedWorkflow?.description || 'Create or edit workflow' }}</p>
        </div>
        <button
          @click="selectedWorkflow = null"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Workflow Info Form -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Name
            </label>
            <input
              v-model="workflowForm.name"
              type="text"
              placeholder="Workflow name"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <input
              v-model="workflowForm.description"
              type="text"
              placeholder="Optional description"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Workflow Builder -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-[600px]">
        <div class="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div class="text-slate-500 dark:text-slate-400 font-medium">
            <p>Workflow Canvas</p>
            <p class="text-xs mt-1 text-slate-400 dark:text-slate-500">Drag nodes from the left panel to build your workflow</p>
          </div>
        </div>
      </div>

      <!-- Execution History -->
      <div v-if="selectedWorkflow?.id" class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <ExecutionHistory :executions="automationStore.executions" />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-end">
        <button
          @click="selectedWorkflow = null"
          class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveWorkflow"
          :disabled="automationStore.loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
        >
          {{ automationStore.loading ? 'Saving...' : 'Save' }}
        </button>
        <button
          v-if="selectedWorkflow?.id"
          @click="showTestPanel = true"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Test
        </button>
      </div>
    </div>

    <!-- Test Panel Modal -->
    <TestPanel
      v-if="showTestPanel && selectedWorkflow?.id"
      :workflow-id="selectedWorkflow.id"
      @close="showTestPanel = false; automationStore.fetchExecutions(selectedWorkflow.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAutomationStore } from '@/stores/automation'
import TriggerNode from '@/components/workflow/TriggerNode.vue'
import ActionNode from '@/components/workflow/ActionNode.vue'
import ConditionNode from '@/components/workflow/ConditionNode.vue'
import EndNode from '@/components/workflow/EndNode.vue'
import ExecutionHistory from '@/components/workflow/ExecutionHistory.vue'
import TestPanel from '@/components/workflow/TestPanel.vue'
import type { AutomationWorkflow, WorkflowConfig } from '@/types/automation'

const router = useRouter()
const automationStore = useAutomationStore()

const selectedWorkflow = ref<AutomationWorkflow | null>(null)
const showTestPanel = ref(false)

const workflowForm = ref<{
  name: string
  description?: string
  workflowConfig: WorkflowConfig
}>({
  name: '',
  description: '',
  workflowConfig: {
    nodes: [],
    edges: [],
  },
})

onMounted(async () => {
  await automationStore.fetchWorkflows()
})

async function createNew() {
  selectedWorkflow.value = {
    id: 'new',
    name: 'New Workflow',
    isActive: false,
    workflowConfig: { nodes: [], edges: [] },
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  workflowForm.value = {
    name: '',
    description: '',
    workflowConfig: { nodes: [], edges: [] },
  }
}

async function editWorkflow(workflowId: string) {
  await automationStore.fetchWorkflow(workflowId)
  if (automationStore.currentWorkflow) {
    selectedWorkflow.value = automationStore.currentWorkflow
    workflowForm.value = {
      name: automationStore.currentWorkflow.name,
      description: automationStore.currentWorkflow.description,
      workflowConfig: automationStore.currentWorkflow.workflowConfig,
    }
    automationStore.fetchExecutions(workflowId)
  }
}

async function saveWorkflow() {
  if (!workflowForm.value.name.trim()) {
    alert('Please enter a workflow name')
    return
  }

  try {
    if (selectedWorkflow.value?.id === 'new') {
      await automationStore.createWorkflow({
        name: workflowForm.value.name,
        description: workflowForm.value.description,
        workflowConfig: workflowForm.value.workflowConfig,
      })
      selectedWorkflow.value = null
      await automationStore.fetchWorkflows()
    } else if (selectedWorkflow.value?.id) {
      await automationStore.updateWorkflow(selectedWorkflow.value.id, {
        name: workflowForm.value.name,
        description: workflowForm.value.description,
        workflowConfig: workflowForm.value.workflowConfig,
      })
      selectedWorkflow.value = null
      await automationStore.fetchWorkflows()
    }
  } catch (e) {
    alert(`Error saving workflow: ${e instanceof Error ? e.message : 'Unknown error'}`)
  }
}

async function testWorkflow(workflowId: string) {
  await automationStore.fetchWorkflow(workflowId)
  selectedWorkflow.value = automationStore.currentWorkflow
  if (automationStore.currentWorkflow) {
    workflowForm.value = {
      name: automationStore.currentWorkflow.name,
      description: automationStore.currentWorkflow.description,
      workflowConfig: automationStore.currentWorkflow.workflowConfig,
    }
  }
  showTestPanel.value = true
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

function onBuilderDrop(event: DragEvent) {
  event.preventDefault()
}
</script>
