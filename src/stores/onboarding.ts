import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { driver, type Alignment, type Config, type DriveStep, type Driver, type Side } from 'driver.js'
import router from '@/router'
import onboardingService from '@/services/onboarding'
import { useAuthStore } from '@/stores/auth'
import {
  APP_CRM_CORE_TUTORIAL_KEY,
  type OnboardingStatus,
  type TutorialKey,
  type TutorialRouteKey,
} from '@/types/onboarding'

interface TourStepDefinition {
  id: string
  selector: string
  title: string
  description: string
  side?: Side
  align?: Alignment
  coreOnly?: boolean
  contextOnly?: boolean
}

const ROUTE_CONFIG: Record<TutorialRouteKey, { path: string; title: string }> = {
  dashboard: { path: '/dashboard', title: 'Dashboard' },
  leads: { path: '/leads', title: 'Leads' },
  properties: { path: '/imoveis', title: 'Imóveis' },
  tasks: { path: '/tarefas', title: 'Tarefas' },
  website: { path: '/website-config', title: 'Site' },
  whatsapp: { path: '/whatsapp', title: 'WhatsApp' },
}

const CORE_FLOW_ORDER: TutorialRouteKey[] = ['dashboard', 'leads', 'properties', 'tasks']

const STEP_REGISTRY: Record<TutorialRouteKey, TourStepDefinition[]> = {
  dashboard: [
    {
      id: 'dashboard-overview',
      selector: '[data-tour-id="dashboard-overview"]',
      title: 'Seu painel principal',
      description: 'Aqui você acompanha o que entrou no funil e o ritmo comercial do tenant.',
    },
    {
      id: 'dashboard-pipeline',
      selector: '[data-tour-id="dashboard-pipeline"]',
      title: 'Pipeline à vista',
      description: 'Os estágios do funil ficam resumidos no dashboard para você identificar gargalos rápido.',
      side: 'bottom',
    },
    {
      id: 'dashboard-tasks',
      selector: '[data-tour-id="dashboard-tasks"]',
      title: 'Pendências do dia',
      description: 'Use esta área para não perder follow-ups e próximas ações com os leads.',
      side: 'left',
    },
  ],
  leads: [
    {
      id: 'leads-overview',
      selector: '[data-tour-id="leads-overview"]',
      title: 'Central de leads',
      description: 'Aqui você organiza atendimento, alterna visualização e cria leads manualmente quando precisar.',
    },
    {
      id: 'leads-board',
      selector: '[data-tour-id="leads-board"]',
      title: 'Lista e kanban',
      description: 'O conteúdo desta área muda entre tabela e kanban, mas continua sendo o centro do funil.',
      side: 'top',
    },
  ],
  properties: [
    {
      id: 'properties-filters',
      selector: '[data-tour-id="properties-filters"]',
      title: 'Filtros do portfólio',
      description: 'Refine rápido por status, operação, tipo e cidade antes de editar ou revisar imóveis.',
    },
    {
      id: 'properties-create',
      selector: '[data-tour-id="properties-create"]',
      title: 'Cadastro de imóvel',
      description: 'Quando surgir uma nova captação, este atalho leva direto para o cadastro completo.',
      side: 'left',
    },
    {
      id: 'properties-list',
      selector: '[data-tour-id="properties-list"]',
      title: 'Seu estoque publicado',
      description: 'Cada card ou linha daqui vira base para atendimento, portal e follow-up com os leads.',
      side: 'top',
    },
  ],
  tasks: [
    {
      id: 'tasks-overview',
      selector: '[data-tour-id="tasks-overview"]',
      title: 'Rotina operacional',
      description: 'Esta tela concentra tarefas, agenda e prazos para o time manter o atendimento em movimento.',
    },
    {
      id: 'tasks-board',
      selector: '[data-tour-id="tasks-board"]',
      title: 'Execução e calendário',
      description: 'Você pode trabalhar em lista ou calendário sem sair da mesma tela.',
      side: 'top',
    },
    {
      id: 'tasks-next-steps',
      selector: '[data-tour-id="nav-site"]',
      title: 'Próximos passos do CRM',
      description: 'Depois de dominar leads, imóveis e tarefas, avance para Site e WhatsApp no menu lateral.',
      side: 'right',
      coreOnly: true,
    },
  ],
  website: [
    {
      id: 'website-domain',
      selector: '[data-tour-id="website-domain"]',
      title: 'Domínio e ativação',
      description: 'Aqui você acompanha o status do domínio público e acessa o fluxo detalhado quando precisar alterar a configuração.',
    },
    {
      id: 'website-tabs',
      selector: '[data-tour-id="website-tabs"]',
      title: 'Áreas da personalização',
      description: 'Use estas abas para alternar entre visual, conteúdo, contato, blog e a página Sobre sem sair da mesma tela.',
      side: 'bottom',
    },
    {
      id: 'website-editor',
      selector: '[data-tour-id="website-editor"]',
      title: 'Editor da vitrine',
      description: 'Os campos desta área controlam o que aparece no site público, desde branding até textos e seções da home.',
      side: 'right',
    },
    {
      id: 'website-preview',
      selector: '[data-tour-id="website-preview"]',
      title: 'Prévia rápida',
      description: 'A prévia resume como a marca e os contatos estão ficando antes de abrir o site real em outra aba.',
      side: 'left',
    },
  ],
  whatsapp: [
    {
      id: 'whatsapp-overview',
      selector: '[data-tour-id="whatsapp-overview"]',
      title: 'Central do WhatsApp',
      description: 'Esta tela concentra os números conectados ao tenant e o status de cada operação.',
    },
    {
      id: 'whatsapp-add',
      selector: '[data-tour-id="whatsapp-add"]',
      title: 'Novo número',
      description: 'Use este atalho para cadastrar outra instância e iniciar a conexão com QR Code.',
      side: 'left',
    },
    {
      id: 'whatsapp-list',
      selector: '[data-tour-id="whatsapp-list"]',
      title: 'Instâncias cadastradas',
      description: 'Aqui você acompanha conexão, nome exibido e o telefone associado a cada número do WhatsApp.',
      side: 'top',
    },
    {
      id: 'whatsapp-actions',
      selector: '[data-tour-id="whatsapp-actions"]',
      title: 'Ações operacionais',
      description: 'Cada instância oferece atalhos para QR Code, reconexão, configurações e remoção.',
      side: 'top',
    },
  ],
}

