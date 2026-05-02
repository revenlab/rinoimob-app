<template>
  <div class="flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
    <!-- Left Sidebar: Node Palette -->
    <div class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Nós</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Arraste para o canvas</p>
      </div>

      <div class="flex-1 p-4 overflow-y-auto space-y-2">
        <div
          v-for="item in nodePalette"
          :key="item.type"
          draggable="true"
          @dragstart="onDragStart($event, item.type)"
          :class="['p-3 rounded-lg border-2 cursor-grab hover:shadow-md transition select-none', item.colorClass]"
        >
          <div class="flex items-center justify-center w-8 h-8 mb-2 bg-white bg-opacity-20 rounded-lg mx-auto">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <p class="font-semibold text-sm text-center">{{ item.label }}</p>
          <p class="text-xs opacity-70 mt-0.5 text-center">{{ item.description }}</p>
        </div>
      </div>

      <div class="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          @click="confirmReset"
          class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
        >
          Limpar Canvas
        </button>
      </div>
    </div>

    <!-- Center: VueFlow Canvas -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Toolbar -->
      <div class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-3">
          <router-link to="/automations" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold">←</router-link>
          <h1 class="text-base font-bold text-slate-900 dark:text-white">
            {{ isNew ? 'Novo Workflow' : (workflowForm.name || 'Editar Workflow') }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span>{{ nodes.length }} nós</span>
            <span class="text-slate-300 dark:text-slate-600">·</span>
            <span>{{ edges.length }} conexões</span>
          </div>
          <button
            @click="saveWorkflow"
            :disabled="saving"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition font-medium text-sm"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Help text -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700 px-4 py-2 text-xs text-blue-700 dark:text-blue-300">
        💡 Arraste nós da paleta para o canvas. Conecte arrastando de um ponto branco para outro. Clique em uma conexão para selecioná-la ou deletá-la. Pressione Delete para remover.
      </div>

      <!-- VueFlow -->
      <div
        class="flex-1 relative"
        @dragover.prevent="onDragOver"
        @drop="onDrop"
      >
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-edge-options="{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }"
          :is-valid-connection="isValidConnection"
          fit-view-on-init
          @node-click="onNodeClick"
          @pane-click="onPaneClick"
          @connect="onConnect"
          @edge-click="onEdgeClick"
        >
          <Background :gap="20" :size="1" pattern-color="#94a3b8" />
          <Controls />
          <MiniMap :node-color="minimapNodeColor" />
        </VueFlow>
      </div>
    </div>

    <!-- Right Panel: Properties -->
    <div class="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          {{ selectedEdge ? 'Propriedades da Conexão' : (selectedNode ? 'Propriedades do Nó' : 'Informações') }}
        </h2>
      </div>

      <div class="flex-1 p-4 overflow-y-auto">
        <!-- Connection info (edge selected) -->
        <div v-if="selectedEdge" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Conexão</label>
            <div class="space-y-2">
              <div class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
                <p class="font-medium text-slate-900 dark:text-white">De:</p>
                <p class="text-slate-600 dark:text-slate-400 mt-1">{{ nodes.find(n => n.id === selectedEdge.source)?.id }}</p>
              </div>
              <div class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
                <p class="font-medium text-slate-900 dark:text-white">Para:</p>
                <p class="text-slate-600 dark:text-slate-400 mt-1">{{ nodes.find(n => n.id === selectedEdge.target)?.id }}</p>
              </div>
              <div v-if="selectedEdge.label" class="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
                <p class="font-medium text-slate-900 dark:text-white">Rótulo:</p>
                <p class="text-slate-600 dark:text-slate-400 mt-1">{{ selectedEdge.label }}</p>
              </div>
            </div>
          </div>
          <button
            @click="() => { edges = edges.filter(e => e.id !== selectedEdge.id); selectedEdge = null }"
            class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition font-medium"
          >
            Deletar Conexão
          </button>
        </div>
        <!-- Workflow info (no node/edge selected) -->
        <div v-else-if="!selectedNode" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
            <input
              v-model="workflowForm.name"
              type="text"
              placeholder="Nome do workflow"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <textarea
              v-model="workflowForm.description"
              placeholder="Descreva o objetivo deste workflow"
              rows="3"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>

          <!-- Validation indicator -->
          <div :class="['p-3 rounded-lg text-sm', workflowValidation.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700']">
            <p :class="['font-semibold', workflowValidation.valid ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300']">
              {{ workflowValidation.valid ? '✅ Workflow válido' : '⚠️ Workflow incompleto' }}
            </p>
            <ul v-if="!workflowValidation.valid" class="mt-2 space-y-1">
              <li v-for="error in workflowValidation.errors" :key="error" :class="['text-xs', workflowValidation.valid ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400']">
                {{ error }}
              </li>
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
              <p class="text-xs text-slate-500 dark:text-slate-400">Nós</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ nodes.length }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
              <p class="text-xs text-slate-500 dark:text-slate-400">Conexões</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ edges.length }}</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 text-center">Clique num nó para editar suas propriedades</p>
        </div>

        <!-- Node properties (node selected) -->
        <NodePropertyPanel
          v-else
          :node="selectedNode"
          @update="onNodeDataUpdate"
          @delete="onNodeDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { VueFlow, useVueFlow, type Connection, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { PlayIcon, BoltIcon, ArrowPathIcon, StopIcon } from '@heroicons/vue/20/solid'
