<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">Tarefas</h1>
          <p class="text-xs text-slate-400">Gerencie atividades e compromissos</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- View toggle -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            <button
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Lista
            </button>
            <button
              @click="viewMode = 'calendar'"
              :class="viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Calendário
            </button>
          </div>

          <button
            @click="openCreateModal"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium text-sm shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:translate-y-[-1px] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova tarefa
          </button>
        </div>
      </div>
    </template>

    <!-- Filter bar -->
    <div class="flex items-center gap-2 mb-6 flex-wrap">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        @click="activeTab = tab.value; applyTabFilter()"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
          activeTab === tab.value
            ? 'bg-indigo-600 text-white shadow'
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
        ]"
      >
        {{ tab.label }}
      </button>
      <select v-model="filterType" class="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none">
        <option value="">Todos os tipos</option>
        <option v-for="t in taskTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por título..."
        class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 ml-auto"
      />
    </div>

    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!filteredTasks.length"
      class="flex flex-col items-center justify-center py-24 text-slate-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-16 h-16 mb-4 opacity-20">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-medium">Nenhuma tarefa ainda.</p>
      <p class="text-xs mt-1">Crie sua primeira tarefa!</p>
    </div>

    <!-- Task list -->
    <div v-else class="space-y-2">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 group hover:shadow-md transition-shadow"
      >
        <!-- Checkbox -->
        <button
          @click="handleToggle(task)"
          class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'"
        >
          <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>

        <!-- Title + meta -->
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            :class="{ 'line-through text-slate-400 dark:text-slate-500': task.completed }"
            @click="openEditModal(task)"
          >
            {{ task.title }}
          </p>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <!-- Type badge -->
            <span
              v-if="task.taskTypeName"
              :style="{ backgroundColor: (task.taskTypeColor ?? '#6366f1') + '20', color: task.taskTypeColor ?? '#6366f1' }"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {{ task.taskTypeName }}
            </span>
            <!-- Lead badge -->
            <RouterLink
              v-if="task.leadId"
              :to="`/leads/${task.leadId}`"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
            >
              {{ task.leadName }}
            </RouterLink>

            <!-- Assigned to -->
            <span v-if="task.assignedToName" class="flex items-center gap-1 text-xs text-slate-400">
              <span class="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                {{ initials(task.assignedToName) }}
              </span>
              {{ task.assignedToName }}
            </span>

            <!-- Due date -->
            <span
              v-if="task.dueAt"
              class="text-xs font-medium"
              :class="task.overdue && !task.completed ? 'text-red-500 dark:text-red-400' : 'text-slate-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 inline mr-0.5 -mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              {{ formatDate(task.dueAt) }}
              <span v-if="task.overdue && !task.completed" class="ml-0.5">(atrasada)</span>
            </span>
          </div>
        </div>

        <!-- Actions (visible on hover) -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            @click="openEditModal(task)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            @click="handleDelete(task.id)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    </template><!-- end LIST VIEW -->

    <!-- CALENDAR VIEW -->
    <template v-if="viewMode === 'calendar'">

      <!-- Banner: tasks without due date -->
      <div v-if="tasksWithoutDueDate > 0" class="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-700 dark:text-amber-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        {{ tasksWithoutDueDate }} tarefa(s) sem data de vencimento não aparecem no calendário.
      </div>

      <!-- Month navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          @click="prevMonth"
          class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Anterior
        </button>
        <h2 class="text-sm font-bold text-slate-800 dark:text-white capitalize">{{ currentMonthLabel }}</h2>
        <button
          @click="nextMonth"
          class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Próximo
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Day-of-week header -->
      <div class="grid grid-cols-7 mb-1">
        <div
          v-for="dow in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
          :key="dow"
          class="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1"
        >
          {{ dow }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          @click="selectedDay = day"
          :class="[
            'bg-white dark:bg-slate-800 min-h-[100px] p-2 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors',
            !day.currentMonth ? 'bg-slate-50 dark:bg-slate-800/50' : '',
            isToday(day) ? 'ring-2 ring-inset ring-indigo-500' : '',
          ]"
        >
          <!-- Day number -->
          <div class="flex justify-center mb-1">
            <span
              :class="isToday(day)
                ? 'w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold'
                : day.currentMonth
                  ? 'text-sm font-medium text-slate-700 dark:text-slate-300'
                  : 'text-xs text-slate-300 dark:text-slate-600'"
            >
              {{ day.date }}
            </span>
          </div>

          <!-- Task pills (up to 3) -->
          <div v-for="task in tasksForDay(day).slice(0, 3)" :key="task.id"
            @click.stop="openEditModal(task)"
            :style="{ backgroundColor: (task.taskTypeColor ?? '#6366f1') + '20', color: task.taskTypeColor ?? '#6366f1' }"
            class="text-xs px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity mt-1"
            :class="{ 'line-through opacity-60': task.completed, 'ring-1 ring-red-400': task.overdue && !task.completed }"
          >
            {{ task.title }}
          </div>
          <p v-if="tasksForDay(day).length > 3" class="text-xs text-slate-400 mt-0.5">
            +{{ tasksForDay(day).length - 3 }} mais
          </p>
        </div>
      </div>

      <!-- Selected day panel -->
      <div v-if="selectedDay" class="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white capitalize">
            {{ formatSelectedDay(selectedDay) }}
          </h3>
          <button @click="selectedDay = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-lg leading-none">✕</button>
        </div>

        <p v-if="!tasksForDay(selectedDay).length" class="text-sm text-slate-400 italic">
          Nenhuma tarefa neste dia.
        </p>

        <div v-else class="space-y-2">
          <div
            v-for="task in tasksForDay(selectedDay)"
            :key="task.id"
            class="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <!-- Checkbox -->
            <button
              @click="handleToggle(task)"
              class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'"
            >
              <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                :class="{ 'line-through text-slate-400 dark:text-slate-500': task.completed }"
                @click="openEditModal(task)"
              >
                {{ task.title }}
              </p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  v-if="task.taskTypeName"
                  :style="{ backgroundColor: (task.taskTypeColor ?? '#6366f1') + '20', color: task.taskTypeColor ?? '#6366f1' }"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ task.taskTypeName }}
                </span>
                <span
                  v-if="task.dueAt"
                  class="text-xs font-medium"
                  :class="task.overdue && !task.completed ? 'text-red-500' : 'text-slate-400'"
                >
                  {{ formatDate(task.dueAt) }}
                </span>
              </div>
            </div>

            <!-- Edit -->
            <button
              @click="openEditModal(task)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </template><!-- end CALENDAR VIEW -->
    <div class="mt-10">
      <button
        @click="showManageTypes = !showManageTypes"
        class="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform" :class="showManageTypes ? 'rotate-90' : ''">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        Tipos de tarefa
      </button>

      <div v-if="showManageTypes" class="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <!-- Existing types -->
        <div
          v-for="type in taskTypes"
          :key="type.id"
          class="flex items-center gap-3"
        >
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: type.color }"
          />
          <!-- Inline edit for custom types -->
          <input
            v-if="!type.system && editingTypeName[type.id] !== undefined"
            v-model="editingTypeName[type.id]"
            @keydown.enter.prevent="saveTypeName(type)"
            @keydown.escape="delete editingTypeName[type.id]"
            @blur="saveTypeName(type)"
            class="flex-1 px-2 py-1 text-xs border border-indigo-400 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            autofocus
          />
          <span v-else class="flex-1 text-sm text-slate-700 dark:text-slate-300">{{ type.name }}</span>

          <span v-if="type.system" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 font-medium">Sistema</span>

          <template v-if="!type.system">
            <button
              @click="startEditTypeName(type)"
              class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              title="Renomear"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            <button
              @click="deleteType(type.id)"
              class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
        </div>

        <!-- New type form -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <input
            v-model="newTypeName"
            type="text"
            placeholder="Novo tipo..."
            class="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            @keydown.enter.prevent="createType"
          />
          <input
            v-model="newTypeColor"
            type="color"
            class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
            title="Cor"
          />
          <button
            @click="createType"
            :disabled="!newTypeName.trim() || creatingType"
            class="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium disabled:opacity-50 transition-all hover:bg-indigo-700 whitespace-nowrap"
          >
            {{ creatingType ? '...' : '+ Criar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-5">
            {{ editingTask ? 'Editar tarefa' : 'Nova tarefa' }}
          </h3>

          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Título <span class="text-red-500">*</span></label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Título da tarefa"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Descrição</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Descrição opcional..."
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            <!-- Lead -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Lead</label>
              <select
                v-model="form.leadId"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Nenhum</option>
                <option v-for="lead in leads" :key="lead.id" :value="lead.id">{{ lead.name }}</option>
              </select>
            </div>

            <!-- Assigned to -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Responsável</label>
              <select
                v-model="form.assignedTo"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Nenhum</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.firstName ?? '' }} {{ user.lastName ?? '' }} ({{ user.email }})
                </option>
              </select>
            </div>

            <!-- Due date -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Prazo</label>
              <input
                v-model="form.dueAt"
                type="datetime-local"
                class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <!-- Type -->
            <div v-if="taskTypes.length">
              <label class="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2 block">Tipo</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in taskTypes"
                  :key="type.id"
                  type="button"
                  @click="form.taskTypeId = form.taskTypeId === type.id ? undefined : type.id"
                  :style="form.taskTypeId === type.id
                    ? { backgroundColor: type.color, color: '#fff', borderColor: type.color }
                    : { borderColor: type.color + '40', color: type.color }"
                  class="px-3 py-1 rounded-full text-xs font-medium border-2 transition-all"
                >
                  {{ type.name }}
                </button>
              </div>
            </div>

            <!-- Error -->
            <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showModal = false"
              class="flex-1 h-10 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="submitForm"
              :disabled="!form.title.trim() || saving"
              class="flex-1 h-10 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:translate-y-[-1px] shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
            >
              <svg v-if="saving" class="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span v-else>{{ editingTask ? 'Salvar' : 'Criar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useTaskStore } from '@/stores/task'
