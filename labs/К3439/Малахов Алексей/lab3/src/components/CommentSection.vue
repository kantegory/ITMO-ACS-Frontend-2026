<template>
  <section class="panel" aria-labelledby="commentsTitle">
    <h2 id="commentsTitle" class="h4 mb-3">Комментарии</h2>
    <ul class="list-unstyled d-flex flex-column gap-3 mb-4" aria-live="polite">
      <li v-if="comments.length === 0" class="text-muted">
        Комментариев пока нет, будьте первым.
      </li>
      <li v-for="comment in comments" :key="comment.id" class="d-flex gap-3">
        <span class="avatar" aria-hidden="true">{{
          initials(nameOf(comment.userId))
        }}</span>
        <div>
          <div class="fw-medium">
            {{ nameOf(comment.userId) }}
            <span class="text-muted small fw-normal">{{
              formatDate(comment.date)
            }}</span>
          </div>
          <p class="mb-0">{{ comment.text }}</p>
        </div>
      </li>
    </ul>

    <form
      v-if="auth.isAuthenticated"
      ref="form"
      novalidate
      :class="{ 'was-validated': validated }"
      @input="onInput"
      @submit.prevent="submit"
    >
      <label for="commentText" class="form-label">Ваш комментарий</label>
      <textarea
        id="commentText"
        v-model="text"
        class="form-control mb-2"
        rows="3"
        required
        minlength="3"
        aria-describedby="commentError"
      />
      <div id="commentError" class="invalid-feedback mb-2">
        Напишите хотя бы пару слов.
      </div>
      <button type="submit" class="btn btn-primary" :disabled="sending">
        Отправить
      </button>
    </form>
    <p v-else class="mb-0">
      <router-link :to="{ name: 'login', query: { redirect: route.fullPath } }"
        >Войдите</router-link
      >, чтобы оставить комментарий.
    </p>
  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'

import { commentsApi } from '@/api'
import { useFormValidation } from '@/composables/useFormValidation'
import { useNotify } from '@/composables/useNotify'
import { useProfiles } from '@/composables/useProfiles'
import useAuthStore from '@/stores/auth'
import { initials } from '@/utils/format'

const props = defineProps({
  recipeId: { type: Number, required: true },
  comments: { type: Array, required: true },
})

const emit = defineEmits(['added'])

const auth = useAuthStore()
const route = useRoute()
const { nameOf } = useProfiles()
const { notify } = useNotify()
const form = ref(null)
const text = ref('')
const sending = ref(false)
const { validated, validate, resetValidation, onInput } = useFormValidation(form)

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

async function submit() {
  if (!validate()) return
  sending.value = true
  try {
    const { data } = await commentsApi.add({
      recipeId: props.recipeId,
      userId: auth.userId,
      text: text.value.trim(),
      date: new Date().toISOString(),
    })
    emit('added', data)
    text.value = ''
    await nextTick()
    resetValidation()
  } catch (error) {
    notify(error.message)
  } finally {
    sending.value = false
  }
}
</script>
