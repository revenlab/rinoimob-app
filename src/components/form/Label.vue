<script setup lang="ts">
interface Props {
  text?: string
  htmlFor?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}
</script>

<template>
  <label
    v-if="htmlFor"
    :for="htmlFor"
    :class="[
      'block font-medium text-white/90 transition-colors duration-300',
      sizeClasses[size],
    ]"
  >
    <span v-if="text">{{ text }}</span>
    <slot />
    <span v-if="required" class="text-red-400 ml-1">*</span>
  </label>

  <label
    v-else
    :class="[
      'block font-medium text-white/90 transition-colors duration-300',
      sizeClasses[size],
    ]"
  >
    <span v-if="text">{{ text }}</span>
    <slot />
    <span v-if="required" class="text-red-400 ml-1">*</span>
  </label>
</template>
