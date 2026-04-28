import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'
import categoryService from '@/services/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    isLoading.value = true
    error.value = null
    try {
      categories.value = await categoryService.list()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar categorias'
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const result = await categoryService.create(data)
    categories.value.push(result)
    return result
  }

  async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const result = await categoryService.update(id, data)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = result
    return result
  }

  async function deleteCategory(id: string) {
    await categoryService.delete(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return { categories, isLoading, error, fetchCategories, createCategory, updateCategory, deleteCategory }
})
