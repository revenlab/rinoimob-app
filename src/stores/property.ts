import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  PropertySummaryResponse,
  PropertyResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyListParams,
  PageResponse,
} from '@/types/property'
import propertyService from '@/services/property'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<PageResponse<PropertySummaryResponse> | null>(null)
  const currentProperty = ref<PropertyResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProperties(params: PropertyListParams = {}) {
    isLoading.value = true
    error.value = null
    try {
      properties.value = await propertyService.list(params)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar imóveis'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProperty(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentProperty.value = await propertyService.get(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Imóvel não encontrado'
    } finally {
      isLoading.value = false
    }
  }

  async function createProperty(data: CreatePropertyRequest): Promise<PropertyResponse> {
    isLoading.value = true
    error.value = null
    try {
      const result = await propertyService.create(data)
      return result
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao criar imóvel'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateProperty(id: string, data: UpdatePropertyRequest): Promise<PropertyResponse> {
    isLoading.value = true
    error.value = null
    try {
      const result = await propertyService.update(id, data)
      if (currentProperty.value?.id === id) currentProperty.value = result
      return result
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao atualizar imóvel'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProperty(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await propertyService.delete(id)
      if (properties.value) {
        properties.value.content = properties.value.content.filter(p => p.id !== id)
        properties.value.totalElements--
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erro ao remover imóvel'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrent() {
    currentProperty.value = null
  }

  return {
    properties,
    currentProperty,
    isLoading,
    error,
    fetchProperties,
    fetchProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    clearCurrent,
  }
})
