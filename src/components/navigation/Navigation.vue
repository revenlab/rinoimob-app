<script setup lang="ts">
import { ref, computed } from 'vue'

interface NavItem {
  label: string
  href: string
  icon?: string
  active?: boolean
}

interface Props {
  items: NavItem[]
  logo?: string
  mobileMenuOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  mobileMenuOpen: false,
})

const emit = defineEmits<{
  'update:mobileMenuOpen': [value: boolean]
}>()

const isOpen = ref(false)
</script>

<template>
  <nav class="sticky top-0 z-40 bg-white/10 backdrop-blur-lg border-b border-white/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <span class="text-xl font-bold text-white">{{ logo || 'RinoIMob' }}</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            :class="[
              'px-4 py-2 rounded-lg transition-all duration-300',
              item.active
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10',
            ]"
          >
            <span v-if="item.icon" class="mr-2">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="isOpen = !isOpen"
          class="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <span v-if="!isOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <Transition name="slide">
        <div v-show="isOpen" class="md:hidden pb-4 space-y-2">
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            :class="[
              'block px-4 py-2 rounded-lg transition-all duration-300',
              item.active
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10',
            ]"
          >
            <span v-if="item.icon" class="mr-2">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
