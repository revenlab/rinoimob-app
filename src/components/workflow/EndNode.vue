<template>
  <div class="px-4 py-3 bg-red-500 text-white rounded-xl shadow-lg border-2 border-red-600 min-w-[180px]">
    <Handle type="target" :position="Position.Top" />
    <div class="flex items-center justify-between mb-2">
      <StopIcon class="w-6 h-6" />
    </div>
    <div class="font-bold text-sm">Fim</div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { StopIcon } from '@heroicons/vue/20/solid'
defineProps<{ data: Record<string, any> }>()
</script>
