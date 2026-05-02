<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'px-4 py-3 rounded-lg backdrop-filter backdrop-blur-lg border',
        'animate-fade-in transition-all duration-300',
        toastClasses(toast.type),
      ]"
    >
      <div class="flex items-center gap-2">
        <span :class="toastIconClasses(toast.type)">
          {{ toastIcon(toast.type) }}
        </span>
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const { toasts } = useNotification()

function toastClasses(type: string): string {
  const baseClasses = 'border-opacity-20'
  const typeClasses: Record<string, string> = {
    error: 'bg-red-900/20 border-red-500 text-red-100',
    success: 'bg-green-900/20 border-green-500 text-green-100',
    warning: 'bg-yellow-900/20 border-yellow-500 text-yellow-100',
    info: 'bg-blue-900/20 border-blue-500 text-blue-100',
  }
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
}

function toastIconClasses(type: string): string {
  return 'text-lg'
}

function toastIcon(type: string): string {
  const icons: Record<string, string> = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
