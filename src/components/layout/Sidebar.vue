<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  width?: 'xs' | 'sm' | 'md' | 'lg'
  collapsible?: boolean
  defaultOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  width: 'md',
  collapsible: true,
  defaultOpen: true,
})

const props = defineProps<Props>()
const isOpen = ref(props.defaultOpen)

const widthClasses = {
  xs: 'w-48',
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-80',
}

const sidebarClasses = computed(() => ({
  [widthClasses[props.width]]: isOpen.value,
  'w-20': !isOpen.value,
}))
</script>

<template>
  <aside
    :class="[
      'h-screen bg-white/10 backdrop-blur-xl border-r border-white/30',
      'transition-all duration-300 ease-out overflow-y-auto',
      sidebarClasses,
    ]"
  >
    <!-- Toggle Button -->
    <div
      v-if="collapsible"
      class="p-4 border-b border-white/20 flex justify-end"
    >
      <button
        @click="isOpen = !isOpen"
        class="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
      >
        {{ isOpen ? '◀' : '▶' }}
      </button>
    </div>

    <!-- Sidebar Content -->
    <div v-show="isOpen" class="p-4 space-y-4">
      <slot />
    </div>

    <!-- Collapsed State Icons -->
    <div v-show="!isOpen" class="p-4 space-y-4 flex flex-col items-center">
      <slot name="collapsed" />
    </div>
  </aside>
</template>
