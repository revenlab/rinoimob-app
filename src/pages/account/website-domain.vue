<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Domínio do site</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Use seu próprio domínio no site e acompanhe a ativação por aqui.</p>
      </div>
    </template>

    <div class="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
      <section class="space-y-6">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div class="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_38%),linear-gradient(135deg,_#fffdf8_0%,_#f8fafc_48%,_#eef4ff_100%)] p-6 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#172033_48%,_#111827_100%)]">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="space-y-3">
                <span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                  Configuração do site
                </span>
                <div>
                  <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
                    {{ currentDomain || 'Nenhum domínio configurado' }}
                  </h2>
                  <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {{ statusMessage }}
                  </p>
                </div>
              </div>
              <button
                v-if="currentDomain"
                type="button"
                @click="reloadSavedDomain"
                :disabled="isLoading"
                class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Recarregar
              </button>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" :class="statusBadgeClass">
                {{ statusLabel }}
              </span>
              <span v-if="currentTarget" class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
                Endereço de conexão disponível
              </span>
            </div>
          </div>

          <div class="grid gap-4 p-6 md:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Seu domínio</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-900 dark:text-white">
                {{ currentDomain || 'Nenhum domínio configurado' }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Próximo passo</p>
              <p class="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {{ nextStepMessage }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Segurança do acesso</p>
              <p class="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {{ httpsMessage }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">Informar domínio</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Digite o domínio principal que seus clientes vão acessar. Depois de salvar, copie os dados de DNS exibidos ao lado para o painel onde o domínio foi comprado.
              </p>
            </div>
          </div>

          <div class="mt-5 space-y-2">
            <label for="domain" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Domínio do site</label>
            <input
              id="domain"
              v-model="domainInput"
              type="text"
              placeholder="exemplo.com.br"
              class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-cyan-950"
              @input="validateDomain"
              :disabled="isLoading"
            />
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Exemplo aceito: <span class="font-medium text-slate-700 dark:text-slate-300">meusite.com.br</span>. Prefixos como https:// e www são removidos automaticamente.
            </p>
          </div>

          <div v-if="domainError" class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {{ domainError }}
          </div>
          <div v-else-if="domainInput && isValidDomain" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            Domínio válido. Ele será salvo como <span class="font-semibold">{{ normalizedDomainInput }}</span>.
          </div>

          <div v-if="domainInput && isValidDomain" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Prévia</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-300">
              O site ficará acessível em <span class="font-mono font-semibold text-blue-700 dark:text-blue-300">https://{{ normalizedDomainInput }}</span>
            </p>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              @click="saveDomain"
              :disabled="!isValidDomain || isLoading || !domainChanged"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-slate-700"
            >
              {{ isLoading ? 'Salvando...' : 'Salvar domínio' }}
            </button>
            <button
              v-if="domainChanged"
              type="button"
              @click="cancelEdit"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              v-if="currentDomain"
              type="button"
              @click="removeDomain"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
            >
              {{ isLoading ? 'Removendo...' : 'Remover' }}
            </button>
          </div>
        </div>
      </section>

      <aside class="space-y-6">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">Dados para colocar no DNS</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Crie um registro no painel do provedor do domínio com os campos abaixo.
              </p>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div v-for="record in dnsRecords" :key="record.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{{ record.label }}</p>
                  <p class="mt-2 break-all font-mono text-sm font-semibold text-slate-900 dark:text-white">{{ record.value }}</p>
                  <p v-if="record.help" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ record.help }}</p>
                </div>
                <button
                  type="button"
                  @click="copyText(record.value, record.copyMessage)"
                  :disabled="record.disabled"
                  :title="`Copiar ${record.label}`"
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ClipboardDocumentIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-200">Linha pronta</p>
                <code class="mt-2 block break-all text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {{ dnsRecordLine }}
                </code>
              </div>
              <button
                type="button"
                @click="copyDnsRecordLine"
                :disabled="!canCopyDns"
                title="Copiar linha pronta"
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
              >
                <ClipboardDocumentIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            Use <span class="font-semibold">CNAME</span>. Não use registros A ou AAAA para esse domínio. Se o painel não aceitar CNAME no domínio principal, procure por CNAME flattening, ALIAS ou ANAME; são nomes diferentes para o mesmo tipo de apontamento em alguns provedores.
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Como concluir</h3>
          <div class="mt-5 space-y-4">
            <div v-for="step in setupSteps" :key="step.title" class="flex gap-4">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white dark:bg-blue-600">
                {{ step.number }}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ step.title }}</p>
                <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useNotification } from '@/composables/useNotification'
