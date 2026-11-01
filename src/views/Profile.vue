<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Meu perfil</h1>
        <p class="text-xs text-slate-400">Informações pessoais e segurança da conta.</p>
      </div>
    </template>

    <div class="max-w-2xl space-y-6">
      <!-- Personal info -->
      <form @submit.prevent="handleUpdateProfile" class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div class="pb-1 border-b border-slate-100 dark:border-slate-700">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Informações pessoais</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Nome</label>
            <input
              v-model="firstName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :disabled="profileLoading"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Sobrenome</label>
            <input
              v-model="lastName"
              type="text"
              required
              class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
              :disabled="profileLoading"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">E-mail atual</label>
          <input :value="authStore.currentUser?.email" type="email" disabled class="w-full h-14 px-4 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-400 dark:text-slate-500 cursor-not-allowed" />
        </div>

        <div class="border-t border-slate-100 pt-5 dark:border-slate-700">
          <p class="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Página pública do corretor</p>
          <div class="mb-4 flex items-center gap-3">
            <img v-if="publicPhotoUrl" :src="publicPhotoUrl" alt="Foto pública" class="h-14 w-14 rounded-full object-cover" />
            <input type="file" accept="image/*" class="text-sm" @change="uploadPublicPhoto" />
          </div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Slug público</label>
          <input v-model="publicSlug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nome-do-corretor" class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl" />
          <label class="mt-4 block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Apresentação</label>
          <textarea v-model="publicBio" rows="3" placeholder="Conte brevemente como você atende seus clientes." class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl" />
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <input v-model="publicInstagramUrl" placeholder="Instagram ou @usuario" class="h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl" />
            <input v-model="publicCreci" placeholder="CRECI 12345-F" class="h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl" />
          </div>
          <div v-if="publicProfileUrl" class="mt-4 flex flex-wrap gap-2">
            <button type="button" @click="copyPublicProfileLink" class="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100">{{ linkCopied ? 'Link copiado!' : 'Copiar link público' }}</button>
            <button v-if="canShare" type="button" @click="sharePublicProfileLink" class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100">Compartilhar</button>
          </div>
        </div>

        <div v-if="profileError" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ profileError }}
        </div>
        <div v-if="profileSuccess" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ profileSuccess }}
        </div>

        <button
          type="submit"
          :disabled="profileLoading"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ profileLoading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>

      <form @submit.prevent="handleEmailChange" class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div class="pb-1 border-b border-slate-100 dark:border-slate-700">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Alterar e-mail</p>
          <p class="mt-2 text-sm text-slate-500">Enviaremos uma confirmação para o novo endereço antes de alterar seu acesso.</p>
        </div>
        <input v-model="newEmail" type="email" required placeholder="novo@email.com" :disabled="emailLoading" class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        <input v-model="emailCurrentPassword" type="password" required placeholder="Senha atual" :disabled="emailLoading" class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        <p v-if="emailError" class="text-sm text-red-600">{{ emailError }}</p>
        <p v-if="emailSuccess" class="text-sm text-emerald-700">{{ emailSuccess }}</p>
        <button type="submit" :disabled="emailLoading" class="w-full h-14 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-lg font-semibold rounded-2xl disabled:opacity-50">{{ emailLoading ? 'Enviando...' : 'Enviar confirmação' }}</button>
      </form>

      <!-- Change password -->
      <form @submit.prevent="handleChangePassword" class="bg-white/75 dark:bg-slate-800/75 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 space-y-5">
        <div class="pb-1 border-b border-slate-100 dark:border-slate-700">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Alterar senha</p>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Senha atual</label>
          <input
            v-model="currentPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="pwLoading"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Nova senha</label>
          <input
            v-model="newPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            :class="{ 'border-red-300': newPassword && !strengthNew.isValid.value }"
            placeholder="••••••••"
            :disabled="pwLoading"
          />
          <PasswordStrength
            :password="newPassword"
            :score="strengthNew.score.value"
            :strength-label="strengthNew.strengthLabel.value"
            :strength-color="strengthNew.strengthColor.value"
            :checks="strengthNew.checks.value"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-2">Confirmar nova senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full h-14 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="pwLoading"
          />
          <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-1.5 text-xs text-red-500">
            As senhas não coincidem.
          </p>
        </div>

        <div v-if="pwError" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ pwError }}
        </div>
        <div v-if="pwSuccess" class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {{ pwSuccess }}
        </div>

        <button
          type="submit"
          :disabled="pwLoading || !strengthNew.isValid.value || newPassword !== confirmPassword"
          class="w-full h-14 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ pwLoading ? 'Alterando...' : 'Alterar senha' }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import PasswordStrength from '@/components/ui/PasswordStrength.vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/auth'

