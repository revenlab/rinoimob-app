<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="text-xs text-slate-400">Bem-vindo de volta, {{ authStore.currentUser?.firstName }}!</p>
      </div>
    </template>

    <!-- Row 1: 4 metric cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <RouterLink
        to="/leads"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow hover:shadow-md transition-shadow"
      >
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Leads Totais</p>
        <p class="text-3xl font-bold text-violet-600 dark:text-violet-400">{{ metrics.total }}</p>
        <p class="text-xs text-slate-400 mt-1">Todos os períodos</p>
      </RouterLink>

      <RouterLink
        to="/leads"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow hover:shadow-md transition-shadow"
      >
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Novos Esta Semana</p>
        <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ metrics.thisWeek }}</p>
        <p class="text-xs text-slate-400 mt-1">↑ 0% vs semana anterior</p>
      </RouterLink>

      <RouterLink
        to="/leads"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow hover:shadow-md transition-shadow"
      >
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Em Contato</p>
        <p class="text-3xl font-bold text-amber-500">{{ metrics.contacted }}</p>
        <p class="text-xs text-slate-400 mt-1">Em andamento</p>
      </RouterLink>

      <RouterLink
        to="/leads"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow hover:shadow-md transition-shadow"
      >
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Taxa de Conversão</p>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ metrics.conversionRate.toFixed(0) }}%</p>
        <p class="text-xs text-slate-400 mt-1">{{ metrics.won }} ganhos / {{ metrics.total }} leads</p>
      </RouterLink>
    </div>

    <!-- Row 2: Pipeline de Vendas -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6 shadow">
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Pipeline de Vendas</p>
        <RouterLink to="/leads" class="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          Ver tudo →
        </RouterLink>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/leads"
          class="flex-1 bg-violet-700/20 dark:bg-violet-900/40 border border-violet-500/30 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
        >
          <p class="text-2xl font-bold text-violet-300">{{ metrics.newLeads }}</p>
          <p class="text-xs text-violet-300 font-medium mt-0.5">NOVOS</p>
        </RouterLink>
        <span class="text-slate-400 text-xl flex-shrink-0">›</span>
        <RouterLink
          to="/leads"
          class="flex-1 bg-slate-600/30 dark:bg-slate-700/60 border border-slate-500/30 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
        >
          <p class="text-2xl font-bold text-slate-300">{{ metrics.contacted }}</p>
          <p class="text-xs text-slate-300 font-medium mt-0.5">CONTATO</p>
        </RouterLink>
        <span class="text-slate-400 text-xl flex-shrink-0">›</span>
        <RouterLink
          to="/leads"
          class="flex-1 bg-indigo-700/20 dark:bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
        >
          <p class="text-2xl font-bold text-indigo-300">{{ metrics.qualified }}</p>
          <p class="text-xs text-indigo-300 font-medium mt-0.5">QUALIF.</p>
        </RouterLink>
        <span class="text-slate-400 text-xl flex-shrink-0">›</span>
        <RouterLink
          to="/leads"
          class="flex-1 bg-emerald-700/20 dark:bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
        >
          <p class="text-2xl font-bold text-emerald-300">{{ metrics.won }}</p>
          <p class="text-xs text-emerald-300 font-medium mt-0.5">GANHOS</p>
        </RouterLink>
        <span class="text-slate-400 text-xl flex-shrink-0">›</span>
        <RouterLink
          to="/leads"
          class="flex-1 bg-red-700/20 dark:bg-red-900/40 border border-red-500/30 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
        >
          <p class="text-2xl font-bold text-red-300">{{ metrics.lost }}</p>
          <p class="text-xs text-red-300 font-medium mt-0.5">PERDIDOS</p>
        </RouterLink>
      </div>
    </div>

    <!-- Row 3: 3 columns -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Left: Tarefas Pendentes -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Tarefas Pendentes</p>
          <RouterLink to="/tarefas" class="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            Ver tudo →
          </RouterLink>
        </div>

        <div class="flex-1 space-y-3">
          <template v-if="pendingTasks.length > 0">
            <div
              v-for="task in pendingTasks"
              :key="task.id"
              class="flex items-center gap-3"
            >
              <span
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: task.taskTypeColor ?? '#6366f1' }"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ task.title }}</p>
              </div>
              <template v-if="dueLabel(task.dueAt ?? undefined)">
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  :class="dueLabel(task.dueAt ?? undefined)!.classes"
                >
                  {{ dueLabel(task.dueAt ?? undefined)!.text }}
                </span>
              </template>
            </div>
          </template>
          <p v-else class="text-sm text-slate-400 text-center py-4">Nenhuma tarefa pendente</p>
        </div>

        <RouterLink
          to="/tarefas"
          class="w-full mt-4 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          + Nova Tarefa
        </RouterLink>
      </div>

      <!-- Middle: Atividade Recente -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Atividade Recente</p>
          <RouterLink to="/leads" class="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            Ver tudo →
          </RouterLink>
        </div>

        <div class="flex-1 space-y-3">
          <template v-if="recentActivity.length > 0">
            <div
              v-for="event in recentActivity"
              :key="event.id"
              class="flex items-center gap-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                :class="eventIconBg(event.eventType)"
              >
                <span v-if="event.eventType === 'CREATED'">+</span>
                <span v-else-if="event.eventType === 'STATUS_CHANGED'">⇄</span>
                <span v-else-if="event.eventType === 'NOTE_ADDED'">💬</span>
                <span v-else-if="event.eventType === 'ASSIGNED'">✓</span>
                <span v-else>•</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ eventTitle(event.eventType) }}</p>
                <p class="text-xs text-slate-400 truncate">{{ timeAgo(event.createdAt) }}</p>
              </div>
            </div>
          </template>
          <p v-else class="text-sm text-slate-400 text-center py-4">Nenhuma atividade recente</p>
        </div>

        <div class="mt-4 text-right">
          <RouterLink to="/leads" class="text-xs text-indigo-600 hover:underline">Ver tudo →</RouterLink>
        </div>
      </div>

      <!-- Right: Perfil -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow flex flex-col">
        <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Perfil</p>

        <div class="flex flex-col items-center mb-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-3">
            <span class="text-xl font-bold text-white">{{ initials() }}</span>
          </div>
          <p class="text-lg font-bold text-slate-900 dark:text-white text-center">
            {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
          </p>
          <p class="text-xs text-slate-400 break-all text-center mt-0.5">{{ authStore.currentUser?.email }}</p>
        </div>

        <hr class="border-slate-200 dark:border-slate-700 mb-3" />

        <div class="flex-1 space-y-0.5">
          <div class="flex justify-between items-center py-1.5 text-sm">
            <span class="text-slate-500">Membro desde</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ formatDate(authStore.currentUser?.createdAt) }}</span>
          </div>
          <div class="flex justify-between items-center py-1.5 text-sm">
            <span class="text-slate-500">Status</span>
            <span
              v-if="authStore.currentUser?.active"
              class="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold"
            >Ativo</span>
            <span
              v-else
              class="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold"
            >Inativo</span>
          </div>
          <div class="flex justify-between items-center py-1.5 text-sm">
            <span class="text-slate-500">Último acesso</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">Agora</span>
          </div>
        </div>

        <RouterLink
          :to="{ path: '/leads', query: { new: '1' } }"
          class="w-full mt-4 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          + Novo Lead
        </RouterLink>
        <RouterLink
          to="/profile"
          class="w-full mt-2 h-10 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center"
        >
          Editar perfil
        </RouterLink>
      </div>

    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import leadService from '@/services/lead'
