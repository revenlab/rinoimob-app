<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center">
          <img
            src="/logo_rinoimob.svg"
            alt="Rinoimob"
            class="h-14 w-auto object-contain"
          />
        </div>
        <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Crie sua conta</h1>
        <p class="text-slate-500">Comece a gerenciar seus imoveis em minutos.</p>
      </div>

      <form @submit.prevent="handleSignup" class="bg-white/75 border border-slate-200 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">

        <div class="pb-1 border-b border-slate-100">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">Sobre sua empresa</p>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Nome da empresa</label>
          <input
            v-model="tenantName"
            type="text"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="Imobiliaria Exemplo"
            :disabled="authStore.isLoading"
            @input="onTenantNameInput"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Subdomínio</label>
          <div class="flex items-center h-14 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-transparent transition">
            <input
              v-model="subdomain"
              type="text"
              required
              pattern="^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$"
              class="flex-1 h-full px-4 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              placeholder="exemplo"
              :disabled="authStore.isLoading"
              @input="onSubdomainInput"
            />
            <span class="pr-4 text-slate-400 text-sm select-none">.rinoimob.com</span>
          </div>
          <p v-if="subdomainError" class="mt-1 text-xs text-red-500">{{ subdomainError }}</p>
        </div>

        <div class="pt-1 pb-1 border-b border-slate-100">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">Seu acesso</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Nome</label>
            <input
              v-model="firstName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="Joao"
              :disabled="authStore.isLoading"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Sobrenome</label>
            <input
              v-model="lastName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              placeholder="Silva"
              :disabled="authStore.isLoading"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="you@example.com"
            :disabled="authStore.isLoading"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Senha</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
          <PasswordStrength
            :password="password"
            :score="strength.score.value"
            :strength-label="strength.strengthLabel.value"
            :strength-color="strength.strengthColor.value"
            :checks="strength.checks.value"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">Confirmar senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="authStore.isLoading"
          />
          <p v-if="confirmPassword && password !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="authStore.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading || !strength.isValid.value"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-slate-500 text-sm">
          Ja possui conta?
          <RouterLink to="/login" class="font-semibold text-indigo-700 hover:text-indigo-800">
            Entrar
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PasswordStrength from '@/components/ui/PasswordStrength.vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const router = useRouter()
const authStore = useAuthStore()

const tenantName = ref('')
const subdomain = ref('')
const subdomainError = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const strength = usePasswordStrength(password)

const SUBDOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/

function toSubdomainSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
}

function onTenantNameInput() {
  if (!subdomain.value) {
    subdomain.value = toSubdomainSlug(tenantName.value)
  }
}

function onSubdomainInput() {
  subdomain.value = toSubdomainSlug(subdomain.value)
  subdomainError.value = subdomain.value && !SUBDOMAIN_PATTERN.test(subdomain.value)
    ? 'Use apenas letras, números e hífens. Não pode começar ou terminar com hífen.'
    : ''
}

const handleSignup = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.setError('As senhas não coincidem')
    return
  }

  if (!strength.isValid.value) {
    authStore.setError('A senha não atende aos requisitos mínimos de segurança')
    return
  }

  if (!SUBDOMAIN_PATTERN.test(subdomain.value)) {
    subdomainError.value = 'Subdomínio inválido'
    return
  }

  const success = await authStore.signup({
    tenantName: tenantName.value,
    subdomain: subdomain.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  })

  if (success) {
    router.push({ name: 'VerificationPending' })
  }
}
</script>
