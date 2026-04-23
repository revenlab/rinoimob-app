<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()
</script>

<template>
  <div class="w-full space-y-2">
    <label v-if="label" class="block text-sm font-medium text-white/90">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>

    <div class="relative">
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="label || placeholder"
        :aria-required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'error-message' : hint ? 'hint-message' : undefined"
        :class="[
          'w-full px-4 py-2 rounded-lg transition-all duration-300',
          'bg-white/10 backdrop-blur-lg border border-white/30',
          'text-white placeholder-white/40',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500/50 bg-red-500/5' : 'hover:bg-white/15 hover:border-white/40',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
    </div>

    <p v-if="error" id="error-message" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" id="hint-message" class="text-sm text-white/50">{{ hint }}</p>
  </div>
</template>