const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const useOnboardingStore = defineStore('onboarding', () => {
  const authStore = useAuthStore()

  const activeDriver = ref<Driver | null>(null)
  const activeMode = ref<'core' | 'contextual' | null>(null)
  const activeRouteKey = ref<TutorialRouteKey | null>(null)
  const initialized = ref(false)
  const suppressDismissPersistence = ref(false)
  const autoStartConsumed = ref(false)
  const lastUserId = ref<string | null>(null)

  const currentRouteKey = computed(() => {
    if (authStore.isInternalStaff) return null
    return (router.currentRoute.value.meta.tutorialRouteKey ?? null) as TutorialRouteKey | null
  })

  const canOpenCurrentRouteTutorial = computed(() => !!currentRouteKey.value)

  function initialize() {
    if (initialized.value) return
    initialized.value = true
  }

  async function handleRouteChange() {
    if (authStore.currentUser?.id !== lastUserId.value) {
      if (activeDriver.value?.isActive()) {
        suppressDismissPersistence.value = true
        activeDriver.value.destroy()
      }
      lastUserId.value = authStore.currentUser?.id ?? null
      autoStartConsumed.value = false
      teardown()
    }

    if (activeDriver.value?.isActive() && activeMode.value === 'contextual' && currentRouteKey.value !== activeRouteKey.value) {
      suppressDismissPersistence.value = true
      activeDriver.value.destroy()
      teardown()
      return
    }

    await maybeAutoStart()
  }

  async function maybeAutoStart() {
    if (activeDriver.value?.isActive()) return
    if (autoStartConsumed.value) return
    if (authStore.isInternalStaff || !authStore.currentUser) return
    if (currentRouteKey.value !== 'dashboard') return

    const summary = authStore.onboarding
    if (!summary || summary.tutorialKey !== APP_CRM_CORE_TUTORIAL_KEY || summary.status !== 'NOT_STARTED') return

    autoStartConsumed.value = true
    await runRouteTour('dashboard', 'core', 0)
  }

  async function startContextualTourForCurrentRoute() {
    const routeKey = currentRouteKey.value
    if (!routeKey || activeDriver.value?.isActive()) return
    await runRouteTour(routeKey, 'contextual', CORE_FLOW_ORDER.indexOf(routeKey))
  }

  async function runRouteTour(routeKey: TutorialRouteKey, mode: 'core' | 'contextual', flowIndex: number) {
    const stepDefinitions = STEP_REGISTRY[routeKey].filter(step => {
      if (mode === 'core' && step.contextOnly) return false
      if (mode === 'contextual' && step.coreOnly) return false
      return true
    })

    const steps = await buildDriveSteps(stepDefinitions, routeKey, mode, flowIndex)
    if (!steps.length) {
      if (mode === 'core') {
        await continueCoreFlow(flowIndex)
      }
      return
    }

    activeMode.value = mode
    activeRouteKey.value = routeKey
    suppressDismissPersistence.value = false

    const config: Config = {
      animate: true,
      overlayColor: '#0f172a',
      overlayOpacity: 0.55,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      showProgress: true,
      showButtons: ['previous', 'next', 'close'],
      popoverClass: 'rino-onboarding-popover',
      onDestroyStarted: (_, step) => {
        if (suppressDismissPersistence.value) return

        const stepId = extractStepId(step)
        const routePath = ROUTE_CONFIG[routeKey].path
        teardown()

        if (mode === 'core') {
          void persist(APP_CRM_CORE_TUTORIAL_KEY, {
            status: 'DISMISSED',
            lastStepKey: stepId,
            lastRoute: routePath,
          })
        }
      },
      onDestroyed: () => {
        if (!suppressDismissPersistence.value) {
          teardown()
        }
      },
    }

    const instance = driver(config)
    instance.setSteps(steps)
    activeDriver.value = instance
    instance.drive()
  }

  async function buildDriveSteps(stepDefinitions: TourStepDefinition[],
                                 routeKey: TutorialRouteKey,
                                 mode: 'core' | 'contextual',
                                 flowIndex: number): Promise<DriveStep[]> {
    await waitForTargets(stepDefinitions)

    const availableSteps = stepDefinitions.filter(step => !!document.querySelector(step.selector))

    return availableSteps.map((stepDefinition, index) => {
      const isLastStep = index === availableSteps.length - 1

      return {
        element: stepDefinition.selector,
        popover: {
          title: stepDefinition.title,
          description: stepDefinition.description,
          side: stepDefinition.side ?? 'bottom',
          align: stepDefinition.align ?? 'start',
          showButtons: ['previous', 'next', 'close'],
          prevBtnText: 'Voltar',
          nextBtnText: isLastStep ? (mode === 'core' && flowIndex === CORE_FLOW_ORDER.length - 1 ? 'Concluir' : 'Próximo') : 'Próximo',
          doneBtnText: 'Concluir',
          onPrevClick: () => activeDriver.value?.movePrevious(),
          onCloseClick: () => activeDriver.value?.destroy(),
          onNextClick: () => {
            void handleNext(stepDefinition.id, routeKey, mode, flowIndex, isLastStep)
          },
        },
      }
    })
  }

  async function handleNext(stepId: string,
                            routeKey: TutorialRouteKey,
                            mode: 'core' | 'contextual',
                            flowIndex: number,
                            isLastStep: boolean) {
    if (mode === 'contextual') {
      if (!isLastStep) {
        activeDriver.value?.moveNext()
        return
      }

      suppressDismissPersistence.value = true
      activeDriver.value?.destroy()
      teardown()
      return
    }

    const routePath = ROUTE_CONFIG[routeKey].path

    if (!isLastStep) {
      await persist(APP_CRM_CORE_TUTORIAL_KEY, {
        status: 'IN_PROGRESS',
        lastStepKey: stepId,
        lastRoute: routePath,
      })
      activeDriver.value?.moveNext()
      return
    }

    if (flowIndex === CORE_FLOW_ORDER.length - 1) {
      await persist(APP_CRM_CORE_TUTORIAL_KEY, {
        status: 'COMPLETED',
        lastStepKey: stepId,
        lastRoute: routePath,
      })
      suppressDismissPersistence.value = true
      activeDriver.value?.destroy()
      teardown()
      return
    }

    await persist(APP_CRM_CORE_TUTORIAL_KEY, {
      status: 'IN_PROGRESS',
      lastStepKey: stepId,
      lastRoute: routePath,
    })

    suppressDismissPersistence.value = true
    activeDriver.value?.destroy()
    teardown()
    await continueCoreFlow(flowIndex)
  }

  async function continueCoreFlow(flowIndex: number) {
    const nextRouteKey = CORE_FLOW_ORDER[flowIndex + 1]
    if (!nextRouteKey) return

    await router.push(ROUTE_CONFIG[nextRouteKey].path)
    await nextTick()
    await wait(150)
    await runRouteTour(nextRouteKey, 'core', flowIndex + 1)
  }

  async function waitForTargets(stepDefinitions: TourStepDefinition[]) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await nextTick()
      if (stepDefinitions.some(step => document.querySelector(step.selector))) {
        return
      }
      await wait(150)
    }
  }

  async function persist(tutorialKey: TutorialKey, payload: {
    status: OnboardingStatus
    lastStepKey?: string | null
    lastRoute?: string | null
  }) {
    const summary = await onboardingService.updateProgress(tutorialKey, payload)
    authStore.setOnboarding(summary)
  }

  function teardown() {
    activeDriver.value = null
    activeMode.value = null
    activeRouteKey.value = null
    suppressDismissPersistence.value = false
  }

  function extractStepId(step: DriveStep): string | null {
    const element = typeof step.element === 'string'
      ? document.querySelector(step.element)
      : step.element instanceof Element
        ? step.element
        : null

    return element?.getAttribute('data-tour-id') ?? null
  }

  return {
    initialize,
    handleRouteChange,
    maybeAutoStart,
    startContextualTourForCurrentRoute,
    canOpenCurrentRouteTutorial,
  }
})
