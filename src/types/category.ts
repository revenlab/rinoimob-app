export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description: string | null
  isGlobal: boolean
}

export interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  description?: string
}