import websiteConfigService from '@/services/websiteConfig'
import { ClipboardDocumentIcon } from '@heroicons/vue/20/solid'

const domainInput = ref('')
const currentDomain = ref<string | null>(null)
const currentStatus = ref<string | null>(null)
const currentTarget = ref<string | null>(null)
const isLoading = ref(false)
const domainError = ref('')
const { showError, showSuccess } = useNotification()

const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

const normalizedDomainInput = computed(() => normalizeDomain(domainInput.value))

const isValidDomain = computed(() => {
  if (!domainInput.value) return false
  const domain = domainInput.value.trim()
  return domain.length > 0 && domain.length <= 255 && domainRegex.test(normalizeDomain(domain))
})

const domainChanged = computed(() => {
  return normalizeDomain(domainInput.value) !== (currentDomain.value || '')
})

const setupSteps = [
  { number: '1', title: 'Salvar o domínio', description: 'Cadastre o endereço final do site. O sistema salva a versão ajustada automaticamente.' },
  { number: '2', title: 'Abrir o painel de DNS', description: 'Entre no painel onde o domínio foi comprado, como Registro.br, GoDaddy, Hostinger ou Cloudflare, e abra a zona DNS.' },
  { number: '3', title: 'Criar o registro CNAME', description: 'Adicione um registro CNAME usando o nome/host e o valor/destino mostrados nesta tela. O TTL pode ficar automático ou padrão.' },
  { number: '4', title: 'Aguardar ativação', description: 'Depois de salvar no DNS, a conexão segura é liberada automaticamente quando a propagação terminar.' },
]

const statusLabel = computed(() => {
  if (!currentDomain.value) return 'Não configurado'
  const status = (currentStatus.value || '').toUpperCase()
  if (status === 'PENDING') return 'Em configuração'
  if (status === 'ACTIVE') return 'Ativo'
  if (status === 'FAILED') return 'Precisa de atenção'
  if (status === 'DELETING') return 'Removendo'
  return currentStatus.value || 'Pendente'
})

const statusBadgeClass = computed(() => {
  const status = (currentStatus.value || '').toUpperCase()
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/20'
  if (status === 'FAILED') return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/20'
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/20'
  return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-500/20'
})

const statusMessage = computed(() => {
  if (!currentDomain.value) {
    return 'Ainda não há um domínio configurado. Informe o endereço do site para começar a conexão.'
  }

  const status = (currentStatus.value || '').toUpperCase()
  if (status === 'ACTIVE') {
    return 'Seu domínio já está ativo. O site pode ser acessado com conexão segura.'
  }
  if (status === 'PENDING') {
    return 'A configuração foi iniciada. Falta concluir o apontamento do domínio para finalizar a ativação.'
  }
  if (status === 'FAILED') {
    return 'A configuração não foi concluída. Revise o domínio informado e tente novamente.'
  }

  return 'Use o fluxo abaixo para concluir a conexão e acompanhar a ativação.'
})

const nextStepMessage = computed(() => {
  const status = (currentStatus.value || '').toUpperCase()
  if (!currentDomain.value) return 'Salvar um domínio para gerar o endereço de conexão.'
  if (status === 'PENDING') return 'Concluir ou revisar o apontamento do domínio no provedor onde ele é administrado.'
  if (status === 'ACTIVE') return 'Validar o acesso público do site no navegador.'
  if (status === 'FAILED') return 'Revisar o domínio salvo e tentar a configuração novamente.'
  return 'Recarregar os dados salvos ou revisar a configuração.'
})

const httpsMessage = computed(() => {
  const status = (currentStatus.value || '').toUpperCase()
  if (status === 'ACTIVE') return 'A conexão segura já está ativa para esse domínio.'
  if (status === 'PENDING') return 'A conexão segura será ativada assim que o domínio terminar de apontar corretamente.'
  return 'A conexão segura é liberada automaticamente quando a configuração do domínio for concluída.'
})

const dnsTargetPlaceholder = 'Disponível após salvar o domínio'
const canCopyDns = computed(() => Boolean(currentDomain.value && currentTarget.value))