const authStore = useAuthStore()

// --- Profile ---
const firstName = ref('')
const lastName = ref('')
const profileLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const newEmail = ref('')
const emailCurrentPassword = ref('')
const emailLoading = ref(false)
const emailSuccess = ref('')
const emailError = ref('')
const publicSlug = ref('')
const publicBio = ref('')
const publicInstagramUrl = ref('')
const publicCreci = ref('')
const publicPhotoUrl = ref<string | null>(null)
const linkCopied = ref(false)
const publicProfileUrl = computed(() => buildPublicProfileUrl(authStore.currentTenantSubdomain, publicSlug.value))
const canShare = computed(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function')

onMounted(() => {
  if (authStore.currentUser) {
    firstName.value = authStore.currentUser.firstName
    lastName.value = authStore.currentUser.lastName
  }
  authService.getPublicBrokerProfile().then(profile => {
    publicSlug.value = profile.slug ?? ''
    publicBio.value = profile.bio ?? ''
    publicInstagramUrl.value = profile.instagramUrl ?? ''
    publicCreci.value = profile.creci ?? ''
    publicPhotoUrl.value = profile.photoUrl
  }).catch(() => undefined)
})

async function handleUpdateProfile() {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''
  authStore.clearError()

  const success = await authStore.updateProfile(firstName.value, lastName.value)
  if (success) {
    try {
      const profile = await authService.updatePublicBrokerProfile({ slug: publicSlug.value, bio: publicBio.value, instagramUrl: publicInstagramUrl.value, creci: publicCreci.value })
      publicPhotoUrl.value = profile.photoUrl
    } catch (error) {
      profileError.value = error instanceof Error ? error.message : 'Erro ao atualizar o perfil público.'
      profileLoading.value = false
      return
    }
    profileSuccess.value = 'Perfil atualizado com sucesso!'
  } else {
    profileError.value = authStore.error ?? 'Erro ao atualizar perfil.'
  }

  profileLoading.value = false
}

async function uploadPublicPhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  profileError.value = ''
  try {
    const profile = await authService.uploadPublicBrokerPhoto(file)
    publicPhotoUrl.value = profile.photoUrl
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : 'Erro ao enviar a foto pública.'
  }
}

function buildPublicProfileUrl(subdomain: string | null, slug: string): string | null {
  if (!subdomain || !slug || typeof window === 'undefined') return null
  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
    ? `http://${subdomain}.localhost:3000`
    : `${window.location.protocol}//${[subdomain, ...window.location.hostname.split('.').slice(1)].join('.')}`
  return `${baseUrl}/corretor/${encodeURIComponent(slug)}`
}

async function copyPublicProfileLink() {
  if (!publicProfileUrl.value) return
  await navigator.clipboard.writeText(publicProfileUrl.value)
  linkCopied.value = true
  window.setTimeout(() => { linkCopied.value = false }, 2000)
}

async function sharePublicProfileLink() {
  if (!publicProfileUrl.value || !navigator.share) return
  await navigator.share({ title: 'Meu portfólio imobiliário', url: publicProfileUrl.value })
}

async function handleEmailChange() {
  emailLoading.value = true
  emailSuccess.value = ''
  emailError.value = ''
  const success = await authStore.requestEmailChange(newEmail.value, emailCurrentPassword.value)
  if (success) {
    emailSuccess.value = 'Enviamos um link de confirmação para o novo e-mail.'
    newEmail.value = ''
    emailCurrentPassword.value = ''
  } else {
    emailError.value = authStore.error ?? 'Erro ao solicitar alteração de e-mail.'
  }
  emailLoading.value = false
}

// --- Change password ---
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwLoading = ref(false)
const pwSuccess = ref('')
const pwError = ref('')

const strengthNew = usePasswordStrength(newPassword)

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = 'As senhas não coincidem.'
    return
  }
  if (!strengthNew.isValid.value) {
    pwError.value = 'A nova senha não atende aos requisitos mínimos de segurança.'
    return
  }

  pwLoading.value = true
  pwError.value = ''
  pwSuccess.value = ''
  authStore.clearError()

  const success = await authStore.changePassword(currentPassword.value, newPassword.value, confirmPassword.value)
  if (success) {
    pwSuccess.value = 'Senha alterada com sucesso!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    pwError.value = authStore.error ?? 'Erro ao alterar senha.'
  }

  pwLoading.value = false
}
</script>
