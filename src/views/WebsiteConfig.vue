<template>
  <AppLayout>
    <template #header>
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white">Configurações do Site</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Personalize a identidade visual e os textos do seu site público.</p>
      </div>
    </template>

    <div class="space-y-6">
      <div v-if="isLoading" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-500 dark:text-slate-400">
        Carregando configurações...
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-3">
        <form class="space-y-6 xl:col-span-2" @submit.prevent="saveConfig">
          <section data-tour-id="website-domain" class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_34%),linear-gradient(135deg,_#fffdf8_0%,_#f8fafc_48%,_#eaf1ff_100%)] text-slate-900 shadow-sm dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#172033_48%,_#111827_100%)] dark:text-white">
            <div class="p-5 sm:p-6">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-2xl">
                  <p class="text-xs uppercase tracking-[0.25em] text-blue-700/80 dark:text-blue-200/80">Domínio do site</p>
                  <h2 class="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Use um domínio próprio com ativação simples</h2>
                  <p class="mt-2 text-sm text-slate-600 dark:text-slate-200">
                    Veja o andamento da configuração por aqui e abra a tela detalhada apenas quando precisar editar.
                  </p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <RouterLink
                    to="/website-domain"
                    class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Abrir domínio
                  </RouterLink>
                </div>
              </div>

              <div class="mt-6 grid gap-3 md:grid-cols-3">
                <div class="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">Domínio atual</p>
                  <p class="mt-2 break-all text-sm font-semibold text-slate-900 dark:text-white">
                    {{ domainSummary.customDomain || 'Nenhum domínio configurado' }}
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">Status</p>
                  <div class="mt-2">
                    <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" :class="domainStatusBadgeClass">
                      {{ domainStatusLabel }}
                    </span>
                  </div>
                  <p class="mt-2 text-xs text-slate-600 dark:text-slate-200">
                    {{ domainStatusDescription }}
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">Endereço para conexão</p>
                  <p class="mt-2 break-all font-mono text-xs text-slate-700 dark:text-blue-100">
                    {{ domainSummary.customDomainTarget || 'Disponível após salvar o domínio' }}
                  </p>
                </div>
              </div>
            </div>
            <div class="grid gap-px border-t border-slate-200/80 bg-slate-200/80 dark:border-white/10 dark:bg-white/10 sm:grid-cols-3">
              <div class="bg-white/85 p-4 dark:bg-slate-950/20">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">1. Salvar</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">Informe o domínio do site e salve a configuração.</p>
              </div>
              <div class="bg-white/85 p-4 dark:bg-slate-950/20">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">2. Apontar</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">Use o endereço de conexão no painel onde o domínio é administrado.</p>
              </div>
              <div class="bg-white/85 p-4 dark:bg-slate-950/20">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-100/80">3. Ativar</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">Aguarde a ativação e depois teste o acesso ao site.</p>
              </div>
            </div>
          </section>

          <div data-tour-id="website-tabs" class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="siteTab = 'visual'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteTab === 'visual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Visual
            </button>
            <button
              type="button"
              @click="siteTab = 'content'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteTab === 'content' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Conteúdo
            </button>
            <button
              type="button"
              @click="siteTab = 'contact'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteTab === 'contact' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Contato
            </button>
            <button
              type="button"
              @click="siteTab = 'blog'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteTab === 'blog' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Blog
            </button>
            <button
              type="button"
              @click="siteTab = 'about'"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="siteTab === 'about' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            >
              Sobre
            </button>
          </div>

          <section v-if="siteTab === 'visual'" data-tour-id="website-editor" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Identidade Visual</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Atualize logotipo, favicon e paleta do site.</p>
            </div>

            <div class="grid gap-5 lg:grid-cols-2">
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Logo</label>
                <div class="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                  <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                    <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo atual" class="h-full w-full object-contain">
                    <span v-else class="text-xs text-slate-400">Sem logo</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      @click="logoInputRef?.click()"
                      :disabled="isUploadingLogo"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {{ isUploadingLogo ? 'Enviando...' : 'Enviar logo' }}
                    </button>
                    <button
                      type="button"
                      @click="removeLogo"
                      :disabled="isDeletingLogo || !config.logoUrl"
                      class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                    >
                      {{ isDeletingLogo ? 'Removendo...' : 'Remover' }}
                    </button>
                  </div>
                </div>
                <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="handleLogoSelected">
              </div>

              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Favicon</label>
                <div class="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                  <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                    <img v-if="config.faviconUrl" :src="config.faviconUrl" alt="Favicon atual" class="h-10 w-10 object-contain">
                    <span v-else class="text-xs text-slate-400">Sem favicon</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      @click="faviconInputRef?.click()"
                      :disabled="isUploadingFavicon"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {{ isUploadingFavicon ? 'Enviando...' : 'Enviar favicon' }}
                    </button>
                    <button
                      type="button"
                      @click="removeFavicon"
                      :disabled="isDeletingFavicon || !config.faviconUrl"
                      class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                    >
                      {{ isDeletingFavicon ? 'Removendo...' : 'Remover' }}
                    </button>
                  </div>
                </div>
                <input ref="faviconInputRef" type="file" accept="image/*,.ico" class="hidden" @change="handleFaviconSelected">
              </div>
            </div>

            <!-- Banner Principal (Hero) -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">Banner Principal do Site</label>
              <div class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 overflow-hidden">
                <div class="relative w-full bg-slate-100 dark:bg-slate-900" style="aspect-ratio: 16/6">
                  <img
                    v-if="config.heroImageUrl"
                    :src="config.heroImageUrl"
                    alt="Banner do hero"
                    class="absolute inset-0 w-full h-full object-cover"
                  >
                  <div v-else class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm text-slate-400">Sem imagem de destaque</span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    @click="heroImageInputRef?.click()"
                    :disabled="isUploadingHeroImage"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {{ isUploadingHeroImage ? 'Enviando...' : 'Enviar banner' }}
                  </button>
                  <button
                    type="button"
                    @click="removeHeroImage"
                    :disabled="isDeletingHeroImage || !config.heroImageUrl"
                    class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50"
                  >
                    {{ isDeletingHeroImage ? 'Removendo...' : 'Remover' }}
                  </button>
                  <span class="text-xs text-slate-400 ml-auto">Recomendado: 1440×560px (16:5.5)</span>
                </div>
              </div>
              <input ref="heroImageInputRef" type="file" accept="image/*" class="hidden" @change="handleHeroImageSelected">
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Cor primária</label>
                <div class="flex items-center gap-3">
                  <input :value="primaryColorValue" type="color" class="h-11 w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1" @input="updateColor('primaryColor', $event)">
                  <input v-model="primaryColorValue" type="text" placeholder="#0066FF" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" @blur="normalizeColor('primaryColor')">
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Cor secundária</label>
                <div class="flex items-center gap-3">
                  <input :value="secondaryColorValue" type="color" class="h-11 w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1" @input="updateColor('secondaryColor', $event)">
                  <input v-model="secondaryColorValue" type="text" placeholder="#FF6B35" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" @blur="normalizeColor('secondaryColor')">
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="siteTab === 'content'" class="space-y-6">
            <section data-tour-id="website-editor" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Conteúdo da Home</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Edite os textos principais exibidos no site público.</p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nome da empresa</label>
                  <input v-model="config.companyName" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Título principal</label>
                  <input v-model="config.heroTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Subtítulo principal</label>
                <textarea v-model="config.heroSubtitle" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
              </div>

              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Descrição</label>
                <textarea v-model="config.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"></textarea>
              </div>
            </section>

            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Seções da página</h2>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Destaques - título
                  <input v-model="config.featuredSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Destaques - subtítulo
                  <input v-model="config.featuredSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Lançamentos - título
                  <input v-model="config.launchesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Lançamentos - subtítulo
                  <input v-model="config.launchesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Categorias - título
                  <input v-model="config.categoriesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Categorias - subtítulo
                  <input v-model="config.categoriesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Serviços - título
                  <input v-model="config.servicesSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Serviços - subtítulo
                  <input v-model="config.servicesSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Formulário - título
                  <input v-model="config.servicesFormTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Formulário - subtítulo
                  <input v-model="config.servicesFormSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Estatísticas - título
                  <input v-model="config.statsSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Estatísticas - subtítulo
                  <input v-model="config.statsSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Blog - título
                  <input v-model="config.blogSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  Blog - subtítulo
                  <input v-model="config.blogSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  CTA - título
                  <input v-model="config.ctaSectionTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
                <label class="flex flex-col gap-1 text-xs text-slate-500">
                  CTA - subtítulo
                  <input v-model="config.ctaSectionSubtitle" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                </label>
              </div>
            </section>
          </section>

          <BlogPostsManager v-else-if="siteTab === 'blog'" />

          <section v-else-if="siteTab === 'about'" data-tour-id="website-editor" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Página Sobre</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Conte a história da sua imobiliária para os visitantes do site.</p>
            </div>

            <!-- Image -->
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Foto / Imagem da equipe</label>
              <div class="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                <div class="flex h-24 w-36 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0">
                  <img v-if="config.aboutImageUrl" :src="config.aboutImageUrl" alt="Imagem sobre" class="h-full w-full object-cover">
                  <span v-else class="text-xs text-slate-400 text-center px-2">Sem imagem</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" @click="aboutImageInputRef?.click()" :disabled="isUploadingAboutImage"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                    {{ isUploadingAboutImage ? 'Enviando...' : 'Enviar imagem' }}
                  </button>
                  <button type="button" @click="removeAboutImage" :disabled="isDeletingAboutImage || !config.aboutImageUrl"
                    class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50">
                    {{ isDeletingAboutImage ? 'Removendo...' : 'Remover' }}
                  </button>
                  <input ref="aboutImageInputRef" type="file" accept="image/*" class="hidden" @change="handleAboutImageSelected">
                </div>
              </div>
            </div>

            <!-- Title / Subtitle -->
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Título da página</label>
                <input v-model="config.aboutPageTitle" type="text" placeholder="Sobre Nós"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Subtítulo</label>
                <input v-model="config.aboutPageSubtitle" type="text" placeholder="Conheça nossa história"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Descrição / História</label>
              <textarea v-model="config.aboutPageDescription" rows="4" placeholder="Conte a história da sua imobiliária..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-y" />
            </div>

            <!-- Mission / Vision / Values -->
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Missão</label>
                <textarea v-model="config.aboutMission" rows="3" placeholder="Nossa missão é..."
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-y" />
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Visão</label>
                <textarea v-model="config.aboutVision" rows="3" placeholder="Nossa visão é..."
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-y" />
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Valores</label>
                <textarea v-model="config.aboutValues" rows="3" placeholder="Ética, transparência, comprometimento..."
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-y" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Ano de fundação</label>
                <input v-model="config.aboutFoundedYear" type="text" placeholder="2015"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nº de corretores</label>
                <input v-model="config.aboutTeamCount" type="text" placeholder="50+"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Imóveis negociados</label>
                <input v-model="config.aboutPropertiesCount" type="text" placeholder="1.000+"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>
          </section>

          <section v-else data-tour-id="website-editor" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Contato e redes</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Atualize os dados de contato exibidos no site.</p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Telefone</label>
                <PhoneInput v-model="config.phone" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">E-mail</label>
                <input v-model="config.email" type="email" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Endereço</label>
              <input v-model="config.address" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Instagram</label>
                <input v-model="config.instagramUrl" type="url" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Facebook</label>
                <input v-model="config.facebookUrl" type="url" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">WhatsApp</label>
              <PhoneInput v-model="config.whatsappNumber" placeholder="11 99999-9999" />
            </div>
          </section>

          <div v-if="siteTab !== 'blog'" class="flex justify-end">
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {{ isSaving ? 'Salvando...' : 'Salvar configurações' }}
            </button>
          </div>
        </form>

        <aside class="space-y-6">
          <section data-tour-id="website-preview" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 sticky top-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Prévia do Site</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Resumo rápido da vitrine pública.</p>
              </div>
              <a
                v-if="publicWebsiteUrl"
                :href="publicWebsiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Ver site
              </a>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div class="p-4 text-white" :style="{ backgroundColor: previewPrimaryColor }">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/20">
                    <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo" class="h-full w-full object-contain">
                    <span v-else class="text-lg font-semibold">{{ previewCompanyInitial }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold">{{ config.companyName || 'Sua imobiliária' }}</p>
                    <p class="text-xs text-white/80">{{ authStore.currentTenantSubdomain ? `@${authStore.currentTenantSubdomain}` : 'Tenant atual' }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4 p-4">
                <div class="rounded-xl p-4" :style="{ backgroundColor: previewSecondaryColor }">
                  <p class="text-sm font-semibold text-slate-900">{{ config.heroTitle || 'Destaque sua marca' }}</p>
                  <p class="mt-2 text-xs text-slate-700">{{ config.heroSubtitle || 'Mostre seus imóveis com uma identidade visual consistente.' }}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
                  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ config.description || 'Adicione uma descrição para apresentar a imobiliária ao público.' }}</p>
                </div>

                <div class="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <p><span class="font-medium text-slate-900 dark:text-white">Telefone:</span> {{ config.phone || 'Não informado' }}</p>
                  <p><span class="font-medium text-slate-900 dark:text-white">E-mail:</span> {{ config.email || 'Não informado' }}</p>
                  <p><span class="font-medium text-slate-900 dark:text-white">WhatsApp:</span> {{ config.whatsappNumber || 'Não informado' }}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import BlogPostsManager from '@/components/site/BlogPostsManager.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { useNotification } from '@/composables/useNotification'
import websiteConfigService from '@/services/websiteConfig'
import { useAuthStore } from '@/stores/auth'
import type { TenantWebsiteConfig } from '@/types/tenantsAdmin'

const DEFAULT_PRIMARY_COLOR = '#0066FF'
const DEFAULT_SECONDARY_COLOR = '#FF6B35'
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/

const authStore = useAuthStore()
const { showError, showSuccess } = useNotification()

const config = ref<Partial<TenantWebsiteConfig>>({})
const domainSummary = ref<{
  customDomain: string | null
  customDomainStatus: string | null
  customDomainTarget: string | null
}>({
  customDomain: null,
  customDomainStatus: null,
  customDomainTarget: null,
})
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingLogo = ref(false)
const isDeletingLogo = ref(false)
const isUploadingFavicon = ref(false)
const isDeletingFavicon = ref(false)
const isUploadingHeroImage = ref(false)
const isDeletingHeroImage = ref(false)
const isUploadingAboutImage = ref(false)
const isDeletingAboutImage = ref(false)
const siteTab = ref<'visual' | 'content' | 'contact' | 'blog' | 'about'>('visual')
const logoInputRef = ref<HTMLInputElement | null>(null)
const faviconInputRef = ref<HTMLInputElement | null>(null)
const heroImageInputRef = ref<HTMLInputElement | null>(null)
const aboutImageInputRef = ref<HTMLInputElement | null>(null)

const primaryColorValue = computed({
  get: () => config.value.primaryColor ?? DEFAULT_PRIMARY_COLOR,
  set: value => {
    config.value.primaryColor = value
  },
})

const secondaryColorValue = computed({
  get: () => config.value.secondaryColor ?? DEFAULT_SECONDARY_COLOR,
  set: value => {
    config.value.secondaryColor = value
  },
})

const previewPrimaryColor = computed(() => normalizeHexColor(config.value.primaryColor) ?? DEFAULT_PRIMARY_COLOR)
const previewSecondaryColor = computed(() => normalizeHexColor(config.value.secondaryColor) ?? DEFAULT_SECONDARY_COLOR)
const previewCompanyInitial = computed(() => (config.value.companyName?.trim().charAt(0) || 'R').toUpperCase())
const publicWebsiteUrl = computed(() => buildWebsiteUrl(authStore.currentTenantSubdomain))
const domainStatusLabel = computed(() => {
  const status = (domainSummary.value.customDomainStatus || '').toUpperCase()
  if (!domainSummary.value.customDomain) return 'Não configurado'
  if (status === 'ACTIVE') return 'Ativo'
  if (status === 'PENDING') return 'Em configuração'
  if (status === 'FAILED') return 'Precisa de atenção'
  return domainSummary.value.customDomainStatus || 'Pendente'
})
const domainStatusBadgeClass = computed(() => {
  const status = (domainSummary.value.customDomainStatus || '').toUpperCase()
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'
  if (status === 'FAILED') return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100'
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100'
  return 'bg-slate-100 text-slate-700 dark:bg-white/15 dark:text-slate-100'
})
const domainStatusDescription = computed(() => {
  const status = (domainSummary.value.customDomainStatus || '').toUpperCase()
  if (!domainSummary.value.customDomain) return 'Nenhum domínio foi configurado para o site até agora.'
  if (status === 'ACTIVE') return 'O domínio está ativo e pronto para receber visitas com acesso seguro.'
  if (status === 'PENDING') return 'A configuração foi iniciada e depende apenas da conclusão do apontamento do domínio.'
  if (status === 'FAILED') return 'A configuração não foi concluída. Revise o domínio salvo antes de tentar novamente.'
  return 'Abra a tela de domínio para editar ou revisar essa configuração.'
})

function normalizeHexColor(value?: string | null): string | null {
  if (!value) return null
  const normalized = value.trim().toUpperCase()
  return HEX_COLOR_REGEX.test(normalized) ? normalized : null
}

function buildWebsiteUrl(subdomain: string | null): string | null {
  if (!subdomain || typeof window === 'undefined') return null

  if (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')) {
    return `http://${subdomain}.localhost:3000`
  }

  const hostParts = window.location.hostname.split('.')
  const websiteHost = hostParts.length > 2
    ? [subdomain, ...hostParts.slice(1)].join('.')
    : `${subdomain}.${window.location.hostname}`

  return `${window.location.protocol}//${websiteHost}`
}

function applyConfig(data: TenantWebsiteConfig) {
  config.value = { ...data }
}

function applyDomainSummary(data: { customDomain: string | null; customDomainStatus?: string | null; customDomainTarget?: string | null }) {
  domainSummary.value = {
    customDomain: data.customDomain,
    customDomainStatus: data.customDomainStatus ?? null,
    customDomainTarget: data.customDomainTarget ?? null,
  }
}

function updateColor(field: 'primaryColor' | 'secondaryColor', event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  config.value[field] = target.value.toUpperCase()
}

function normalizeColor(field: 'primaryColor' | 'secondaryColor') {
  const normalized = normalizeHexColor(config.value[field])
  config.value[field] = normalized ?? null
}

function resetFileInput(target: HTMLInputElement | null) {
  if (target) {
    target.value = ''
  }
}

async function loadConfig() {
  isLoading.value = true
  try {
    const [response, domainResponse] = await Promise.all([
      websiteConfigService.getConfig(),
      websiteConfigService.getCustomDomain(),
    ])
    applyConfig(response)
    applyDomainSummary(domainResponse)
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao carregar configurações do site')
  } finally {
    isLoading.value = false
  }
}

async function saveConfig() {
  isSaving.value = true
  try {
    normalizeColor('primaryColor')
    normalizeColor('secondaryColor')
    const response = await websiteConfigService.updateConfig(config.value)
    applyConfig(response)
    showSuccess('Configurações salvas!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao salvar configurações do site')
  } finally {
    isSaving.value = false
  }
}

async function handleLogoSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingLogo.value = true
  try {
    const response = await websiteConfigService.uploadLogo(target.files[0])
    applyConfig(response)
    showSuccess('Logo atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar logo')
  } finally {
    isUploadingLogo.value = false
    resetFileInput(target)
  }
}

