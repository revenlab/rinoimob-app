<template>
  <button @click="open = true" class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-400">Configurar funis</button>
  <Teleport to="body"><div v-if="open" class="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"><div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-4"><h2 class="font-bold text-slate-900 dark:text-white">Funis de leads</h2><button @click="open=false" class="text-slate-400">Fechar</button></div>
    <p class="text-xs text-slate-500 mb-4">Ganho e Perdido são incluídos e protegidos automaticamente.</p>
    <div v-for="pipeline in pipelines" :key="pipeline.id" class="border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3"><p class="font-semibold text-sm">{{ pipeline.name }} <span v-if="pipeline.defaultPipeline" class="text-xs text-indigo-500">Padrão</span></p><p class="text-xs text-slate-500 mt-1">{{ pipeline.stages.map(s => s.name).join(' → ') }}</p><p class="text-xs text-slate-400 mt-1">Origens: {{ pipeline.sources.join(', ') || 'nenhuma' }}</p></div>
    <form @submit.prevent="create" class="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3"><p class="text-sm font-semibold">Novo funil</p><input v-model="name" required placeholder="Nome do funil" class="w-full px-3 py-2 border rounded-xl bg-transparent"/><input v-model="stages" required placeholder="Etapas abertas, separadas por vírgula" class="w-full px-3 py-2 border rounded-xl bg-transparent"/><input v-model="sources" placeholder="Origens, separadas por vírgula" class="w-full px-3 py-2 border rounded-xl bg-transparent"/><p v-if="error" class="text-xs text-red-500">{{ error }}</p><button class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Criar funil</button></form>
  </div></div></Teleport>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { leadPipelineService } from '@/services/lead'
import type { LeadPipeline } from '@/types/lead'
const emit = defineEmits<{ updated: [] }>()
const open = ref(false), pipelines = ref<LeadPipeline[]>([]), name = ref(''), stages = ref(''), sources = ref(''), error = ref('')
async function load() { pipelines.value = await leadPipelineService.list() }
watch(open, value => { if (value) load().catch(() => error.value = 'Sem permissão para consultar os funis.') })
async function create() { try { error.value = ''; await leadPipelineService.create({ name: name.value, stages: stages.value.split(',').map(name => ({ name: name.trim() })).filter(s => s.name), sources: sources.value.split(',').map(s => s.trim()).filter(Boolean) }); name.value=''; stages.value=''; sources.value=''; await load(); emit('updated') } catch { error.value = 'Não foi possível criar o funil. Verifique sua permissão e os dados.' } }
</script>
