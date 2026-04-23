<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  label: string
  icon?: string
  action?: () => void
  submenu?: MenuItem[]
}

interface Props {
  items: MenuItem[]
  orientation?: 'vertical' | 'horizontal'
}

withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
})

const props = defineProps<Props>()
const openSubmenu = ref<number | null>(null)

function toggleSubmenu(index: number) {
  openSubmenu.value = openSubmenu.value === index ? null : index
}
</script>

<template>
  <ul
    :class="[
      'space-y-1',
      orientation === 'horizontal' ? 'flex gap-2' : '',
    ]"
  >
    <li v-for="(item, index) in items" :key="index" class="relative group">
      <button
        @click="item.action && item.action()"
        :class="[
          'w-full px-4 py-2 rounded-lg transition-all duration-300',
          'text-white/80 hover:text-white hover:bg-white/10',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
        ]"
      >
        <span v-if="item.icon" class="mr-2">{{ item.icon }}</span>
        {{ item.label }}
        <span v-if="item.submenu" class="ml-2 text-xs">
          {{ openSubmenu === index ? '▼' : '▶' }}
        </span>
      </button>

      <!-- Submenu -->
      <Transition name="slide">
        <ul
          v-if="item.submenu && openSubmenu === index"
          :class="[
            'mt-1 pl-4 space-y-1 border-l border-white/20',
            orientation === 'horizontal' ? 'absolute top-full left-0 border-l-0 border border-white/20 rounded-lg bg-white/10 backdrop-blur-lg p-2 min-w-max' : '',
          ]"
        >
          <li v-for="(subitem, subindex) in item.submenu" :key="subindex">
            <button
              @click="subitem.action && subitem.action()"
              :class="[
                'w-full text-left px-3 py-1 rounded text-sm',
                'text-white/70 hover:text-white hover:bg-white/10 transition-colors',
              ]"
            >
              <span v-if="subitem.icon" class="mr-2">{{ subitem.icon }}</span>
              {{ subitem.label }}
            </button>
          </li>
        </ul>
      </Transition>
    </li>
  </ul>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