import taskService from '@/services/task'
import type { TaskResponse } from '@/types/task'
import type { LeadEventResponse } from '@/types/lead'

const authStore = useAuthStore()

const metrics = ref({
  total: 0,
  newLeads: 0,
  contacted: 0,
  qualified: 0,
  won: 0,
  lost: 0,
  thisWeek: 0,
  conversionRate: 0,
})

const pendingTasks = ref<TaskResponse[]>([])
const recentActivity = ref<(LeadEventResponse & { leadName?: string })[]>([])

function formatDate(date?: string): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function dueLabel(dueAt?: string): { text: string; classes: string } | null {
  if (!dueAt) return null
  const now = new Date()
  const due = new Date(dueAt)
  const todayStr = now.toDateString()
  const dueStr = due.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const tomorrowStr = tomorrow.toDateString()
  if (dueStr === todayStr) {
    return { text: 'Hoje', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  }
  if (dueStr === tomorrowStr) {
    return { text: 'Amanhã', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
  }
  if (due < now) {
    return { text: 'Atrasada', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  }
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return { text: days[due.getDay()], classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
}

function timeAgo(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const dStr = d.toDateString()
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (dStr === todayStr) return `Hoje às ${timeStr}`
  if (dStr === yesterday.toDateString()) return `Ontem às ${timeStr}`
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return `${diffDays} dias atrás`
}

function eventTitle(type: string): string {
  const map: Record<string, string> = {
    CREATED: 'Novo lead criado',
    STATUS_CHANGED: 'Status atualizado',
    NOTE_ADDED: 'Nota adicionada',
    ASSIGNED: 'Lead atribuído',
    PROPERTY_LINKED: 'Imóvel vinculado',
    TASK_COMPLETED: 'Tarefa concluída',
  }
  return map[type] ?? 'Atividade registrada'
}

function eventIconBg(type: string): string {
  if (type === 'CREATED') return 'bg-emerald-500'
  if (type === 'STATUS_CHANGED') return 'bg-blue-500'
  if (type === 'NOTE_ADDED') return 'bg-indigo-500'
  if (type === 'TASK_COMPLETED' || type === 'ASSIGNED') return 'bg-violet-500'
  return 'bg-slate-500'
}

function initials(): string {
  return `${authStore.currentUser?.firstName?.[0] ?? ''}${authStore.currentUser?.lastName?.[0] ?? ''}`.toUpperCase()
}

onMounted(async () => {
  try {
    metrics.value = await leadService.getStats()
  } catch { /* best-effort */ }

  try {
    const r = await taskService.list({ pending: true, size: 3 })
    pendingTasks.value = r.content
  } catch { /* best-effort */ }

  try {
    const page = await leadService.list({ size: 3 })
    const allEvents: (LeadEventResponse & { leadName?: string })[] = []
    for (const lead of page.content) {
      const evs = await leadService.getEvents(lead.id)
      evs.forEach(e => allEvents.push({ ...e, leadName: lead.name }))
    }
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    recentActivity.value = allEvents.slice(0, 5)
  } catch { /* best-effort */ }
})
</script>
