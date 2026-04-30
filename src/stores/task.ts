import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TaskResponse, CreateTaskRequest, UpdateTaskRequest, TaskListParams } from '@/types/task'
import taskService from '@/services/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<TaskResponse[]>([])
  const currentTask = ref<TaskResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const page = ref(0)

  async function fetchTasks(params?: TaskListParams) {
    isLoading.value = true
    error.value = null
    try {
      const result = await taskService.list(params)
      tasks.value = result.content
      totalElements.value = result.totalElements
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar tarefas'
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    isLoading.value = true
    error.value = null
    try {
      const task = await taskService.create(data)
      tasks.value = [task, ...tasks.value]
      totalElements.value++
      return task
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao criar tarefa'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateTask(id: string, data: UpdateTaskRequest): Promise<TaskResponse> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await taskService.update(id, data)
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar tarefa'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function toggleComplete(id: string): Promise<TaskResponse> {
    try {
      const updated = await taskService.complete(id)
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar tarefa'
      throw e
    }
  }

  async function deleteTask(id: string) {
    try {
      await taskService.remove(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      totalElements.value = Math.max(0, totalElements.value - 1)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao remover tarefa'
      throw e
    }
  }

  return {
    tasks,
    currentTask,
    isLoading,
    error,
    totalElements,
    page,
    fetchTasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  }
})
