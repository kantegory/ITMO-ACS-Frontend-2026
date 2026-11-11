<script setup>
import { onMounted, ref } from 'vue'

import { commentsApi } from '@/api'
import UserAvatar from '@/components/UserAvatar.vue'
import { useApiError } from '@/composables/useApiError'
import { useToast } from '@/composables/useToast'
import useAuthStore from '@/stores/auth'
import { formatDate } from '@/utils/format'

const props = defineProps({
  recipeId: { type: Number, required: true }
})

// число комментариев нужно и странице (кнопка со счётчиком вверху)
const count = defineModel('count', { type: Number, default: 0 })

const auth = useAuthStore()
const { handleError } = useApiError()
const { showToast } = useToast()

const comments = ref([])
const text = ref('')
const validated = ref(false)

async function load() {
  const { data } = await commentsApi.getByRecipe(props.recipeId)
  comments.value = data
  count.value = data.length
}

async function submit(event) {
  validated.value = true
  if (!event.target.checkValidity()) return

  try {
    const { data } = await commentsApi.create({
      recipeId: props.recipeId,
      userId: auth.user.id,
      text: text.value.trim(),
      createdAt: new Date().toISOString()
    })
    comments.value.unshift({ ...data, user: auth.user })
    count.value = comments.value.length
    text.value = ''
    validated.value = false
    showToast('Комментарий опубликован')
  } catch (error) {
    handleError(error)
  }
}

async function remove(comment) {
  try {
    await commentsApi.remove(comment.id)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
    count.value = comments.value.length
  } catch (error) {
    handleError(error)
  }
}

onMounted(load)
</script>

<template>
  <section id="comments" class="panel">
    <h2 class="panel__title">Комментарии <span class="text-muted-warm">{{ comments.length }}</span></h2>

    <form v-if="auth.isLoggedIn" class="mb-3" :class="{ 'was-validated': validated }" novalidate @submit.prevent="submit">
      <label class="form-label" for="commentText">Ваш комментарий</label>
      <textarea
        id="commentText"
        v-model="text"
        class="form-control"
        rows="3"
        placeholder="Как у вас получилось?"
        aria-describedby="commentError"
        required
      />
      <div id="commentError" class="invalid-feedback">Напишите хотя бы пару слов.</div>
      <button class="btn btn-accent mt-2" type="submit">Отправить</button>
    </form>
    <p v-else class="text-muted-warm">
      <RouterLink :to="{ name: 'login', query: { redirect: $route.fullPath } }">Войдите</RouterLink>, чтобы оставить комментарий.
    </p>

    <article v-for="comment in comments" :key="comment.id" class="comment">
      <UserAvatar :user="comment.user" />
      <div class="flex-grow-1">
        <div class="comment__head">
          <RouterLink class="comment__name text-reset text-decoration-none" :to="{ name: 'author', params: { id: comment.userId } }">
            {{ comment.user?.name }}
          </RouterLink>
          <span class="comment__date">{{ formatDate(comment.createdAt) }}</span>
          <button
            v-if="comment.userId === auth.user?.id"
            class="btn btn-link btn-sm p-0 ms-auto text-muted-warm"
            type="button"
            :aria-label="`Удалить мой комментарий от ${formatDate(comment.createdAt)}`"
            @click="remove(comment)"
          >
            Удалить
          </button>
        </div>
        <p>{{ comment.text }}</p>
      </div>
    </article>
    <p v-if="!comments.length" class="text-muted-warm mb-0">Пока никто не написал. Будьте первым!</p>
  </section>
</template>
