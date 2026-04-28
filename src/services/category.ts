import { apiFetch } from '@/lib/api'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'

const categoryService = {
  list(): Promise<CategoryResponse[]> {
    return apiFetch('/api/v1/categories')
  },

  create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return apiFetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    return apiFetch(`/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/api/v1/categories/${id}`, { method: 'DELETE' })
  },
}

export default categoryService
