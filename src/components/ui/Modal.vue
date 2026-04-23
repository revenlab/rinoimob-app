<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closeable?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  closeable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-show="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 transition-all duration-300"
        @click.self="handleClose"
      >
        <Transition name="scale">
          <div
            v-show="modelValue"
            :class="[
              'rounded-2xl shadow-2xl',
              'bg-white/15 backdrop-blur-xl border border-white/30',
              'max-h-[90vh] overflow-auto',
              sizeClasses[size],
            ]"
          >
            <div class="flex items-center justify-between p-6 border-b border-white/20">
              <h2 class="text-xl font-semibold text-white">{{ title }}</h2>
              <button
                v-if="closeable"
                @click="handleClose"
                class="text-white/60 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            <div class="p-6">
              <slot />
            </div>
            <div class="flex gap-3 justify-end p-6 border-t border-white/20">
              <slot name="footer">
                <button
                  @click="handleClose"
                  class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 transition-all duration-300"
                >
                  Close
                </button>
              </slot>
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
