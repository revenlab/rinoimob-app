import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import automationService from '@/services/automation'
import type { AutomationWorkflow, AutomationExecution, CreateAutomationWorkflowRequest, UpdateAutomationWorkflowRequest } from '@/types/automation'

export const useAutomationStore = defineStore('automation', () => {
  const workflows = ref<AutomationWorkflow[]>([])
  const currentWorkflow = ref<AutomationWorkflow | null>(null)
  const executions = ref<AutomationExecution[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isActive = computed(() => currentWorkflow.value?.isActive ?? false)

  async function fetchWorkflows() {
    loading.value = true
    try {
      workflows.value = await automationService.listWorkflows()
      error.value = null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar workflows'
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkflow(id: string) {
    loading.value = true
    try {
      currentWorkflow.value = await automationService.getWorkflow(id)
      error.value = null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Workflow não encontrado'
    } finally {
      loading.value = false
    }
  }

  async function createWorkflow(data: CreateAutomationWorkflowRequest) {
    loading.value = true
    try {
      const workflow = await automationService.createWorkflow(data)
      workflows.value.push(workflow)
      currentWorkflow.value = workflow
      error.value = null
      return workflow
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao criar workflow'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateWorkflow(id: string, data: UpdateAutomationWorkflowRequest) {
    loading.value = true
    try {
      const workflow = await automationService.updateWorkflow(id, data)
      const idx = workflows.value.findIndex(w => w.id === id)
      if (idx >= 0) workflows.value[idx] = workflow
      currentWorkflow.value = workflow
      error.value = null
      return workflow
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar workflow'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteWorkflow(id: string) {
    loading.value = true
    try {
      await automationService.deleteWorkflow(id)
      workflows.value = workflows.value.filter(w => w.id !== id)
      if (currentWorkflow.value?.id === id) currentWorkflow.value = null
      error.value = null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao deletar workflow'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    loading.value = true
    try {
      const workflow = await automationService.toggleActive(id, isActive)
      const idx = workflows.value.findIndex(w => w.id === id)
      if (idx >= 0) workflows.value[idx] = workflow
      if (currentWorkflow.value?.id === id) currentWorkflow.value = workflow
      error.value = null
      return workflow
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao alternar status do workflow'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function testWorkflow(id: string, triggerEvent: string, triggerData: Record<string, any>) {
    loading.value = true
    try {
      const execution = await automationService.testWorkflow(id, { triggerEvent, triggerData })
      error.value = null
      return execution
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao testar workflow'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchExecutions(id: string) {
    loading.value = true
    try {
      executions.value = await automationService.getExecutionHistory(id)
      error.value = null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar execuções'
    } finally {
      loading.value = false
    }
  }

  return {
    workflows,
    currentWorkflow,
    executions,
    loading,
    error,
    isActive,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleActive,
    testWorkflow,
    fetchExecutions,
  }
})
