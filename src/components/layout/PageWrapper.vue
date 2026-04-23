<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  fullHeight?: boolean
  container?: boolean
}

withDefaults(defineProps<Props>(), {
  fullHeight: true,
  container: true,
})
</script>

<template>
  <div
    :class="[
      'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      fullHeight ? 'min-h-screen' : '',
      'flex flex-col',
    ]"
  >
    <!-- Optional Page Header -->
    <header v-if="title" class="border-b border-white/20 bg-white/5 backdrop-blur-sm">
      <div :class="['px-4 sm:px-6 lg:px-8 py-8', container ? 'max-w-7xl mx-auto' : '']">
        <h1 class="text-3xl font-bold text-white">{{ title }}</h1>
        <p v-if="description" class="mt-2 text-white/60">{{ description }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main :class="['flex-1', container ? 'max-w-7xl mx-auto w-full' : '']">
      <div :class="['px-4 sm:px-6 lg:px-8 py-12', container ? '' : 'w-full']">
        <slot />
      </div>
    </main>

    <!-- Optional Footer Slot -->
    <footer v-if="$slots.footer" class="border-t border-white/20 mt-auto">
      <slot name="footer" />
    </footer>
  </div>
</template>
