<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  width?: 'xs' | 'sm' | 'md' | 'lg'
  collapsible?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 'md',
  collapsible: true,
  defaultOpen: true,
})
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
      'h-screen bg-white border-r border-slate-200',
      'transition-all duration-300 ease-out overflow-y-auto',
      sidebarClasses,
    ]"
  >
    <div
      v-if="collapsible"
      class="p-4 border-b border-slate-100 flex justify-end"
    >
      <button
        @click="isOpen = !isOpen"
        class="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
      >
        {{ isOpen ? '◀' : '▶' }}
      </button>
    </div>

    <div v-show="isOpen" class="p-4 space-y-4">
      <slot />
    </div>

    <div v-show="!isOpen" class="p-4 space-y-4 flex flex-col items-center">
      <slot name="collapsed" />
    </div>
  </aside>
</template>
