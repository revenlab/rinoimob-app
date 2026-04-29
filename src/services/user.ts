import type { UserSummary } from '@/types/lead'
import { apiFetch, API_BASE } from '@/lib/api'

const BASE = `${API_BASE}/users`

class UserService {
  async listActive(): Promise<UserSummary[]> {
    return apiFetch<UserSummary[]>(BASE)
  }
}

export default new UserService()
