<template>
  <div class="space-y-4">
    <!-- Instance Selection -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Instância WhatsApp
      </label>
      <select
        :value="node.data?.parameters?.instanceId || ''"
        @change="(e) => updateParam('instanceId', (e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Selecione a instância...</option>
        <option v-for="instance in instances" :key="instance.id" :value="instance.id">
          {{ instance.displayName }} ({{ instance.phoneNumber }})
        </option>
      </select>
      <p v-if="!node.data?.parameters?.instanceId" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
        ⚠️ Instância é obrigatória
      </p>
    </div>

    <!-- Recipient Type -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Tipo de Destinatário
      </label>
      <select
        :value="node.data?.parameters?.recipientType || 'LEAD'"
        @change="(e) => updateParam('recipientType', (e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="LEAD">Enviar para o Lead</option>
        <option value="ASSIGNED_USER">Enviar para o Usuário Atribuído</option>
        <option value="CUSTOM_NUMBER">Enviar para Número Customizado</option>
      </select>
    </div>

    <!-- Recipient Phone (for ASSIGNED_USER - optional) -->
    <div v-if="node.data?.parameters?.recipientType === 'ASSIGNED_USER'" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Telefone do Usuário (opcional)
      </label>
      <input
        :value="node.data?.parameters?.recipientPhone || ''"
        @input="(e) => updateParam('recipientPhone', (e.target as HTMLInputElement).value)"
        type="tel"
        placeholder="+55 11 98765-4321"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      />
      <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
        Se vazio, usará o telefone do usuário do sistema
      </p>
    </div>

    <!-- Recipient Phone (for CUSTOM_NUMBER - required) -->
    <div v-if="node.data?.parameters?.recipientType === 'CUSTOM_NUMBER'" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Número de Telefone
      </label>
      <input
        :value="node.data?.parameters?.recipientValue || ''"
        @input="(e) => updateParam('recipientValue', (e.target as HTMLInputElement).value)"
        type="tel"
        placeholder="+55 11 98765-4321"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      />
      <p v-if="!node.data?.parameters?.recipientValue" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
        ⚠️ Número de telefone é obrigatório
      </p>
    </div>

    <!-- Message Options -->
    <div class="border-t border-slate-200 dark:border-slate-600 pt-4">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Mensagem
      </label>

      <div class="space-y-2 mb-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            :checked="messageMode === 'explicit'"
            @change="messageMode = 'explicit'"
            class="w-4 h-4"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Mensagem Customizada</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            :checked="messageMode === 'template'"
            @change="messageMode = 'template'"
            class="w-4 h-4"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Template</span>
        </label>
      </div>

      <!-- Explicit Message -->
      <div v-if="messageMode === 'explicit'" class="space-y-2">
        <textarea
          :value="node.data?.parameters?.message || ''"
          @input="(e) => updateParam('message', (e.target as HTMLTextAreaElement).value)"
          placeholder="Digite a mensagem..."
          rows="4"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Use {leadName} para inserir o nome do lead
        </p>
      </div>

      <!-- Template Message -->
      <div v-if="messageMode === 'template'" class="space-y-2">
        <select
          :value="node.data?.parameters?.messageTemplate || ''"
          @change="(e) => updateParam('messageTemplate', (e.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
        >
          <option value="">Selecione um template...</option>
          <option value="welcome">Bem-vindo ao lead</option>
          <option value="follow_up">Seguimento automático</option>
          <option value="reminder">Lembrete</option>
          <option value="offer">Oferta especial</option>
        </select>
        <div v-if="selectedTemplate" class="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">
          <strong>Preview:</strong> {{ getTemplatePreview(node.data?.parameters?.messageTemplate) }}
        </div>
      </div>
    </div>

    <!-- Help Text -->
    <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
      <p class="text-xs text-slate-600 dark:text-slate-400">
        <strong>Tipos de destinatário:</strong>
        <br />
        • <strong>Lead:</strong> Envia para o telefone do lead
        <br />
        • <strong>Usuário Atribuído:</strong> Envia para o usuário responsável do lead
        <br />
        • <strong>Número Customizado:</strong> Envia para qualquer número
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Node } from '@vue-flow/core'
import whatsappService from '@/services/whatsapp'
import type { WhatsappInstance } from '@/types/whatsapp'

const props = defineProps<{ node: Node }>()
const emit = defineEmits<{
  update: [nodeId: string, data: any]
}>()

const instances = ref<WhatsappInstance[]>([])

// Determine message mode based on current parameters
const messageMode = computed({
  get(): 'explicit' | 'template' {
    if (props.node.data?.parameters?.message) return 'explicit'
    if (props.node.data?.parameters?.messageTemplate) return 'template'
    // Default to 'explicit' to encourage custom messages
    return 'explicit'
  },
  set(value: 'explicit' | 'template') {
    // When switching modes, clear conflicting fields
    const newParameters = { ...props.node.data?.parameters }
    
    if (value === 'explicit') {
      delete newParameters.messageTemplate
    } else if (value === 'template') {
      delete newParameters.message
    }
    
    emit('update', props.node.id, {
      ...props.node.data,
      parameters: newParameters,
    })
  }
})

const selectedTemplate = computed(() => props.node.data?.parameters?.messageTemplate)

const templates: Record<string, string> = {
  welcome: 'Olá {leadName}! Bem-vindo ao nosso serviço. Como posso ajudá-lo?',
  follow_up: 'Olá {leadName}, gostaria de acompanhar seu interesse em nossos produtos.',
  reminder: 'Olá {leadName}, apenas para lembrar da nossa conversa anterior.',
  offer: 'Olá {leadName}! Temos uma oferta especial para você!',
}

onMounted(() => {
  loadInstances()
})

async function loadInstances() {
  try {
    instances.value = await whatsappService.listInstances()
  } catch (error) {
    console.error('Error loading WhatsApp instances:', error)
  }
}

function updateParam(key: string, value: any) {
  const newParameters = { ...(props.node.data?.parameters || {}), [key]: value }
  emit('update', props.node.id, {
    ...props.node.data,
    parameters: newParameters,
  })
}

function getTemplatePreview(templateKey?: string): string {
  if (!templateKey) return ''
  return templates[templateKey] || ''
}
</script>
