<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
  filterable?: boolean
  sortable?: boolean
}

interface Row {
  [key: string]: any
}

interface Props {
  columns: Column[]
  rows: Row[]
  itemsPerPage?: number
}

withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
})

const props = defineProps<Props>()

const searchQuery = ref('')
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

const filteredRows = computed(() => {
  if (!searchQuery.value) return props.rows
  
  return props.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase()),
    ),
  )
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value
  
  return [...filteredRows.value].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  return sortedRows.value.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(sortedRows.value.length / props.itemsPerPage))

function toggleSort(columnKey: string) {
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = columnKey
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="flex-1 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
    </div>

    <div class="overflow-x-auto rounded-lg border border-white/30 bg-white/10 backdrop-blur-lg">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/20">
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-4 text-left text-sm font-semibold text-white/90',
                column.sortable ? 'cursor-pointer hover:bg-white/10 transition-colors' : '',
              ]"
              @click="column.sortable && toggleSort(column.key)"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <span v-if="column.sortable && sortKey === column.key" class="text-xs">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in paginatedRows"
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

    <div class="flex items-center justify-between px-4">
      <span class="text-sm text-white/60">
        Showing {{ Math.min(searchQuery ? sortedRows.length : props.rows.length, currentPage * props.itemsPerPage) }}
        of {{ searchQuery ? sortedRows.length : props.rows.length }}
      </span>
      <div class="flex gap-2">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 disabled:opacity-50"
        >
          ← Prev
        </button>
        <span class="px-4 py-2 text-white/80">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>
