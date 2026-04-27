import { computed, type Ref } from 'vue'

export interface PasswordCheck {
  label: string
  valid: boolean
}

export function usePasswordStrength(password: Ref<string>) {
  const checks = computed<PasswordCheck[]>(() => [
    { label: 'Mínimo 6 caracteres', valid: password.value.length >= 6 },
    { label: 'Letra maiúscula', valid: /[A-Z]/.test(password.value) },
    { label: 'Letra minúscula', valid: /[a-z]/.test(password.value) },
    { label: 'Número', valid: /\d/.test(password.value) },
    { label: 'Caractere especial (@$!%*?&_-#^)', valid: /[@$!%*?&_\-#^]/.test(password.value) },
  ])

  const score = computed(() => checks.value.filter(c => c.valid).length)

  const isValid = computed(() => score.value === 5)

  const strengthLabel = computed(() => {
    if (score.value === 0) return ''
    if (score.value <= 2) return 'Fraca'
    if (score.value <= 3) return 'Média'
    if (score.value === 4) return 'Boa'
    return 'Forte'
  })

  const strengthColor = computed(() => {
    if (score.value <= 2) return 'bg-red-400'
    if (score.value <= 3) return 'bg-amber-400'
    if (score.value === 4) return 'bg-blue-400'
    return 'bg-emerald-500'
  })

  return { checks, score, isValid, strengthLabel, strengthColor }
}
