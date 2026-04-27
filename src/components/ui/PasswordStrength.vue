<script setup lang="ts">
import type { PasswordCheck } from '@/composables/usePasswordStrength'

defineProps<{
  password: string
  score: number
  strengthLabel: string
  strengthColor: string
  checks: PasswordCheck[]
}>()
</script>

<template>
  <div v-if="password.length > 0" class="mt-2 space-y-2">
    <!-- Strength bar -->
    <div class="flex items-center gap-2">
      <div class="flex gap-1 flex-1">
        <div
          v-for="i in 5"
          :key="i"
          class="h-1.5 flex-1 rounded-full transition-all duration-300"
          :class="i <= score ? strengthColor : 'bg-slate-200'"
        />
      </div>
      <span
        v-if="strengthLabel"
        class="text-xs font-semibold min-w-[2.5rem] text-right transition-colors"
        :class="{
          'text-red-500': score <= 2,
          'text-amber-500': score === 3,
          'text-blue-500': score === 4,
          'text-emerald-600': score === 5,
        }"
      >{{ strengthLabel }}</span>
    </div>

    <!-- Checklist -->
    <ul class="grid grid-cols-2 gap-x-4 gap-y-1">
      <li
        v-for="check in checks"
        :key="check.label"
        class="flex items-center gap-1.5 text-xs transition-colors"
        :class="check.valid ? 'text-emerald-600' : 'text-slate-400'"
      >
        <svg v-if="check.valid" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
        {{ check.label }}
      </li>
    </ul>
  </div>
</template>
