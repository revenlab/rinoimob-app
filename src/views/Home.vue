<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f2f4f8] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md text-center">
      <div class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-400/40 mb-4">
        <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 11 12 3l9 8" />
          <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-slate-950 tracking-tight mb-2">Rinoimob</h1>
      <p class="text-slate-500 mb-8">Plataforma de gestão imobiliária.</p>
      <RouterLink
        to="/login"
        class="inline-flex items-center justify-center h-14 px-8 bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:translate-y-[-1px] transition-all duration-200"
      >
        Acessar plataforma
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
