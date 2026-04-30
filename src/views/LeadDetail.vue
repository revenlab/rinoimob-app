<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full flex-wrap gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button
            @click="router.push('/leads')"
            class="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Leads
          </button>
          <span class="text-slate-300 dark:text-slate-600">/</span>
          <h1 v-if="store.currentLead" class="text-lg font-bold text-slate-900 dark:text-white truncate">
            {{ store.currentLead.name }}
          </h1>
          <span v-if="store.currentLead" class="text-xs text-slate-400 flex-shrink-0">
            criado {{ daysAgo(store.currentLead.createdAt) }}
          </span>
          <span
            v-if="store.currentLead"
            :class="statusClass(store.currentLead.status)"
            class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
          >
            {{ statusLabel(store.currentLead.status) }}
          </span>
        </div>
        <div v-if="store.currentLead" class="flex items-center gap-2">
          <button
            @click="toggleEdit"
            class="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {{ isEditing ? 'Cancelar' : 'Editar' }}
          </button>
          <button
            v-if="isEditing"
            @click="saveEdits"
            :disabled="savingEdit"
            class="px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all"
          >
            {{ savingEdit ? 'Salvando...' : 'Salvar' }}
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Remover
          </button>
        </div>
      </div>
    </template>

    <template #default>
      <!-- Loading -->
      <div v-if="store.isLoading && !store.currentLead" class="flex items-center justify-center py-24">
        <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- 404 -->
      <div v-else-if="!store.currentLead && !store.isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
        <p class="text-slate-500 dark:text-slate-400 text-sm">Lead não encontrado</p>
        <button @click="router.push('/leads')" class="px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl text-sm font-medium">
          ← Voltar para Leads
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="store.currentLead" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- ── Left column (col-span-2) ─────────────────────────────────── -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Card 1: Lead Info -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Informações do Lead</h2>

            <div v-if="editError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
              {{ editError }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nome -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Nome</p>
                <input
                  v-if="isEditing"
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p v-else class="text-sm text-slate-800 dark:text-slate-200">{{ store.currentLead.name }}</p>
              </div>

              <!-- Email -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Email</p>
                <input
                  v-if="isEditing"
                  v-model="editForm.email"
                  type="email"
                  class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p v-else class="text-sm text-slate-800 dark:text-slate-200">{{ store.currentLead.email ?? '—' }}</p>
              </div>

              <!-- Telefone -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Telefone</p>
                <input
                  v-if="isEditing"
                  v-model="editForm.phone"
                  type="tel"
                  class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p v-else class="text-sm text-slate-800 dark:text-slate-200">{{ store.currentLead.phone ?? '—' }}</p>
              </div>

              <!-- Origem -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Origem</p>
                <p class="text-sm text-slate-800 dark:text-slate-200">{{ store.currentLead.source === 'PORTAL' ? 'Portal' : 'Manual' }}</p>
              </div>

              <!-- Data de criação -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Data de criação</p>
                <p class="text-sm text-slate-800 dark:text-slate-200">{{ formatDate(store.currentLead.createdAt) }}</p>
              </div>

              <!-- Última atualização -->
              <div>
                <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Última atualização</p>
                <p class="text-sm text-slate-800 dark:text-slate-200">{{ formatDate(store.currentLead.updatedAt) }}</p>
              </div>
            </div>

            <!-- Mensagem inicial -->
            <div v-if="isEditing || store.currentLead.message" class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">Mensagem inicial</p>
              <textarea
                v-if="isEditing"
                v-model="editForm.message"
                rows="3"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
              <p v-else class="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 whitespace-pre-wrap">
                {{ store.currentLead.message }}
              </p>
            </div>
          </div>

          <!-- Card 2: Imóveis de Interesse -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Imóveis de Interesse</h2>
              <span class="text-xs text-slate-400">{{ store.currentLead.properties?.length ?? 0 }} imóvel(is)</span>
            </div>

            <!-- List of linked properties -->
            <div class="space-y-3 mb-4">
              <div v-for="lp in store.currentLead.properties" :key="lp.id"
                class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 group"
              >
                <!-- Cover photo thumbnail -->
                <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-600">
                  <img v-if="lp.coverPhotoUrl" :src="lp.coverPhotoUrl" :alt="lp.propertyTitle ?? ''" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                </div>

                <!-- Property info -->
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ lp.propertyTitle ?? 'Imóvel sem título' }}</p>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span v-if="lp.propertyOperation" :class="operationClass(lp.propertyOperation)" class="text-xs px-2 py-0.5 rounded-full font-medium">
                      {{ operationLabel(lp.propertyOperation) }}
                    </span>
                    <span v-if="lp.addressCity" class="text-xs text-slate-400">{{ lp.addressCity }}</span>
                    <span v-if="lp.propertyPrice" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {{ formatPrice(lp.propertyPrice, lp.propertyCurrency ?? 'BRL') }}
                    </span>
                  </div>
                  <!-- Interest level selector -->
                  <div class="flex items-center gap-1.5 mt-1.5">
                    <span class="text-xs text-slate-400">Interesse:</span>
                    <div class="flex gap-1">
                      <button v-for="level in interestLevels" :key="level.value"
                        @click="setInterestLevel(lp, level.value)"
                        :class="[
                          'px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                          lp.interestLevel === level.value ? level.activeCls : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-500'
                        ]"
                      >{{ level.label }}</button>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-1 flex-shrink-0">
                  <button @click="router.push('/imoveis/' + lp.propertyId)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    title="Ver imóvel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </button>
                  <button @click="unlinkProperty(lp.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remover imóvel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <p v-if="!store.currentLead.properties?.length" class="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
                Nenhum imóvel vinculado
              </p>
            </div>

            <!-- Add property form -->
            <div class="flex items-center gap-2">
              <select v-model="selectedPropertyId"
                class="flex-1 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Adicionar imóvel de interesse...</option>
                <option v-for="p in availableProperties" :key="p.id" :value="p.id">{{ p.title }}</option>
              </select>
              <button @click="addProperty" :disabled="!selectedPropertyId || addingProperty"
                class="px-4 py-2.5 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all whitespace-nowrap"
              >
                <span v-if="addingProperty">Adicionando...</span>
                <span v-else>+ Adicionar</span>
              </button>
            </div>
          </div>

          <!-- Card 3: Notas -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Notas</h2>

            <div class="max-h-64 overflow-y-auto space-y-2 mb-4">
              <div
                v-for="note in [...store.currentLead.notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())"
                :key="note.id"
                class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3"
              >
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ note.content }}</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="text-xs text-slate-400">{{ formatDate(note.createdAt) }}</span>
                  <span class="text-xs text-slate-300 dark:text-slate-600">·</span>
                  <span class="text-xs text-slate-400">Usuário</span>
                </div>
              </div>
              <p v-if="!store.currentLead.notes.length" class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                Nenhuma nota ainda
              </p>
            </div>

            <div class="flex gap-2">
              <input
                v-model="newNote"
                type="text"
                placeholder="Adicionar nota..."
                class="flex-1 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                @keydown.enter.prevent="submitNote"
              />
              <button
                @click="submitNote"
                :disabled="!newNote.trim() || addingNote"
                class="px-4 py-2.5 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all"
              >
                <svg v-if="addingNote" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span v-else>Enviar</span>
              </button>
            </div>
          </div>

          <!-- Card 4: Tarefas -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Tarefas</h2>
              <span class="text-xs text-slate-400">{{ leadTasks.length }} tarefa(s)</span>
            </div>

            <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
              <div
                v-for="task in leadTasks"
                :key="task.id"
                class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 group"
              >
                <button
                  @click="toggleLeadTask(task)"
                  class="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="task.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-500 hover:border-indigo-400'"
                >
                  <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-2.5 h-2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" :class="{ 'line-through text-slate-400 dark:text-slate-500': task.completed }">
                    {{ task.title }}
                  </p>
                  <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span
                      v-if="task.taskTypeName"
                      :style="{ backgroundColor: (task.taskTypeColor ?? '#6366f1') + '20', color: task.taskTypeColor ?? '#6366f1' }"
                      class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    >
                      {{ task.taskTypeName }}
                    </span>
                    <p
                      v-if="task.dueAt"
                      class="text-xs"
                      :class="task.overdue && !task.completed ? 'text-red-500' : 'text-slate-400'"
                    >
                      {{ formatDate(task.dueAt) }}
                    </p>
                  </div>
                </div>
              </div>
              <p v-if="!leadTasks.length" class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                Nenhuma tarefa ainda
              </p>
            </div>

            <!-- Inline new task form -->
            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
              <input
                v-model="newTaskTitle"
                type="text"
                placeholder="Nova tarefa..."
                class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                @keydown.enter.prevent="submitLeadTask"
              />
              <!-- Type pills -->
              <div v-if="leadTaskTypes.length" class="flex flex-wrap gap-1.5">
                <button
                  v-for="type in leadTaskTypes"
                  :key="type.id"
                  type="button"
                  @click="newTaskTypeId = newTaskTypeId === type.id ? undefined : type.id"
                  :style="newTaskTypeId === type.id
                    ? { backgroundColor: type.color, color: '#fff', borderColor: type.color }
                    : { borderColor: type.color + '40', color: type.color }"
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-medium border-2 transition-all"
                >
                  {{ type.name }}
                </button>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model="newTaskDue"
                  type="datetime-local"
                  class="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  @click="submitLeadTask"
                  :disabled="!newTaskTitle.trim() || addingLeadTask"
                  class="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-medium disabled:opacity-50 transition-all whitespace-nowrap"
                >
                  <span v-if="addingLeadTask">...</span>
                  <span v-else>+ Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Card 5: WhatsApp -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-slate-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">WhatsApp</h2>
            </div>

            <!-- No phone warning -->
            <div v-if="!store.currentLead?.phone" class="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-amber-500 flex-shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p class="text-xs text-amber-700 dark:text-amber-400">Lead sem telefone cadastrado</p>
            </div>

            <template v-if="store.currentLead?.phone">
              <!-- No instances warning -->
              <div v-if="waInstances.length === 0" class="text-center py-4 mb-4">
                <p class="text-xs text-slate-400 dark:text-slate-500">Nenhum número WhatsApp cadastrado.</p>
                <RouterLink to="/whatsapp" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Configurar em WhatsApp → Configurações
                </RouterLink>
              </div>

              <template v-else>
                <!-- Instance selector -->
                <select
                  v-model="selectedInstanceId"
                  class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-3"
                >
                  <option value="">Selecionar número...</option>
                  <option v-for="inst in waInstances" :key="inst.id" :value="inst.id">
                    {{ inst.displayName }}{{ inst.status === 'CONNECTED' ? ' ✓' : inst.status === 'CONNECTING' ? ' ⟳' : ' ✗' }}
                  </option>
                </select>

                <!-- Chat area -->
                <div
                  ref="waChatRef"
                  class="max-h-80 overflow-y-auto space-y-2 mb-3 pr-1"
                >
                  <template v-if="waMessages.length">
                    <div
                      v-for="msg in waMessages"
                      :key="msg.id"
                      :class="msg.direction === 'OUTBOUND' ? 'flex flex-col items-end' : 'flex flex-col items-start'"
                    >
                      <p
                        v-if="msg.direction === 'OUTBOUND' && (msg.sentByUserName || msg.instanceDisplayName)"
                        class="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 text-right"
                      >
                        {{ [msg.sentByUserName, msg.instanceDisplayName].filter(Boolean).join(' · ') }}
                      </p>
                      <div
                        :class="[
                          'max-w-[80%] px-3 py-2 rounded-2xl',
                          msg.direction === 'OUTBOUND'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm',
                        ]"
                      >
                        <p class="text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
                        <p
                          :class="[
                            'text-[10px] mt-1',
                            msg.direction === 'OUTBOUND' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500',
                          ]"
                        >
                          {{ waTimeLabel(msg.createdAt) }}
                        </p>
                      </div>
                    </div>
                  </template>
                  <p v-else class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-6">
                    Nenhuma mensagem ainda
                  </p>
                </div>

                <!-- Input row -->
                <div class="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <textarea
                    v-model="waMessageText"
                    rows="2"
                    placeholder="Digite sua mensagem..."
                    class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    @keydown.enter.ctrl.prevent="sendWaMessage"
                  />
                  <button
                    @click="sendWaMessage"
                    :disabled="!selectedInstanceId || !waMessageText.trim() || sendingWa || !waInstances.find(i => i.id === selectedInstanceId && i.status === 'CONNECTED')"
                    class="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all self-end"
                  >
                    <svg v-if="sendingWa" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span v-else>Enviar</span>
                  </button>
                </div>
              </template>
            </template>
          </div>
        </div>
        <div class="space-y-6">

          <!-- Card A: Status -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Status do Lead</h2>

            <div class="flex justify-center mb-4">
              <span :class="statusClass(store.currentLead.status)" class="inline-flex px-4 py-1.5 rounded-full text-sm font-semibold">
                {{ statusLabel(store.currentLead.status) }}
              </span>
            </div>

            <div class="space-y-2">
              <button
                v-for="s in allStatuses"
                :key="s.value"
                @click="changeStatus(s.value)"
                :disabled="store.currentLead.status === s.value || changingStatus"
                :class="[
                  'w-full px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center justify-between',
                  store.currentLead.status === s.value
                    ? s.filledCls + ' cursor-default border-transparent'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                ]"
              >
                <span>{{ s.label }}</span>
                <svg v-if="changingStatus && store.currentLead.status !== s.value" class="animate-spin h-3.5 w-3.5 opacity-40" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else-if="store.currentLead.status === s.value" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Card B: Corretor Responsável -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Corretor Responsável</h2>

            <div v-if="store.currentLead.assignedToName" class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm font-bold">{{ initials(store.currentLead.assignedToName) }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ store.currentLead.assignedToName }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400 dark:text-slate-500 italic mb-4">Sem corretor atribuído</p>

            <div v-if="showReassign" class="space-y-2">
              <select
                v-model="reassignTo"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Selecionar corretor...</option>
                <option value="__unassign__">Remover atribuição</option>
                <option v-for="b in brokers" :key="b.id" :value="b.id">
                  {{ b.firstName ?? '' }} {{ b.lastName ?? '' }} ({{ b.email }})
                </option>
              </select>
              <div class="flex gap-2">
                <button @click="showReassign = false; reassignTo = ''" class="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button @click="doReassign" :disabled="!reassignTo" class="flex-1 px-3 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
                  Confirmar
                </button>
              </div>
            </div>
            <button v-else @click="showReassign = true" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              {{ store.currentLead.assignedToName ? 'Reatribuir' : 'Atribuir corretor' }}
            </button>
          </div>

          <!-- Card C: Histórico -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-4">Histórico</h2>

            <div v-if="store.events.length" class="relative">
              <!-- vertical line -->
              <div class="absolute left-3.5 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-700"></div>
              <div class="space-y-4">
                <div v-for="event in store.events" :key="event.id" class="flex items-start gap-3 relative">
                  <!-- dot / icon -->
                  <div :class="eventDotClass(event.eventType)" class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                    <!-- CREATED -->
                    <svg v-if="event.eventType === 'CREATED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <!-- STATUS_CHANGED -->
                    <svg v-else-if="event.eventType === 'STATUS_CHANGED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    <!-- ASSIGNED / UNASSIGNED -->
                    <svg v-else-if="event.eventType === 'ASSIGNED' || event.eventType === 'UNASSIGNED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <!-- NOTE_ADDED -->
                    <svg v-else-if="event.eventType === 'NOTE_ADDED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <!-- default -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <div class="min-w-0 pt-0.5">
                    <p class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ event.description ?? eventTypeLabel(event.eventType) }}</p>
                    <span class="text-xs text-slate-400">{{ formatDate(event.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
              Nenhum evento registrado
            </p>
          </div>
        </div>
      </div>

      <!-- Delete confirm modal -->
      <Teleport to="body">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showDeleteConfirm = false"
        >
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Remover lead?</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Tem certeza que deseja remover <strong class="text-slate-800 dark:text-slate-200">{{ store.currentLead?.name }}</strong>? Essa ação não pode ser desfeita.
            </p>
            <div class="flex gap-3">
              <button
                @click="showDeleteConfirm = false"
                class="flex-1 h-10 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="executeDelete"
                :disabled="store.isLoading"
                class="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useLeadStore } from '@/stores/lead'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/user'
import propertyService from '@/services/property'
import taskService from '@/services/task'
import taskTypeService from '@/services/taskType'
import type { TaskTypeResponse } from '@/types/task'
import type { TaskResponse } from '@/types/task'
import whatsappService from '@/services/whatsapp'
import type { WhatsappInstance, WhatsappMessage } from '@/types/whatsapp'
import type { LeadStatus, LeadEventType, InterestLevel, LeadPropertyResponse, UpdateLeadRequest, UserSummary } from '@/types/lead'
import type { PropertySummaryResponse } from '@/types/property'

const route = useRoute()
const router = useRouter()
const store = useLeadStore()
const authStore = useAuthStore()
const leadId = route.params.id as string

// ── Status helpers ─────────────────────────────────────────────────────────
const allStatuses = [
  { value: 'NEW' as LeadStatus, label: 'Novo', filledCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'CONTACTED' as LeadStatus, label: 'Em contato', filledCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'QUALIFIED' as LeadStatus, label: 'Qualificado', filledCls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  { value: 'WON' as LeadStatus, label: 'Ganho', filledCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'LOST' as LeadStatus, label: 'Perdido', filledCls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
]

const statusLabel = (status: LeadStatus) => allStatuses.find(s => s.value === status)?.label ?? status
const statusClass = (status: LeadStatus): string => allStatuses.find(s => s.value === status)?.filledCls ?? ''

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const daysAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
  if (days === 0) return 'hoje'
  if (days === 1) return 'há 1 dia'
  return `há ${days} dias`
}

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

// ── Event helpers ──────────────────────────────────────────────────────────
const eventDotClass = (type: LeadEventType): string => {
  const map: Record<LeadEventType, string> = {
    CREATED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    STATUS_CHANGED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    ASSIGNED: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    UNASSIGNED: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    NOTE_ADDED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    PROPERTY_LINKED: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    PROPERTY_UNLINKED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  }
  return map[type] ?? 'bg-slate-100 text-slate-500'
}

const eventTypeLabel = (type: LeadEventType): string => {
  const labels: Record<LeadEventType, string> = {
    CREATED: 'Lead criado',
    STATUS_CHANGED: 'Status alterado',
    ASSIGNED: 'Corretor atribuído',
    UNASSIGNED: 'Corretor removido',
    NOTE_ADDED: 'Nota adicionada',
    PROPERTY_LINKED: 'Imóvel vinculado',
    PROPERTY_UNLINKED: 'Imóvel desvinculado',
  }
  return labels[type] ?? type
}

// ── Inline editing ─────────────────────────────────────────────────────────
const isEditing = ref(false)
const savingEdit = ref(false)
const editError = ref<string | null>(null)
const editForm = ref<UpdateLeadRequest>({})

const toggleEdit = () => {
  if (isEditing.value) {
    isEditing.value = false
    editError.value = null
    return
  }
  if (store.currentLead) {
    editForm.value = {
      name: store.currentLead.name,
      email: store.currentLead.email ?? '',
      phone: store.currentLead.phone ?? '',
      message: store.currentLead.message ?? '',
    }
  }
  isEditing.value = true
}

const saveEdits = async () => {
  if (!store.currentLead) return
  savingEdit.value = true
  editError.value = null
  try {
    await store.updateLead(leadId, editForm.value)
    isEditing.value = false
  } catch (e: unknown) {
    editError.value = e instanceof Error ? e.message : 'Erro ao salvar'
  } finally {
    savingEdit.value = false
  }
}

// ── Status change ──────────────────────────────────────────────────────────
const changingStatus = ref(false)

const changeStatus = async (status: LeadStatus) => {
  if (!store.currentLead || store.currentLead.status === status) return
  changingStatus.value = true
  try {
    await store.updateLead(leadId, { status })
  } finally {
    changingStatus.value = false
  }
}

// ── Notes ──────────────────────────────────────────────────────────────────
const newNote = ref('')
const addingNote = ref(false)

const submitNote = async () => {
  if (!newNote.value.trim()) return
  addingNote.value = true
  try {
    await store.addNote(leadId, { content: newNote.value.trim() })
    newNote.value = ''
  } finally {
    addingNote.value = false
  }
}

// ── Brokers ────────────────────────────────────────────────────────────────
const brokers = ref<UserSummary[]>([])
const showReassign = ref(false)
const reassignTo = ref('')

const doReassign = async () => {
  if (!reassignTo.value) return
  const assignedTo = reassignTo.value === '__unassign__' ? '' : reassignTo.value
  try {
    await store.updateLead(leadId, { assignedTo: assignedTo || undefined })
  } finally {
    showReassign.value = false
    reassignTo.value = ''
  }
}

// ── Property linking ───────────────────────────────────────────────────────
const properties = ref<PropertySummaryResponse[]>([])
const selectedPropertyId = ref('')
const addingProperty = ref(false)

const availableProperties = computed(() => {
  const linkedIds = new Set((store.currentLead?.properties ?? []).map(lp => lp.propertyId))
  return properties.value.filter(p => !linkedIds.has(p.id))
})

const interestLevels: { value: InterestLevel; label: string; activeCls: string }[] = [
  { value: 'UNDEFINED', label: 'Indef.', activeCls: 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300' },
  { value: 'LOW', label: 'Baixo', activeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'MEDIUM', label: 'Médio', activeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'HIGH', label: 'Alto', activeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
]

const operationLabel = (op: string) => ({ SALE: 'Venda', RENT: 'Aluguel', SEASONAL: 'Temporada' }[op] ?? op)
const operationClass = (op: string) => ({
  SALE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  RENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  SEASONAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}[op] ?? 'bg-slate-100 text-slate-500')

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price)

const addProperty = async () => {
  if (!selectedPropertyId.value) return
  addingProperty.value = true
  try {
    await store.addLeadProperty(leadId, { propertyId: selectedPropertyId.value, interestLevel: 'UNDEFINED' })
    selectedPropertyId.value = ''
  } catch (e) {
    console.error('Erro ao adicionar imóvel', e)
  } finally {
    addingProperty.value = false
  }
}

const unlinkProperty = async (linkId: string) => {
  await store.removeLeadProperty(leadId, linkId)
}

const setInterestLevel = async (lp: LeadPropertyResponse, level: InterestLevel) => {
  if (lp.interestLevel === level) return
  await store.updateLeadPropertyInterest(leadId, lp.id, level)
}

// ── Lead tasks ─────────────────────────────────────────────────────────────
const leadTasks = ref<TaskResponse[]>([])
const newTaskTitle = ref('')
const newTaskDue = ref('')
const newTaskTypeId = ref<string | undefined>(undefined)
const addingLeadTask = ref(false)
const leadTaskTypes = ref<TaskTypeResponse[]>([])

const toggleLeadTask = async (task: TaskResponse) => {
  try {
    const updated = await taskService.complete(task.id)
    const idx = leadTasks.value.findIndex(t => t.id === task.id)
    if (idx !== -1) leadTasks.value[idx] = updated
  } catch { /* best-effort */ }
}

const submitLeadTask = async () => {
  if (!newTaskTitle.value.trim()) return
  addingLeadTask.value = true
  try {
    const task = await taskService.create({
      title: newTaskTitle.value.trim(),
      leadId,
      assignedTo: authStore.currentUser?.id,
      dueAt: newTaskDue.value || undefined,
      taskTypeId: newTaskTypeId.value || undefined,
    })
    leadTasks.value = [task, ...leadTasks.value]
    newTaskTitle.value = ''
    newTaskDue.value = ''
    newTaskTypeId.value = undefined
  } catch { /* best-effort */ } finally {
    addingLeadTask.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  await store.deleteLead(leadId)
  router.replace('/leads')
}

// ── Mount ──────────────────────────────────────────────────────────────────
// ── WhatsApp ───────────────────────────────────────────────────────────────
const waInstances = ref<WhatsappInstance[]>([])
const waMessages = ref<WhatsappMessage[]>([])
const selectedInstanceId = ref<string>('')
const waMessageText = ref('')
const sendingWa = ref(false)
const waChatRef = ref<HTMLElement | null>(null)

async function loadWaData() {
  if (!store.currentLead?.id) return
  try {
    const [instances, messages] = await Promise.allSettled([
      whatsappService.listInstances(),
      whatsappService.getMessages(store.currentLead.id),
    ])
    if (instances.status === 'fulfilled') {
      waInstances.value = instances.value
      const connected = instances.value.find(i => i.status === 'CONNECTED')
      if (connected) selectedInstanceId.value = connected.id
    }
    if (messages.status === 'fulfilled') waMessages.value = messages.value
  } catch { /* best-effort */ }
}

async function sendWaMessage() {
  if (!waMessageText.value.trim() || !selectedInstanceId.value || !store.currentLead?.id) return
  sendingWa.value = true
  try {
    const msg = await whatsappService.sendMessage(store.currentLead.id, {
      instanceId: selectedInstanceId.value,
      text: waMessageText.value.trim(),
    })
    waMessages.value.push(msg)
    waMessageText.value = ''
  } catch (e: any) {
    alert(e?.message ?? 'Erro ao enviar mensagem')
  } finally {
    sendingWa.value = false
  }
}

function waTimeLabel(date: string) {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

watch(waMessages, async () => {
  await nextTick()
  if (waChatRef.value) waChatRef.value.scrollTop = waChatRef.value.scrollHeight
}, { deep: true })

onMounted(async () => {
  store.currentLead = null
  await store.fetchLead(leadId)
  store.fetchEvents(leadId)

  const [brokersData, propertiesData] = await Promise.allSettled([
    userService.listActive(),
    propertyService.list({ status: 'ACTIVE', page: 0, size: 50 }),
  ])

  if (brokersData.status === 'fulfilled') brokers.value = brokersData.value
  if (propertiesData.status === 'fulfilled') properties.value = propertiesData.value.content

  try {
    const taskResult = await taskService.list({ leadId, size: 50 })
    leadTasks.value = taskResult.content
  } catch { /* best-effort */ }

  try {
    leadTaskTypes.value = await taskTypeService.list()
  } catch { /* best-effort */ }

  loadWaData()
})
</script>
