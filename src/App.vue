<template>
  <div id="app">
    <main>
      <RouterView />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<style scoped>
/* Melhorar visibilidade dos Handles */
:deep(.vue-flow__handle) {
  @apply w-3 h-3 rounded-full;
}

:deep(.vue-flow__handle-top) {
  @apply top-[-6px];
}

:deep(.vue-flow__handle-bottom) {
  @apply bottom-[-6px];
}

:deep(.vue-flow__handle-left) {
  @apply left-[-6px];
}

:deep(.vue-flow__handle-right) {
  @apply right-[-6px];
}

/* Colorir Handles baseado no tipo */
:deep(.vue-flow__handle) {
  @apply bg-white border-2 border-slate-400 hover:border-slate-600 hover:scale-125 transition-all cursor-pointer;
}

:deep(.vue-flow__handle.connecting) {
  @apply bg-indigo-500 border-indigo-600 scale-125;
}

/* Melhorar visualização de edges */
:deep(.vue-flow__edge-path) {
  stroke-width: 2;
}

:deep(.vue-flow__edge.selected path) {
  stroke: #818cf8;
  stroke-width: 3;
}

:deep(.vue-flow__edge.animated path) {
  animation: dash 0.5s linear infinite;
}

@keyframes dash {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 8;
  }
}
</style>
