<script setup lang="ts">
interface Props {
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  message?: string
}

withDefaults(defineProps<Props>(), {
  loading: true,
  size: 'md',
  variant: 'spinner',
})

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

const messageSizeClasses = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-lg',
}
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center gap-4">
    <!-- Spinner Variant -->
    <div
      v-if="variant === 'spinner'"
      :class="[
        'rounded-full border-4 border-white/20 border-t-white animate-spin',
        sizeClasses[size],
      ]"
    />

    <!-- Dots Variant -->
    <div v-if="variant === 'dots'" class="flex gap-2">
      <div
        v-for="i in 3"
        :key="i"
        :class="[
          'rounded-full bg-white',
          sizeClasses[size],
          'animate-bounce',
        ]"
        :style="{ animationDelay: `${i * 0.1}s` }"
      />
    </div>

    <!-- Pulse Variant -->
    <div
      v-if="variant === 'pulse'"
      :class="[
        'rounded-full bg-white/30 animate-pulse',
        sizeClasses[size],
      ]"
    />

    <!-- Message -->
    <p
      v-if="message"
      :class="[
        'text-white/70',
        messageSizeClasses[size],
      ]"
    >
      {{ message }}
    </p>
  </div>
</template>