import type { TaskResponse, TaskTypeResponse } from '@/types/task'
import type { UserSummary } from '@/types/lead'
import userService from '@/services/user'
import leadService from '@/services/lead'
import taskTypeService from '@/services/taskType'

const store = useTaskStore()

// ── View mode ──────────────────────────────────────────────────────────────
const viewMode = ref<'list' | 'calendar'>('list')

// ── Calendar state ─────────────────────────────────────────────────────────
const calendarDate = ref(new Date())
const selectedDay = ref<{ year: number; month: number; date: number; currentMonth: boolean } | null>(null)

const prevMonth = () => {
  const d = new Date(calendarDate.value)
  d.setMonth(d.getMonth() - 1)
  calendarDate.value = d
  selectedDay.value = null
}

const nextMonth = () => {
  const d = new Date(calendarDate.value)
  d.setMonth(d.getMonth() + 1)
  calendarDate.value = d
  selectedDay.value = null
}

const currentMonthLabel = computed(() =>
  calendarDate.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

interface CalendarDay {
  year: number
  month: number
  date: number
  currentMonth: boolean
}

const calendarDays = computed((): CalendarDay[] => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: CalendarDay[] = []

  for (let i = 0; i < firstDay.getDay(); i++) {
    const d = new Date(year, month, -firstDay.getDay() + i + 1)
    days.push({ year: d.getFullYear(), month: d.getMonth(), date: d.getDate(), currentMonth: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ year, month, date: i, currentMonth: true })
  }
  let next = 1
  while (days.length < 42) {
    const d = new Date(year, month + 1, next++)
    days.push({ year: d.getFullYear(), month: d.getMonth(), date: d.getDate(), currentMonth: false })
  }
  return days
})