const dnsRecords = computed(() => [
  {
    label: 'Tipo',
    value: 'CNAME',
    help: 'É o tipo correto para conectar o site. Não preencha como A nem AAAA.',
    disabled: false,
    copyMessage: 'Tipo de registro copiado',
  },
  {
    label: 'Nome ou host',
    value: currentDomain.value ? '@' : 'Disponível após salvar o domínio',
    help: currentDomain.value
      ? `Use @ para o domínio principal. Se o provedor pedir o nome completo, use ${currentDomain.value}.`
      : 'Esse campo aparece depois que o domínio for salvo.',
    disabled: !currentDomain.value,
    copyMessage: 'Nome/host copiado',
  },
  {
    label: 'Valor ou destino',
    value: currentTarget.value || dnsTargetPlaceholder,
    help: 'Cole exatamente esse endereço no campo valor, destino, alvo ou target.',
    disabled: !currentTarget.value,
    copyMessage: 'Valor/destino copiado',
  },
  {
    label: 'TTL',
    value: 'Automático',
    help: 'Se não existir automático, use o valor padrão do provedor.',
    disabled: false,
    copyMessage: 'TTL copiado',
  },
])

const dnsRecordLine = computed(() => {
  if (!currentDomain.value || !currentTarget.value) {
    return 'Salve um domínio para gerar a linha pronta do DNS'
  }

  return `Tipo: CNAME | Nome/Host: @ | Valor/Destino: ${currentTarget.value} | TTL: Automático`
})

const normalizeDomain = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .split('/')[0]
  .split(':')[0]
  .replace(/\.$/, '')

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

const validateDomain = () => {
  if (!domainInput.value) {
    domainError.value = ''
    return
  }

  const domain = normalizeDomain(domainInput.value)

  if (domain.length > 255) {
    domainError.value = 'Domínio muito longo (máximo 255 caracteres)'
    return
  }

  if (!domainRegex.test(domain)) {
    domainError.value = 'Formato de domínio inválido'
    return
  }

  domainError.value = ''
}

const loadCurrentDomain = async () => {
  isLoading.value = true
  try {
    const data = await websiteConfigService.getCustomDomain()
    currentDomain.value = data.customDomain
    currentStatus.value = data.customDomainStatus ?? null
    currentTarget.value = data.customDomainTarget ?? null
    domainInput.value = data.customDomain || ''
  } catch (error: unknown) {
    console.error('Erro ao carregar domínio:', error)
    showError(errorMessage(error, 'Erro ao carregar configuração de domínio'))
  } finally {
    isLoading.value = false
  }
}

const saveDomain = async () => {
  if (!isValidDomain.value) {
    domainError.value = 'Domínio inválido'
    return
  }

  isLoading.value = true
  try {
    const newDomain = normalizeDomain(domainInput.value) || null
    const result = await websiteConfigService.updateCustomDomain(newDomain)
    currentDomain.value = result.customDomain
    currentStatus.value = result.customDomainStatus ?? null
    currentTarget.value = result.customDomainTarget ?? null
    domainInput.value = result.customDomain || ''
    domainError.value = ''
    showSuccess(newDomain ? 'Domínio atualizado com sucesso' : 'Domínio removido com sucesso')
  } catch (error: unknown) {
    console.error('Erro ao salvar domínio:', error)
    showError(errorMessage(error, 'Erro ao salvar domínio'))
  } finally {
    isLoading.value = false
  }
}

const removeDomain = async () => {
  if (!confirm('Tem certeza que deseja remover este domínio do site?')) {
    return
  }

  isLoading.value = true
  try {
    await websiteConfigService.updateCustomDomain(null)
    currentDomain.value = null
    currentStatus.value = null
    currentTarget.value = null
    domainInput.value = ''
    domainError.value = ''
    showSuccess('Domínio removido com sucesso')
  } catch (error: unknown) {
    console.error('Erro ao remover domínio:', error)
    showError(errorMessage(error, 'Erro ao remover domínio'))
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  domainInput.value = currentDomain.value || ''
  domainError.value = ''
}

const copyText = async (value: string, message = 'Copiado') => {
  if (!value || !navigator?.clipboard) return
  try {
    await navigator.clipboard.writeText(value)
    showSuccess(message)
  } catch (error: unknown) {
    showError(errorMessage(error, 'Não foi possível copiar automaticamente'))
  }
}

const copyDnsRecordLine = async () => {
  if (!canCopyDns.value) return
  await copyText(dnsRecordLine.value, 'Configuração de DNS copiada')
}

const reloadSavedDomain = async () => {
  await loadCurrentDomain()
}

onMounted(() => {
  loadCurrentDomain()
})
</script>