async function removeLogo() {
  if (!config.value.logoUrl) return

  isDeletingLogo.value = true
  try {
    const response = await websiteConfigService.deleteLogo()
    applyConfig(response)
    showSuccess('Logo removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover logo')
  } finally {
    isDeletingLogo.value = false
    resetFileInput(logoInputRef.value)
  }
}

async function handleFaviconSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingFavicon.value = true
  try {
    const response = await websiteConfigService.uploadFavicon(target.files[0])
    applyConfig(response)
    showSuccess('Favicon atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar favicon')
  } finally {
    isUploadingFavicon.value = false
    resetFileInput(target)
  }
}

async function removeFavicon() {
  if (!config.value.faviconUrl) return

  isDeletingFavicon.value = true
  try {
    const response = await websiteConfigService.deleteFavicon()
    applyConfig(response)
    showSuccess('Favicon removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover favicon')
  } finally {
    isDeletingFavicon.value = false
    resetFileInput(faviconInputRef.value)
  }
}

async function handleHeroImageSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingHeroImage.value = true
  try {
    const response = await websiteConfigService.uploadHeroImage(target.files[0])
    applyConfig(response)
    showSuccess('Banner do hero atualizado com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar banner')
  } finally {
    isUploadingHeroImage.value = false
    resetFileInput(target)
  }
}

async function removeHeroImage() {
  if (!config.value.heroImageUrl) return

  isDeletingHeroImage.value = true
  try {
    const response = await websiteConfigService.deleteHeroImage()
    applyConfig(response)
    showSuccess('Banner removido com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover banner')
  } finally {
    isDeletingHeroImage.value = false
    resetFileInput(heroImageInputRef.value)
  }
}

async function handleAboutImageSelected(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files?.length) return

  isUploadingAboutImage.value = true
  try {
    const response = await websiteConfigService.uploadAboutImage(target.files[0])
    applyConfig(response)
    showSuccess('Imagem da página Sobre atualizada com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao enviar imagem')
  } finally {
    isUploadingAboutImage.value = false
    resetFileInput(target)
  }
}

async function removeAboutImage() {
  if (!config.value.aboutImageUrl) return

  isDeletingAboutImage.value = true
  try {
    const response = await websiteConfigService.deleteAboutImage()
    applyConfig(response)
    showSuccess('Imagem removida com sucesso!')
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao remover imagem')
  } finally {
    isDeletingAboutImage.value = false
    resetFileInput(aboutImageInputRef.value)
  }
}

onMounted(() => {
  loadConfig()
})
</script>