const isToday = (day: CalendarDay) => {
  const t = new Date()
  return day.year === t.getFullYear() && day.month === t.getMonth() && day.date === t.getDate()
}

const tasksForDay = (day: CalendarDay) => {
  return store.tasks.filter(t => {
    if (!t.dueAt) return false
    const d = new Date(t.dueAt)
    return d.getFullYear() === day.year && d.getMonth() === day.month && d.getDate() === day.date
  })
}

const tasksWithoutDueDate = computed(() => store.tasks.filter(t => !t.dueAt).length)

const formatSelectedDay = (day: CalendarDay) =>
  new Date(day.year, day.month, day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

// ── Task types ─────────────────────────────────────────────────────────────
const taskTypes = ref<TaskTypeResponse[]>([])

// ── Filters ────────────────────────────────────────────────────────────────
const filterTabs: { label: string; value: 'all' | 'pending' | 'done' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Concluídas', value: 'done' },
]
const activeTab = ref<'all' | 'pending' | 'done'>('all')
const search = ref('')
const filterType = ref('')

const applyTabFilter = () => {
  if (activeTab.value === 'pending') {
    store.fetchTasks({ pending: true, size: 100 })
  } else {
    store.fetchTasks({ size: 100 })
  }
}

const filteredTasks = computed(() => {
  let list = store.tasks
  if (activeTab.value === 'done') list = list.filter(t => t.completed)
  else if (activeTab.value === 'pending') list = list.filter(t => !t.completed)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q))
  }
  if (filterType.value) {
    list = list.filter(t => t.taskTypeId === filterType.value)
  }
  return list
})

