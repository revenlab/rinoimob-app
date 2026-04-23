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
      'bg-white/10 backdrop-blur-xl border-b border-white/30',
      sticky ? 'sticky top-0 z-30' : '',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between gap-6">
        <!-- Title -->
        <div class="flex-shrink-0">
          <h1 class="text-2xl font-bold text-white">{{ title || 'RinoIMob' }}</h1>
        </div>

        <!-- Search Bar -->
        <div v-if="showSearch" class="flex-1 max-w-md">
          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="flex-1 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              @keydown.enter="handleSearch"
            />
            <button
              @click="handleSearch"
              class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300"
            >
              🔍
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </header>
</template>
