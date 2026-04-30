<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggle } = useTheme()

const collapsed = ref(false)

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
  },
  {
    label: 'Imóveis',
    to: '/imoveis',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`,
  },
  {
    label: 'Categorias',
    to: '/categorias',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" /></svg>`,
  },
  {
    label: 'Leads',
    to: '/leads',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>`,
  },
  {
    label: 'Tarefas',
    to: '/tarefas',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  },
  {
    label: 'Negociações',
    to: '/negociacoes',
    soon: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`,
  },
]

const accountItems = [
  {
    label: 'Perfil',
    to: '/profile',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`,
  }
]

const isActive = (to: string) => route.path === to || (to !== '/dashboard' && route.path.startsWith(to))

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="min-h-screen bg-[#f2f4f8] dark:bg-slate-900 flex">
    <!-- Sidebar -->
    <aside
      class="h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out z-40"
      :class="collapsed ? 'w-[72px]' : 'w-60'"
    >
      <!-- Logo + toggle -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-700 min-h-[68px]">
        <RouterLink v-if="!collapsed" to="/dashboard" class="flex items-center">
          <img v-if="!isDark" src="/logo_rinoimob.svg" alt="Rinoimob" class="h-12 w-auto object-contain" />
          <img v-else src="/logo_rinoimob_white.svg" alt="Rinoimob" class="h-12 w-auto object-contain" />
        </RouterLink>
        <RouterLink v-else to="/dashboard" class="mx-auto">
          <img src="/icon_rinoimob.svg" alt="R" class="h-8 w-8 object-contain" />
        </RouterLink>
        <button
          @click="collapsed = !collapsed"
          :class="collapsed ? 'mx-auto' : ''"
          class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-1"
          :title="collapsed ? 'Expandir' : 'Recolher'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path v-if="!collapsed" stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <!-- Section label -->
        <p v-if="!collapsed" class="px-3 mb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">
          Principal
        </p>

        <template v-for="item in navItems" :key="item.to">
          <component
            :is="item.soon ? 'div' : RouterLink"
            v-bind="item.soon ? {} : { to: item.to }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
            :class="[
              item.soon
                ? 'text-slate-300 cursor-default'
                : isActive(item.to)
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200',
              collapsed ? 'justify-center' : '',
            ]"
            :title="collapsed ? item.label : undefined"
          >
            <span v-html="item.icon" class="shrink-0" />
            <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
            <span
              v-if="!collapsed && item.soon"
              class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
            >em breve</span>
          </component>
        </template>

        <!-- Divider -->
        <div class="my-3 border-t border-slate-100 dark:border-slate-700" />

        <!-- Account section -->
        <p v-if="!collapsed" class="px-3 mb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">
          Conta
        </p>

        <RouterLink
          v-for="item in accountItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          :class="[
            isActive(item.to)
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200',
            collapsed ? 'justify-center' : '',
          ]"
          :title="collapsed ? item.label : undefined"
        >
          <span v-html="item.icon" class="shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User footer -->
      <div class="border-t border-slate-100 dark:border-slate-700 p-3">
        <div
          class="flex items-center gap-3 px-2 py-2 rounded-xl"
          :class="collapsed ? 'justify-center' : ''"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {{ authStore.currentUser?.firstName?.charAt(0) ?? '?' }}{{ authStore.currentUser?.lastName?.charAt(0) ?? '' }}
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
            </p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.currentUser?.email }}</p>
          </div>
          <button
            v-if="!collapsed"
            @click="handleLogout"
            class="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors shrink-0"
            title="Sair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
          <button
            v-else
            @click="handleLogout"
            class="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top header -->
      <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30 h-[68px] flex items-center px-6 gap-4">
        <div class="flex-1 min-w-0">
          <slot name="header">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ $route.meta.title as string ?? '' }}</h1>
          </slot>
        </div>
        <!-- Theme toggle -->
        <button @click="toggle" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition shrink-0" :title="isDark ? 'Tema claro' : 'Tema escuro'">
          <!-- Moon icon when light -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          <!-- Sun icon when dark -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
