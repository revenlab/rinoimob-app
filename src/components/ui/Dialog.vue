<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: boolean
  title?: string
  message?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  confirmText?: string
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const typeClasses = {
  info: 'border-blue-500/50 bg-blue-500/10',
  warning: 'border-yellow-500/50 bg-yellow-500/10',
  error: 'border-red-500/50 bg-red-500/10',
  success: 'border-green-500/50 bg-green-500/10',
}

const typeColors = {
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-green-400',
}

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-show="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 transition-all duration-300"
      >
        <Transition name="scale">
          <div
            v-show="modelValue"
            :class="[
              'rounded-2xl shadow-2xl max-w-md w-full mx-4',
              'bg-white/15 backdrop-blur-xl border border-white/30',
              typeClasses[type],
            ]"
          >
            <div class="p-6">
              <h3 :class="['text-lg font-semibold mb-2', typeColors[type]]">{{ title }}</h3>
              <p class="text-white/80 mb-6">{{ message }}</p>
              <div class="flex gap-3 justify-end">
                <button
                  @click="handleCancel"
                  class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 transition-all duration-300"
                >
                  {{ cancelText }}
                </button>
                <button
                  @click="handleConfirm"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium transition-all duration-300',
                    'border text-white',
                    type === 'error'
                      ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50'
                      : type === 'warning'
                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50'
                        : type === 'success'
                          ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50',
                  ]"
                >
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
}
</style>
