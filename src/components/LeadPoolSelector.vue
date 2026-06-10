<template>
  <div>
    <label class="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Bolsão</label>
    <select v-model="selected" @change="onChange" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none">
      <option value="">Sem bolsão</option>
      <option v-for="p in pools" :key="p.id" :value="p.id">{{ p.name }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import leadPoolsService from '@/services/leadPools'
import type { LeadPoolResponse } from '@/types/lead'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<[string, string | null]>();

const pools = ref<LeadPoolResponse[]>([])
const selected = ref<string | null>(props.modelValue ?? null)

watch(() => props.modelValue, (v) => selected.value = v ?? null)

onMounted(async () => {
  try {
    pools.value = await leadPoolsService.list()
  } catch {
    pools.value = []
  }
})

function onChange() {
  emit('update:modelValue', selected.value)
}
</script>
