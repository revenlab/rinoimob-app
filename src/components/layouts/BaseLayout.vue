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
  <div class="min-h-screen bg-[#f2f4f8]">
    <header
      v-if="showHeader"
      class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <img
          src="/logo_rinoimob.svg"
          :alt="title || 'Rinoimob'"
          class="h-10 w-auto object-contain"
        />
      </nav>
    </header>

    <div class="flex">
      <aside v-if="showSidebar" class="w-64 min-h-screen bg-white border-r border-slate-200">
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
