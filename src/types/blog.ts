export type BlogPostStatus = 'DRAFT' | 'PUBLISHED'

export interface BlogPost {
  id: string
  tenantId: string
  title: string
  slug: string
  excerpt: string | null
  contentHtml: string
  coverImageUrl: string | null
  status: BlogPostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  createdByName: string | null
  updatedBy: string | null
  updatedByName: string | null
}

export interface BlogPostFormInput {
  title: string
  slug?: string | null
  excerpt?: string | null
  contentHtml: string
  coverImageUrl?: string | null
  status?: BlogPostStatus | null
  publishedAt?: string | null
}

export interface BlogPostStatusInput {
  status: BlogPostStatus
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
