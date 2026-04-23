<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

interface Row {
  [key: string]: any
}

interface Props {
  columns: Column[]
  rows: Row[]
  sortable?: boolean
}

withDefaults(defineProps<Props>(), {
  sortable: true,
})

const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  
  return [...props.rows].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const props = defineProps<Props>()

function toggleSort(columnKey: string) {
  if (!props.sortable) return
  
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = columnKey
    sortDirection.value = 'asc'
  }
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-white/30 bg-white/10 backdrop-blur-lg">
    <table class="w-full">
      <thead>
        <tr class="border-b border-white/20">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-4 text-left text-sm font-semibold text-white/90',
              column.width ? `w-${column.width}` : '',
              column.sortable && sortable ? 'cursor-pointer hover:bg-white/10 transition-colors' : '',
            ]"
            @click="toggleSort(column.key)"
          >
            <div class="flex items-center gap-2">
              {{ column.label }}
              <span v-if="column.sortable && sortable && sortKey === column.key" class="text-xs">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in sortedRows"
          :key="idx"
          class="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
        >
          <td v-for="column in columns" :key="column.key" class="px-6 py-4 text-sm text-white/80">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
