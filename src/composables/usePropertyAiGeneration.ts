import { ref } from 'vue'
import propertyAiService from '@/services/propertyAi'
import type { GeneratePropertyContentRequest, GeneratePropertyContentResponse } from '@/types/property'

export function usePropertyAiGeneration() {
  const isLoadingTitle = ref(false)
  const isLoadingDescription = ref(false)
  const errorTitle = ref<string | null>(null)
  const errorDescription = ref<string | null>(null)

  const generateTitle = async (data: GeneratePropertyContentRequest): Promise<string | null> => {
    isLoadingTitle.value = true
    errorTitle.value = null

    try {
      const response = await propertyAiService.generateTitle(data)
      return response.title || null
    } catch (err) {
      errorTitle.value = err instanceof Error ? err.message : 'Erro ao gerar título'
      console.error('Erro ao gerar título:', err)
      return null
    } finally {
      isLoadingTitle.value = false
    }
  }

  const generateDescription = async (data: GeneratePropertyContentRequest): Promise<string | null> => {
    isLoadingDescription.value = true
    errorDescription.value = null

    try {
      const response = await propertyAiService.generateDescription(data)
      return response.description || null
    } catch (err) {
      errorDescription.value = err instanceof Error ? err.message : 'Erro ao gerar descrição'
      console.error('Erro ao gerar descrição:', err)
      return null
    } finally {
      isLoadingDescription.value = false
    }
  }

  const generateAll = async (data: GeneratePropertyContentRequest): Promise<GeneratePropertyContentResponse | null> => {
    isLoadingTitle.value = true
    isLoadingDescription.value = true
    errorTitle.value = null
    errorDescription.value = null

    try {
      const response = await propertyAiService.generateAll(data)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao gerar conteúdo'
      errorTitle.value = errorMsg
      errorDescription.value = errorMsg
      console.error('Erro ao gerar conteúdo:', err)
      return null
    } finally {
      isLoadingTitle.value = false
      isLoadingDescription.value = false
    }
  }

  return {
    isLoadingTitle,
    isLoadingDescription,
    errorTitle,
    errorDescription,
    generateTitle,
    generateDescription,
    generateAll,
  }
}
