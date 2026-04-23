<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  error?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Enter value...',
  type: 'text',
  disabled: false,
  readonly: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}
</script>

<template>
  <div class="w-full">
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="[
        'w-full rounded-lg transition-all duration-300',
        'bg-white/10 backdrop-blur-lg border border-white/30',
        'text-white placeholder-white/50',
        'focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20',
        'hover:bg-white/15 hover:border-white/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        error ? 'border-red-500/50' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
    <p v-if="error" class="mt-1 text-sm text-red-400">{{ error }}</p>
  </div>
</template>
