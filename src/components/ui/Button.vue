<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = {
  primary: 'bg-white/20 hover:bg-white/30 text-white border border-white/30',
  secondary: 'bg-transparent hover:bg-white/10 text-white border border-white/50',
}

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'rounded-lg font-medium transition-all duration-300',
      'backdrop-blur-lg',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="!loading">
      <slot />
    </span>
    <span v-else class="inline-block animate-spin">⏳</span>
  </button>
</template>
