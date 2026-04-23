<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  interactive: false,
})

const paddingClasses = {
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div
    :class="[
      'rounded-2xl transition-all duration-300',
      'bg-white/10 backdrop-blur-xl border border-white/30',
      'hover:border-white/40',
      interactive ? 'cursor-pointer hover:bg-white/15 hover:shadow-lg' : '',
      paddingClasses[padding],
    ]"
  >
    <h3 v-if="title" class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
    <p v-if="description" class="text-sm text-white/70 mb-4">{{ description }}</p>
    <slot />
  </div>
</template>
