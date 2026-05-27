<template>
  <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-slate-900 dark:text-white">Blog do Site</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Gerencie posts com editor visual no estilo WordPress.</p>
      </div>
      <button
        type="button"
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
      >
        Novo post
      </button>
    </div>

    <div v-if="loading" class="text-sm text-slate-400">Carregando posts...</div>

    <div v-else-if="posts.length === 0" class="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-400">
      Nenhum post criado ainda.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="text-[11px] font-bold px-2 py-0.5 rounded-full"
              :class="post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
            >
              {{ post.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho' }}
            </span>
            <span class="text-xs text-slate-400">/{{ post.slug }}</span>
          </div>
          <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ post.title }}</p>
          <p class="text-xs text-slate-500 mt-1">
            <span v-if="post.createdByName">Por <strong>{{ post.createdByName }}</strong> · </span>
            Atualizado em {{ formatDate(post.updatedAt) }}
            <span v-if="post.publishedAt"> · Publicado em {{ formatDate(post.publishedAt) }}</span>
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="openEditModal(post)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Editar
          </button>
          <button
            type="button"
            @click="toggleStatus(post)"
            :disabled="statusChangingId === post.id"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
          >
            {{ statusChangingId === post.id ? 'Salvando...' : post.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar' }}
          </button>
          <button
            type="button"
            @click="removePost(post)"
            :disabled="deletingId === post.id"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {{ deletingId === post.id ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-[80] bg-black/40 p-4 flex items-center justify-center"
      @click.self="closeModal"
    >
      <div class="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ editingPostId ? 'Editar post' : 'Novo post' }}
          </h3>
          <button
            type="button"
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 text-sm"
          >
            Fechar
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
            Título
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
          </label>
          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Slug (opcional)
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              placeholder="deixe vazio para gerar automático"
            >
          </label>
          <label class="flex flex-col gap-1 text-xs text-slate-500">
            URL da capa (opcional)
            <input
              v-model="form.coverImageUrl"
              type="url"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
          </label>
          <label class="flex flex-col gap-1 text-xs text-slate-500">
            Data de Publicação (opcional)
            <input
              v-model="form.publishedAt"
              type="datetime-local"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
          </label>
          <label class="flex flex-col gap-1 text-xs text-slate-500 md:col-span-2">
            Resumo (opcional)
            <textarea
              v-model="form.excerpt"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            ></textarea>
          </label>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-slate-500">Conteúdo</p>
          <QuillEditor
            v-model:content="form.contentHtml"
            contentType="html"
            theme="snow"
            class="bg-white"
            :toolbar="toolbarOptions"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="save('DRAFT')"
            :disabled="saving"
            class="px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
          >
            {{ saving ? 'Salvando...' : 'Salvar rascunho' }}
          </button>
          <button
            type="button"
            @click="save('PUBLISHED')"
            :disabled="saving"
            class="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
          >
            {{ saving ? 'Publicando...' : 'Salvar e publicar' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useNotification } from '@/composables/useNotification'
import blogPostsService from '@/services/blogPosts'
import type { BlogPost, BlogPostFormInput, BlogPostStatus } from '@/types/blog'

interface Props {
  tenantId?: string
}

const props = defineProps<Props>()

const { showError, showSuccess } = useNotification()
const posts = ref<BlogPost[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const statusChangingId = ref<string | null>(null)
const editingPostId = ref<string | null>(null)

const form = ref<BlogPostFormInput>({
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '<p></p>',
  coverImageUrl: '',
  status: 'DRAFT',
  publishedAt: null,
})

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  [{ align: [] }],
  ['clean'],
]

const isSupportMode = () => !!props.tenantId

const normalizeForm = (status: BlogPostStatus): BlogPostFormInput => ({
  title: form.value.title.trim(),
  slug: form.value.slug?.trim() || null,
  excerpt: form.value.excerpt?.trim() || null,
  contentHtml: form.value.contentHtml || '<p></p>',
  coverImageUrl: form.value.coverImageUrl?.trim() || null,
  status,
  publishedAt: form.value.publishedAt || null,
})

const resetForm = () => {
  editingPostId.value = null
  form.value = {
    title: '',
    slug: '',
    excerpt: '',
    contentHtml: '<p></p>',
    coverImageUrl: '',
    status: 'DRAFT',
    publishedAt: null,
  }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const formatToDatetimeLocal = (isoString: string | null): string | null => {
  if (!isoString) return null
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const loadPosts = async () => {
  loading.value = true
  try {
    const response = isSupportMode()
      ? await blogPostsService.listSupport(props.tenantId!)
      : await blogPostsService.list()
    posts.value = response.content
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao carregar posts do blog')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const openEditModal = (post: BlogPost) => {
  editingPostId.value = post.id
  form.value = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    contentHtml: post.contentHtml,
    coverImageUrl: post.coverImageUrl || '',
    status: post.status,
    publishedAt: post.publishedAt ? formatToDatetimeLocal(post.publishedAt) : null,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const save = async (status: BlogPostStatus) => {
  if (!form.value.title.trim()) {
    showError('Título é obrigatório')
    return
  }

  saving.value = true
  try {
    const payload = normalizeForm(status)
    if (editingPostId.value) {
      if (isSupportMode()) {
        await blogPostsService.updateSupport(props.tenantId!, editingPostId.value, payload)
      } else {
        await blogPostsService.update(editingPostId.value, payload)
      }
      showSuccess('Post atualizado com sucesso!')
    } else {
      if (isSupportMode()) {
        await blogPostsService.createSupport(props.tenantId!, payload)
      } else {
        await blogPostsService.create(payload)
      }
      showSuccess('Post criado com sucesso!')
    }
    closeModal()
    await loadPosts()
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao salvar post')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (post: BlogPost) => {
  statusChangingId.value = post.id
  try {
    const nextStatus: BlogPostStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    if (isSupportMode()) {
      await blogPostsService.updateStatusSupport(props.tenantId!, post.id, { status: nextStatus })
    } else {
      await blogPostsService.updateStatus(post.id, { status: nextStatus })
    }
    showSuccess(nextStatus === 'PUBLISHED' ? 'Post publicado!' : 'Post movido para rascunho!')
    await loadPosts()
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao alterar status do post')
  } finally {
    statusChangingId.value = null
  }
}

const removePost = async (post: BlogPost) => {
  deletingId.value = post.id
  try {
    if (isSupportMode()) {
      await blogPostsService.deleteSupport(props.tenantId!, post.id)
    } else {
      await blogPostsService.delete(post.id)
    }
    showSuccess('Post excluído com sucesso!')
    await loadPosts()
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : 'Erro ao excluir post')
  } finally {
    deletingId.value = null
  }
}

onMounted(loadPosts)
</script>
