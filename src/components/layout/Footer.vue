<script setup lang="ts">
interface Props {
  company?: string
  year?: number
  links?: Array<{ label: string; href: string }>
}

withDefaults(defineProps<Props>(), {
  company: 'RinoIMob',
  year: new Date().getFullYear(),
})
</script>

<template>
  <footer class="bg-white/10 backdrop-blur-xl border-t border-white/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- About -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">{{ company }}</h3>
          <p class="text-white/60 text-sm">
            <slot name="about">
              Building the future of real estate management with modern web technologies.
            </slot>
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold text-white/90 mb-4 uppercase">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in links" :key="link.href">
              <a
                :href="link.href"
                class="text-white/60 hover:text-white text-sm transition-colors duration-300"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Social -->
        <div>
          <h4 class="text-sm font-semibold text-white/90 mb-4 uppercase">Follow Us</h4>
          <div class="flex gap-4">
            <slot name="social">
              <a href="#" class="text-white/60 hover:text-white text-lg transition-colors">
                f
              </a>
              <a href="#" class="text-white/60 hover:text-white text-lg transition-colors">
                𝕏
              </a>
              <a href="#" class="text-white/60 hover:text-white text-lg transition-colors">
                in
              </a>
            </slot>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between">
        <p class="text-white/60 text-sm">
          © {{ year }} {{ company }}. All rights reserved.
        </p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a href="#" class="text-white/60 hover:text-white text-sm transition-colors">
            Privacy
          </a>
          <a href="#" class="text-white/60 hover:text-white text-sm transition-colors">
            Terms
          </a>
          <a href="#" class="text-white/60 hover:text-white text-sm transition-colors">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
