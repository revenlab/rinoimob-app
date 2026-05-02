<template>
  <div class="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg border-2 border-red-600">
    <div class="font-bold text-sm">⊗ End</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: Record<string, any>
}>()
</script>