// ── Helpers ────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// ── Toggle complete ────────────────────────────────────────────────────────
const handleToggle = async (task: TaskResponse) => {
  await store.toggleComplete(task.id)
}

const handleDelete = async (id: string) => {
  await store.deleteTask(id)
}

// ── Modal ──────────────────────────────────────────────────────────────────
const showModal = ref(false)
const editingTask = ref<TaskResponse | null>(null)
const saving = ref(false)
const formError = ref('')

interface TaskForm {
  title: string
  description: string
  leadId: string
  assignedTo: string
  dueAt: string
  taskTypeId: string | undefined
}

const emptyForm = (): TaskForm => ({ title: '', description: '', leadId: '', assignedTo: '', dueAt: '', taskTypeId: undefined })
const form = ref<TaskForm>(emptyForm())

const users = ref<UserSummary[]>([])
const leads = ref<{ id: string; name: string }[]>([])

const openCreateModal = () => {
  editingTask.value = null
  form.value = emptyForm()
  formError.value = ''
  showModal.value = true
}

const openEditModal = (task: TaskResponse) => {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description ?? '',
    leadId: task.leadId ?? '',
    assignedTo: task.assignedTo ?? '',
    dueAt: task.dueAt ? task.dueAt.slice(0, 16) : '',
    taskTypeId: task.taskTypeId ?? undefined,
  }
  formError.value = ''
  showModal.value = true
}

const submitForm = async () => {
  if (!form.value.title.trim()) return
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      leadId: form.value.leadId || undefined,
      assignedTo: form.value.assignedTo || undefined,
      dueAt: form.value.dueAt || undefined,
      taskTypeId: form.value.taskTypeId || undefined,
    }
    if (editingTask.value) {
      await store.updateTask(editingTask.value.id, payload)
    } else {
      await store.createTask(payload)
    }
    showModal.value = false
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Erro ao salvar'
  } finally {
    saving.value = false
  }
}

// ── Manage task types ──────────────────────────────────────────────────────
const showManageTypes = ref(false)
const newTypeName = ref('')
const newTypeColor = ref('#6366f1')
const creatingType = ref(false)
const editingTypeName = ref<Record<string, string>>({})

const startEditTypeName = (type: TaskTypeResponse) => {
  editingTypeName.value[type.id] = type.name
}

const saveTypeName = async (type: TaskTypeResponse) => {
  const name = editingTypeName.value[type.id]?.trim()
  if (!name || name === type.name) {
    delete editingTypeName.value[type.id]
    return
  }
  try {
    const updated = await taskTypeService.update(type.id, { name })
    const idx = taskTypes.value.findIndex(t => t.id === type.id)
    if (idx !== -1) taskTypes.value[idx] = updated
  } catch { /* best-effort */ }
  delete editingTypeName.value[type.id]
}

const createType = async () => {
  if (!newTypeName.value.trim()) return
  creatingType.value = true
  try {
    const created = await taskTypeService.create({ name: newTypeName.value.trim(), color: newTypeColor.value })
    taskTypes.value.push(created)
    newTypeName.value = ''
    newTypeColor.value = '#6366f1'
  } catch { /* best-effort */ } finally {
    creatingType.value = false
  }
}

const deleteType = async (id: string) => {
  try {
    await taskTypeService.remove(id)
    taskTypes.value = taskTypes.value.filter(t => t.id !== id)
  } catch { /* best-effort */ }
}

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  store.fetchTasks({ size: 100 })
  const [usersRes, leadsRes, typesRes] = await Promise.allSettled([
    userService.listActive(),
    leadService.list({ size: 200 }),
    taskTypeService.list(),
  ])
  if (usersRes.status === 'fulfilled') users.value = usersRes.value
  if (leadsRes.status === 'fulfilled') leads.value = leadsRes.value.content.map(l => ({ id: l.id, name: l.name }))
  if (typesRes.status === 'fulfilled') taskTypes.value = typesRes.value
})
</script>
