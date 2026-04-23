import { ref, computed } from 'vue'

type FetchState = 'idle' | 'loading' | 'success' | 'error'

export interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  immediate?: boolean
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const { method = 'GET', headers = {}, body, immediate = false } = options
  
  const state = ref<FetchState>('idle')
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = computed(() => state.value === 'loading')
  const isSuccess = computed(() => state.value === 'success')
  const isError = computed(() => state.value === 'error')

  async function fetch() {
    state.value = 'loading'
    error.value = null
    
    try {
      const response = await window.fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json = await response.json()
      data.value = json
      state.value = 'success'
    } catch (err) {
      error.value = err as Error
      state.value = 'error'
    }
  }

  if (immediate) {
    fetch()
  }

  return {
    state,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    fetch,
  }
}
