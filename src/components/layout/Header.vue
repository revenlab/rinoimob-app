<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  sticky?: boolean
  showSearch?: boolean
}

withDefaults(defineProps<Props>(), {
  sticky: true,
  showSearch: true,
})

const searchQuery = ref('')

const emit = defineEmits<{
  search: [query: string]
}>()

function handleSearch() {
  emit('search', searchQuery.value)
}
</script>

<template>
  <header
    :class="[
      'bg-white border-b border-slate-200 shadow-sm',
      sticky ? 'sticky top-0 z-30' : '',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between gap-6">
        <div class="flex items-center gap-3 flex-shrink-0">
          <img
            src="/logo_rinoimob.svg"
            :alt="title || 'Rinoimob'"
            class="h-10 w-auto object-contain"
          />
        </div>

        <div v-if="showSearch" class="flex-1 max-w-md">
          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar..."
              class="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition text-sm"
              @keydown.enter="handleSearch"
            />
            <button
              @click="handleSearch"
              class="h-10 px-4 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-2xl text-sm font-medium shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:translate-y-[-1px] transition-all duration-200"
            >
              Buscar
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </header>
</template>
