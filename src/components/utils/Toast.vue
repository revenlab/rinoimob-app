<script setup lang="ts">
import { ref, computed } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

interface Props {
  maxToasts?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

withDefaults(defineProps<Props>(), {
  maxToasts: 5,
  position: 'top-right',
})

const toasts = ref<Toast[]>([])

function addToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 5000) {
  const id = Date.now().toString()
  toasts.value.push({ id, message, type, duration })
  
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

const typeClasses = {
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
  success: 'bg-green-500/20 border-green-500/50 text-green-100',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100',
  error: 'bg-red-500/20 border-red-500/50 text-red-100',
}

const typeEmojis = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
}

defineExpose({ addToast, removeToast })
</script>

<template>
  <Teleport to="body">
    <div
      :class="[
        'fixed z-50 pointer-events-none',
        position === 'top-left' ? 'top-4 left-4' : '',
        position === 'top-right' ? 'top-4 right-4' : '',
        position === 'bottom-left' ? 'bottom-4 left-4' : '',
        position === 'bottom-right' ? 'bottom-4 right-4' : '',
      ]"
    >
      <Transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'mb-3 p-4 rounded-lg border backdrop-blur-lg pointer-events-auto',
            'max-w-sm animate-pulse',
            typeClasses[toast.type],
          ]"
        >
          <div class="flex items-start gap-3">
            <span class="text-lg flex-shrink-0">{{ typeEmojis[toast.type] }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ toast.message }}</p>
            </div>
            <button
              @click="removeToast(toast.id)"
              class="text-lg flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      </Transition-group>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