import { nanoid } from 'nanoid'
import { useAutomationStore } from '@/stores/automation'
import NodePropertyPanel from '@/components/workflow/NodePropertyPanel.vue'
import TriggerNode from '@/components/workflow/TriggerNode.vue'
import ActionNode from '@/components/workflow/ActionNode.vue'
import ConditionNode from '@/components/workflow/ConditionNode.vue'
import EndNode from '@/components/workflow/EndNode.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const router = useRouter()
const route = useRoute()
const automationStore = useAutomationStore()
const { screenToFlowCoordinate, addNodes, addEdges, removeNodes } = useVueFlow()

const nodeTypes: Record<string, any> = {
  TRIGGER: markRaw(TriggerNode),
  ACTION: markRaw(ActionNode),
  CONDITION: markRaw(ConditionNode),
  END: markRaw(EndNode),
}

const nodePalette = [
  {
    type: 'TRIGGER',
    icon: markRaw(PlayIcon),
    label: 'Gatilho',
    description: 'Inicia o workflow',
    colorClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  },
  {
    type: 'CONDITION',
    icon: markRaw(ArrowPathIcon),
    label: 'Condição',
    description: 'Ramificação lógica',
    colorClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
  },
  {
    type: 'ACTION',
    icon: markRaw(BoltIcon),
    label: 'Ação',
    description: 'Executar tarefa',
    colorClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
  },
  {
    type: 'END',
    icon: markRaw(StopIcon),
    label: 'Fim',
    description: 'Encerrar workflow',
    colorClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  },
]


const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const selectedNode = ref<any | null>(null)
const selectedEdge = ref<any | null>(null)
const saving = ref(false)
const draggedNodeType = ref<string | null>(null)

const workflowForm = ref({ name: '', description: '' })
const isNew = computed(() => !route.params.id || route.params.id === 'new')
const workflowValidation = computed(() => validateWorkflow())

onMounted(async () => {
  if (!isNew.value) {
    const id = route.params.id as string
    await automationStore.fetchWorkflow(id)
    const wf = automationStore.currentWorkflow
    if (wf) {
      workflowForm.value = { name: wf.name, description: wf.description || '' }
      const config = wf.workflowConfig
      if (config?.nodes) {
        nodes.value = config.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          position: n.position || { x: 100, y: 100 },
          data: n.data || {},
        }))
      }
      if (config?.edges) {
        edges.value = config.edges.map((e: any) => ({
          id: e.id || `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: e.style || { stroke: '#6366f1', strokeWidth: 2 },
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        }))
      }
    }
  }

  // Atalho de teclado: Delete para remover nó ou edge selecionado
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNode.value) {
      onNodeDelete(selectedNode.value.id)
      selectedNode.value = null
    } else if (selectedEdge.value) {
      edges.value = edges.value.filter(ed => ed.id !== selectedEdge.value.id)
      selectedEdge.value = null
    }
  }
}

function onDragStart(event: DragEvent, type: string) {
  draggedNodeType.value = type
  event.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(event: DragEvent) {
  event.dataTransfer!.dropEffect = 'move'
}

function onDrop(event: DragEvent) {
  if (!draggedNodeType.value) return
  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  addNodes([{
    id: `node-${nanoid(8)}`,
    type: draggedNodeType.value,
    position,
    data: {},
  }])
  draggedNodeType.value = null
}

function onNodeClick({ node }: { node: Node }) {
  selectedNode.value = node
}

function onPaneClick() {
  selectedNode.value = null
}

function isValidConnection(connection: Connection): boolean {
  const sourceNode = nodes.value.find(n => n.id === connection.source)
  const targetNode = nodes.value.find(n => n.id === connection.target)

  if (!sourceNode || !targetNode) return false

  // Não permitir self-loop
  if (connection.source === connection.target) return false

  // Regras de validação por tipo:
  // - TRIGGER só pode ter source (saída), não pode receber (entrada)
  // - END só pode ter target (entrada), não pode enviar (saída)
  // - ACTION e CONDITION podem ter ambos

  // Não conectar saída de TRIGGER para entrada de TRIGGER
  if (sourceNode.type === 'TRIGGER' && targetNode.type === 'TRIGGER') return false

  // Não conectar saída de END (END não deve ter saída)
  if (sourceNode.type === 'END') return false

  // TRIGGER só pode enviar, não receber entrada
  if (targetNode.type === 'TRIGGER' && connection.target === targetNode.id) return false

  return true
}

function onConnect(connection: Connection) {
  const sourceNode = nodes.value.find(n => n.id === connection.source)
  const targetNode = nodes.value.find(n => n.id === connection.target)

  let edgeStyle: any = { stroke: '#6366f1', strokeWidth: 2 }
  let label = ''

  // Cores diferentes baseadas no tipo de conexão
  if (sourceNode?.type === 'CONDITION') {
    label = connection.sourceHandle === 'true' ? 'Sim' : 'Não'
    edgeStyle.stroke = connection.sourceHandle === 'true' ? '#22c55e' : '#ef4444'
  } else if (sourceNode?.type === 'TRIGGER') {
    edgeStyle.stroke = '#3b82f6'
  } else if (sourceNode?.type === 'ACTION') {
    edgeStyle.stroke = '#8b5cf6'
  }

  addEdges([{
    id: `e-${nanoid(8)}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle ?? undefined,
    targetHandle: connection.targetHandle ?? undefined,
    animated: true,
    style: edgeStyle,
    label: label || undefined,
  }])
}

function onEdgeClick({ edge }: { edge: Edge }) {
  // Selecionar edge; se já estava selecionada, deletar ao clicar novamente
  if (selectedEdge.value?.id === edge.id) {
    edges.value = edges.value.filter(e => e.id !== edge.id)
    selectedEdge.value = null
  } else {
    selectedEdge.value = edge
    selectedNode.value = null  // Deselecionar nó ao selecionar edge
  }
}

function onNodeDataUpdate(nodeId: string, data: any) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) node.data = { ...data }
  if (selectedNode.value?.id === nodeId) {
    selectedNode.value = { ...selectedNode.value, data: { ...data } }
  }
}

