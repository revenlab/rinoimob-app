import type { TenantBillingPlanOption } from '@/types/billing'

export type BillingFeatureKey =
  | 'blogEnabled'
  | 'customDomainEnabled'
  | 'automationCrmEnabled'
  | 'publicApiEnabled'

export interface BillingFeatureDefinition {
  key: BillingFeatureKey
  label: string
  description: string
  requiredPlanCode: TenantBillingPlanOption['code']
  requiredPlanName: string
}

export const BILLING_FEATURES: Record<BillingFeatureKey, BillingFeatureDefinition> = {
  blogEnabled: {
    key: 'blogEnabled',
    label: 'Blog',
    description: 'Publique conteúdo no site da imobiliária e atraia novos leads.',
    requiredPlanCode: 'STARTER',
    requiredPlanName: 'Starter',
  },
  customDomainEnabled: {
    key: 'customDomainEnabled',
    label: 'Domínio customizado',
    description: 'Use o endereço próprio da sua imobiliária no site público.',
    requiredPlanCode: 'STARTER',
    requiredPlanName: 'Starter',
  },
  automationCrmEnabled: {
    key: 'automationCrmEnabled',
    label: 'Automações CRM',
    description: 'Automatize ações e acompanhamentos do seu processo comercial.',
    requiredPlanCode: 'PRIME',
    requiredPlanName: 'Prime',
  },
  publicApiEnabled: {
    key: 'publicApiEnabled',
    label: 'API pública',
    description: 'Integre o Rinoimob com sistemas externos usando a API pública.',
    requiredPlanCode: 'PRIME',
    requiredPlanName: 'Prime',
  },
}

export function isBillingFeatureKey(value: unknown): value is BillingFeatureKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(BILLING_FEATURES, value)
}

declare module 'vue-router' {
  interface RouteMeta {
    requiredBillingFeature?: BillingFeatureKey
  }
}
