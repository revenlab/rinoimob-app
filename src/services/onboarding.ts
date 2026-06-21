import { apiFetch, API_BASE } from '@/lib/api'
import type { OnboardingSummary, TutorialKey, UpdateOnboardingPayload } from '@/types/onboarding'

class OnboardingService {
  async updateProgress(tutorialKey: TutorialKey, payload: UpdateOnboardingPayload): Promise<OnboardingSummary> {
    return apiFetch<OnboardingSummary>(`${API_BASE}/users/onboarding/${tutorialKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

export default new OnboardingService()
