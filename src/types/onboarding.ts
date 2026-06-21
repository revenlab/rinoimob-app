export const APP_CRM_CORE_TUTORIAL_KEY = 'APP_CRM_CORE_V1' as const

export type TutorialKey = typeof APP_CRM_CORE_TUTORIAL_KEY

export type OnboardingStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DISMISSED'
  | 'COMPLETED'

export type TutorialRouteKey = 'dashboard' | 'leads' | 'properties' | 'tasks' | 'website' | 'whatsapp'

export interface OnboardingSummary {
  tutorialKey: string
  status: OnboardingStatus
  lastStepKey: string | null
  lastRoute: string | null
  completedAt: string | null
  dismissedAt: string | null
}

export interface UpdateOnboardingPayload {
  status: OnboardingStatus
  lastStepKey?: string | null
  lastRoute?: string | null
}

declare module 'vue-router' {
  interface RouteMeta {
    tutorialRouteKey?: TutorialRouteKey
  }
}
