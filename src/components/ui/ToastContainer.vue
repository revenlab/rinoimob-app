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
        <component :is="toastIcon(toast.type)" :class="toastIconClasses(toast.type)" />
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/vue/20/solid'

const { toasts } = useNotification()

function toastClasses(type: string): string {
  const typeClasses: Record<string, string> = {
    error:   'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-100',
    success: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-100',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-100',
    info:    'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-100',
  }
  return typeClasses[type] || typeClasses.info
}

function toastIconClasses(type: string): string {
  const classes: Record<string, string> = {
    error:   'w-5 h-5 text-red-500 dark:text-red-300 shrink-0',
    success: 'w-5 h-5 text-green-500 dark:text-green-300 shrink-0',
    warning: 'w-5 h-5 text-yellow-500 dark:text-yellow-300 shrink-0',
    info:    'w-5 h-5 text-blue-500 dark:text-blue-300 shrink-0',
  }
  return classes[type] || classes.info
}

function toastIcon(type: string) {
  const icons: Record<string, unknown> = {
    error: XCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
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
