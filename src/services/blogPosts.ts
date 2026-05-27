import { apiFetch, API_BASE } from '@/lib/api'
import type { BlogPost, BlogPostFormInput, BlogPostStatusInput, PageResponse } from '@/types/blog'

const BASE = `${API_BASE}/blog-posts`
const SUPPORT_BASE = `${API_BASE}/support`

class BlogPostsService {
  async list(page = 0, size = 20): Promise<PageResponse<BlogPost>> {
    return apiFetch<PageResponse<BlogPost>>(`${BASE}?page=${page}&size=${size}`)
  }

  async create(data: BlogPostFormInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: BlogPostFormInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updateStatus(id: string, data: BlogPostStatusInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(`${BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' })
  }

  async listSupport(tenantId: string, page = 0, size = 20): Promise<PageResponse<BlogPost>> {
    return apiFetch<PageResponse<BlogPost>>(`${SUPPORT_BASE}/tenants/${tenantId}/blog-posts?page=${page}&size=${size}`)
  }

  async createSupport(tenantId: string, data: BlogPostFormInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(`${SUPPORT_BASE}/tenants/${tenantId}/blog-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updateSupport(tenantId: string, id: string, data: BlogPostFormInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(`${SUPPORT_BASE}/tenants/${tenantId}/blog-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updateStatusSupport(tenantId: string, id: string, data: BlogPostStatusInput): Promise<BlogPost> {
    return apiFetch<BlogPost>(`${SUPPORT_BASE}/tenants/${tenantId}/blog-posts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteSupport(tenantId: string, id: string): Promise<void> {
    return apiFetch<void>(`${SUPPORT_BASE}/tenants/${tenantId}/blog-posts/${id}`, { method: 'DELETE' })
  }
}

export default new BlogPostsService()
