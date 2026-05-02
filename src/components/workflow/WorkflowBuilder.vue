<template>
  <div class="flex h-full gap-4">
    <!-- Left Sidebar: Node Palette -->
    <div class="w-48 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">Nodes</h3>
      
      <div class="space-y-2">
        <div
          draggable="true"
          @dragstart="onDragStart('TRIGGER')"
          class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg cursor-move hover:shadow-md transition text-sm font-medium text-blue-700 dark:text-blue-300"
        >
          🟦 Trigger
        </div>
        
        <div
          draggable="true"
          @dragstart="onDragStart('CONDITION')"
          class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg cursor-move hover:shadow-md transition text-sm font-medium text-yellow-700 dark:text-yellow-300"
        >
          ? Condition
        </div>
        
        <div
          draggable="true"
          @dragstart="onDragStart('ACTION')"
          class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg cursor-move hover:shadow-md transition text-sm font-medium text-green-700 dark:text-green-300"
        >
          ✓ Action
        </div>
        
        <div
          draggable="true"
          @dragstart="onDragStart('END')"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg cursor-move hover:shadow-md transition text-sm font-medium text-red-700 dark:text-red-300"
        >
          ⊗ End
        </div>
      </div>
    </div>

    <!-- Center: Canvas -->
    <div class="flex-1 relative bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="w-full h-full bg-slate-50 dark:bg-slate-900">
        <!-- Placeholder for VueFlow -->
        <div class="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
          Workflow Canvas - VueFlow Integration
        </div>
      </div>
    </div>

    <!-- Right Panel: Empty State -->
    <div class="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 flex items-center justify-center">
      <p class="text-sm text-slate-400 dark:text-slate-500 text-center">
        Select a node to edit properties
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NodeType } from '@/types/automation'

const props = defineProps<{
  initialNodes?: any[]
  initialEdges?: Array<{ source: string; target: string; label?: string }>
}>()

const emit = defineEmits<{
  nodesChange: [nodes: any[]]
  edgesChange: [edges: Array<{ source: string; target: string; label?: string }>]
}>()

const draggedNodeType = ref<string | null>(null)

function onDragStart(type: string) {
  draggedNodeType.value = type
}

function onCanvasDragOver(event: DragEvent) {
  if (draggedNodeType.value) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
  }
}

function onCanvasDrop(event: DragEvent) {
  // Drop handler
  event.preventDefault()
}

function onNodeSelect() {
  // Node selection handler
}

function onEdgeSelect() {
  // Edge selection handler
}

function onConnect() {
  // Connection handler
}
</script>

<style scoped>
:deep(.vue-flow__background) {
  background-color: #f9fafb;
}

:deep(.dark .vue-flow__background) {
  background-color: #0f172a;
}
</style>