function onNodeDelete(nodeId: string) {
  removeNodes([nodeId])
  if (selectedNode.value?.id === nodeId) selectedNode.value = null
}

function confirmReset() {
  if (confirm('Limpar todos os nós? Esta ação não pode ser desfeita.')) {
    nodes.value = []
    edges.value = []
    selectedNode.value = null
  }
}

function minimapNodeColor(node: Node): string {
  const colors: Record<string, string> = {
    TRIGGER: '#3b82f6',
    ACTION: '#22c55e',
    CONDITION: '#eab308',
    END: '#ef4444',
  }
  return colors[node.type as string] || '#94a3b8'
}

function validateWorkflow(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Verificar nós vazios
  if (nodes.value.length === 0) {
    errors.push('• Adicione pelo menos um nó ao workflow')
  }

  // Verificar se tem TRIGGER
  const hasTrigger = nodes.value.some(n => n.type === 'TRIGGER')
  if (!hasTrigger) {
    errors.push('• O workflow deve começar com um Gatilho (TRIGGER)')
  }

  // Verificar se tem END
  const hasEnd = nodes.value.some(n => n.type === 'END')
  if (!hasEnd) {
    errors.push('• O workflow deve terminar com um Fim (END)')
  }

  // Verificar nós sem configuração
  const nodesWithoutConfig = nodes.value.filter(n => {
    if (n.type === 'TRIGGER') return !n.data?.triggerType
    if (n.type === 'ACTION') return !n.data?.actionType
    if (n.type === 'CONDITION') return !n.data?.conditionType
    return false
  })
  if (nodesWithoutConfig.length > 0) {
    errors.push(`• ${nodesWithoutConfig.length} nó(s) sem configuração completa`)
  }

  // Verificar nós órfãos (não conectados)
  const connectedNodes = new Set<string>()
  edges.value.forEach(e => {
    connectedNodes.add(e.source)
    connectedNodes.add(e.target)
  })
  const orphanNodes = nodes.value.filter(
    n => n.type !== 'TRIGGER' && n.type !== 'END' && !connectedNodes.has(n.id)
  )
  if (orphanNodes.length > 0) {
    errors.push(`• ${orphanNodes.length} nó(s) não estão conectado(s) ao workflow`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

async function saveWorkflow() {
  if (!workflowForm.value.name.trim()) {
    alert('Por favor, insira um nome para o workflow.')
    return
  }

  // Validar workflow
  const validation = validateWorkflow()
  if (!validation.valid) {
    alert(`Erro no workflow:\n${validation.errors.join('\n')}`)
    return
  }

  saving.value = true
  try {
    const payload: any = {
      name: workflowForm.value.name,
      description: workflowForm.value.description,
      workflowConfig: {
        nodes: nodes.value.map(n => ({
          id: n.id,
          type: n.type as string,
          position: n.position,
          data: n.data,
        })),
        edges: edges.value.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          style: e.style,
        })),
      },
    }

    if (isNew.value) {
      await automationStore.createWorkflow(payload)
    } else {
      await automationStore.updateWorkflow(route.params.id as string, payload)
    }

    await router.push('/automations')
  } catch (e) {
    alert(`Erro ao salvar: ${e instanceof Error ? e.message : 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}
</script>
