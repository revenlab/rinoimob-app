<script setup lang="ts">
interface Props {
  title?: string
  showHeader?: boolean
  showSidebar?: boolean
}

withDefaults(defineProps<Props>(), {
  showHeader: true,
  showSidebar: false,
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <header
      v-if="showHeader"
      class="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-white">{{ title || 'RinoIMob' }}</h1>
      </nav>
    </header>

    <div class="flex">
      <aside v-if="showSidebar" class="w-64 bg-white/5 backdrop-blur-lg border-r border-white/20">
        <slot name="sidebar" />
      </aside>

      <main class="flex-1">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
