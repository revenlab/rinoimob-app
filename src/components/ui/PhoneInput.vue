<template>
  <div ref="rootRef" class="flex gap-2 relative">
    <div class="relative flex-shrink-0">
      <button
        type="button"
        @click="isOpen = !isOpen"
        class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors whitespace-nowrap flex items-center gap-1"
      >
        <span>{{ selectedCountry.flag }}</span>
        <span class="text-xs text-slate-500 dark:text-slate-300">+{{ selectedCountry.ddi }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-slate-400 dark:text-slate-300">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        v-if="isOpen"
        class="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto w-64"
      >
        <button
          v-for="country in countries"
          :key="country.code"
          type="button"
          @click="selectCountry(country)"
          class="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-600 last:border-0 transition-colors"
          :class="selectedCountry.code === country.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''"
        >
          <span>{{ country.flag }}</span>
          <span class="flex-1 text-slate-800 dark:text-slate-100">{{ country.name }}</span>
          <span class="text-xs text-slate-500 dark:text-slate-300">+{{ country.ddi }}</span>
        </button>
      </div>
    </div>

    <input
      :value="phone"
      @input="updatePhone"
      @focus="isOpen = false"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      type="tel"
      class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { Country } from '@/composables/useCountryDDI'
import { useCountryDDI } from '@/composables/useCountryDDI'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  placeholder: '(11) 99999-9999',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { countries, defaultCountry } = useCountryDDI()
const sortedByLongestDdi = [...countries].sort((a, b) => b.ddi.length - a.ddi.length)

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const selectedCountry = ref<Country>(defaultCountry)
const phone = ref('')

const normalizeFromModel = (value: string) => {
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) {
    selectedCountry.value = defaultCountry
    phone.value = ''
    return
  }

  const matched = sortedByLongestDdi.find(country => cleaned.startsWith(country.ddi))
  if (matched) {
    selectedCountry.value = matched
    phone.value = cleaned.slice(matched.ddi.length)
    return
  }

  selectedCountry.value = defaultCountry
  phone.value = cleaned
}

const emitValue = () => {
  emit('update:modelValue', phone.value ? `+${selectedCountry.value.ddi}${phone.value}` : '')
}

const selectCountry = (country: Country) => {
  selectedCountry.value = country
  isOpen.value = false
  emitValue()
}

const updatePhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  phone.value = input.value.replace(/\D/g, '')
  emitValue()
}

const closeOnOutside = (event: MouseEvent) => {
  if (!isOpen.value) return
  const target = event.target as HTMLElement | null
  if (rootRef.value && target && !rootRef.value.contains(target)) {
    isOpen.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    normalizeFromModel(newValue ?? '')
  },
  { immediate: true }
)

document.addEventListener('click', closeOnOutside)

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
})
</script>
