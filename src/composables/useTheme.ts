import { ref, computed } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>(localStorage.getItem('theme') as Theme || 'dark')

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  }
}
