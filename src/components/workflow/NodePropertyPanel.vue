<template>
  <div class="space-y-4">
    <!-- Node Type -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
      <div class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100">
        {{ typeLabel[node.type as keyof typeof typeLabel] }}
      </div>
    </div>

    <!-- Label -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rótulo</label>
      <input
        :value="node.data?.label || ''"
        @input="(e) => updateField('label', (e.target as HTMLInputElement).value)"
        type="text"
        placeholder="Nome do nó"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      />
    </div>

    <!-- TRIGGER fields -->
    <div v-if="node.type === 'TRIGGER'">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Evento Gatilho</label>
      <select
        :value="node.data?.triggerType || ''"
        @change="(e) => updateField('triggerType', (e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Selecione o evento...</option>
        <option value="LEAD_CREATED">Lead Criado</option>
        <option value="LEAD_STATUS_CHANGED">Status do Lead Alterado</option>
        <option value="LEAD_ASSIGNED">Lead Atribuído</option>
        <option value="TASK_CREATED">Tarefa Criada</option>
        <option value="TASK_OVERDUE">Tarefa Atrasada</option>
        <option value="TASK_COMPLETED">Tarefa Concluída</option>
        <option value="LEAD_NO_ACTIVITY">Lead sem Atividade</option>
      </select>
    </div>

    <!-- CONDITION fields -->
    <div v-if="node.type === 'CONDITION'" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Condição</label>
        <select
          :value="node.data?.conditionType || ''"
          @change="(e) => updateField('conditionType', (e.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
        >
          <option value="">Selecione a condição...</option>
          <option value="LEAD_STATUS_IS">Status do Lead é</option>
          <option value="LEAD_ASSIGNED_TO">Lead Atribuído a</option>
          <option value="TASK_OVERDUE">Tarefa está Atrasada</option>
          <option value="CUSTOM_FIELD_VALUE">Valor de Campo Customizado</option>
        </select>
      </div>
      <div v-if="node.data?.conditionType">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor</label>
        <input
          :value="node.data?.parameters?.value || ''"
          @input="(e) => updateParam('value', (e.target as HTMLInputElement).value)"
          type="text"
          placeholder="Valor esperado"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- ACTION fields -->
    <div v-if="node.type === 'ACTION'" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Ação</label>
        <select
          :value="node.data?.actionType || ''"
          @change="(e) => updateField('actionType', (e.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
        >
          <option value="">Selecione a ação...</option>
          <option value="SEND_WHATSAPP">Enviar WhatsApp</option>
          <option value="SEND_EMAIL">Enviar E-mail</option>
          <option value="CREATE_TASK">Criar Tarefa</option>
          <option value="SEND_NOTIFICATION">Enviar Notificação</option>
          <option value="UPDATE_LEAD_STATUS">Atualizar Status do Lead</option>
          <option value="ASSIGN_LEAD">Atribuir Lead</option>
          <option value="WAIT">Aguardar</option>
        </select>
      </div>

      <!-- SEND_WHATSAPP params -->
      <template v-if="node.data?.actionType === 'SEND_WHATSAPP'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mensagem</label>
          <textarea
            :value="node.data?.parameters?.message || ''"
            @input="(e) => updateParam('message', (e.target as HTMLTextAreaElement).value)"
            placeholder="Texto da mensagem WhatsApp..."
            rows="3"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
          />
        </div>
      </template>

      <!-- SEND_EMAIL params -->
      <template v-if="node.data?.actionType === 'SEND_EMAIL'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assunto</label>
          <input
            :value="node.data?.parameters?.subject || ''"
            @input="(e) => updateParam('subject', (e.target as HTMLInputElement).value)"
            type="text"
            placeholder="Assunto do e-mail"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Corpo</label>
          <textarea
            :value="node.data?.parameters?.body || ''"
            @input="(e) => updateParam('body', (e.target as HTMLTextAreaElement).value)"
            placeholder="Corpo do e-mail..."
            rows="3"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
          />
        </div>
      </template>

      <!-- CREATE_TASK params -->
      <template v-if="node.data?.actionType === 'CREATE_TASK'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Tarefa</label>
          <input
            :value="node.data?.parameters?.title || ''"
            @input="(e) => updateParam('title', (e.target as HTMLInputElement).value)"
            type="text"
            placeholder="Título da tarefa"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vencimento (dias)</label>
          <input
            :value="node.data?.parameters?.dueDays || ''"
            @input="(e) => updateParam('dueDays', parseInt((e.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            placeholder="Ex: 3"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </template>

      <!-- SEND_NOTIFICATION params -->
      <template v-if="node.data?.actionType === 'SEND_NOTIFICATION'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mensagem</label>
          <textarea
            :value="node.data?.parameters?.message || ''"
            @input="(e) => updateParam('message', (e.target as HTMLTextAreaElement).value)"
            placeholder="Texto da notificação..."
            rows="2"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
          />
        </div>
      </template>

      <!-- UPDATE_LEAD_STATUS params -->
      <template v-if="node.data?.actionType === 'UPDATE_LEAD_STATUS'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Novo Status</label>
          <select
            :value="node.data?.parameters?.status || ''"
            @change="(e) => updateParam('status', (e.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          >
            <option value="">Selecione o status...</option>
            <option value="NEW">Novo</option>
            <option value="CONTACTED">Contatado</option>
            <option value="QUALIFIED">Qualificado</option>
            <option value="PROPOSAL">Proposta</option>
            <option value="NEGOTIATING">Negociação</option>
            <option value="CLOSED_WON">Ganho</option>
            <option value="CLOSED_LOST">Perdido</option>
          </select>
        </div>
      </template>

      <!-- ASSIGN_LEAD params -->
      <template v-if="node.data?.actionType === 'ASSIGN_LEAD'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ID do Usuário</label>
          <input
            :value="node.data?.parameters?.userId || ''"
            @input="(e) => updateParam('userId', (e.target as HTMLInputElement).value)"
            type="text"
            placeholder="UUID do usuário"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </template>

      <!-- WAIT params -->
      <template v-if="node.data?.actionType === 'WAIT'">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Aguardar (horas)</label>
          <input
            :value="node.data?.parameters?.hours || ''"
            @input="(e) => updateParam('hours', parseInt((e.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            placeholder="Ex: 24"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </template>
    </div>

    <!-- Delete button -->
    <div class="pt-3 border-t border-slate-200 dark:border-slate-600">
      <button
        @click="emit('delete', node.id)"
        class="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition font-medium text-sm"
      >
        Excluir Nó
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@vue-flow/core'

const props = defineProps<{ node: Node }>()
const emit = defineEmits<{
  update: [nodeId: string, data: any]
  delete: [nodeId: string]
}>()

const typeLabel: Record<string, string> = {
  TRIGGER: 'Gatilho',
  ACTION: 'Ação',
  CONDITION: 'Condição',
  END: 'Fim',
}

function updateField(key: string, value: any) {
  emit('update', props.node.id, { ...props.node.data, [key]: value })
}

function updateParam(key: string, value: any) {
  emit('update', props.node.id, {
    ...props.node.data,
    parameters: { ...(props.node.data?.parameters || {}), [key]: value },
  })
}
</script>
