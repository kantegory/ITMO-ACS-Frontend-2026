<template>
  <div v-if="apiDown" class="container section">
    <div class="empty-state">
      <h1 class="display">API не запущен</h1>
      <p>Выполни <code>npm run api</code> в папке lab3.</p>
    </div>
  </div>

  <div v-else-if="loadError" class="container section">
    <div class="empty-state">
      <h1 class="display">Рецепт не найден</h1>
      <p>{{ loadError }}</p>
      <p><RouterLink to="/">Вернуться в каталог</RouterLink></p>
    </div>
  </div>

  <template v-else-if="recipe">
    <img
      class="recipe-hero-img"
      :src="recipe.image"
      :alt="recipe.title"
      width="1200"
      height="420"
    >

    <div class="container recipe-detail">
      <nav aria-label="Хлебные крошки" class="mb-3">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <RouterLink to="/">Рецепты</RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ recipe.title }}
          </li>
        </ol>
      </nav>

      <div class="row g-4">
        <div class="col-lg-8">
          <h1 class="recipe-detail__title">{{ recipe.title }}</h1>
          <p class="recipe-detail__desc">{{ recipe.description }}</p>

          <div class="meta-pills" aria-label="Метаданные рецепта">
            <span class="meta-pill teal">{{ recipe.type }}</span>
            <span class="meta-pill">{{ recipe.difficulty }}</span>
            <span class="meta-pill pink">
              <Icon name="clock" />
              {{ recipe.time }}
            </span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center mb-4">
            <LikeButton
              :recipe-id="recipe.id"
              :title="recipe.title"
              :likes="likes"
              :liked="liked"
              @update="onLikeUpdate"
            />
            <button
              type="button"
              class="btn btn-vice btn-vice-ghost"
              data-bs-toggle="modal"
              data-bs-target="#shareModal"
            >
              <Icon name="share" class-name="icon--sm" />
              Поделиться
            </button>
          </div>

          <AuthorBox
            v-if="author"
            :author="author"
            :following="Boolean(followRow)"
            :busy="followBusy"
            @toggle-follow="toggleFollow"
          />

          <h2 class="section-title h3">Шаги</h2>
          <ol class="steps-list">
            <li v-for="(step, i) in recipe.steps || []" :key="i">{{ step }}</li>
          </ol>

          <h2 class="section-title h3">Видео</h2>
          <div class="video-frame mb-4">
            <iframe
              v-if="videoLoaded"
              :src="recipe.videoUrl"
              :title="`Видео: ${recipe.title}`"
              allowfullscreen
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <div
              v-else
              class="video-placeholder"
              role="button"
              tabindex="0"
              aria-label="Загрузить видео"
              @click="videoLoaded = true"
              @keydown.enter.prevent="videoLoaded = true"
              @keydown.space.prevent="videoLoaded = true"
            >
              <Icon name="play" class-name="icon--lg" />
              <span>Смотреть (заглушка embed)</span>
            </div>
          </div>

          <h2 class="section-title h3">Комментарии</h2>
          <CommentList :comments="comments" />

          <form class="mt-4" @submit.prevent="sendComment">
            <div class="mb-3">
              <label class="form-label" for="comment-name">Имя</label>
              <input
                id="comment-name"
                v-model="commentName"
                class="form-control"
                type="text"
              >
            </div>
            <div class="mb-3">
              <label class="form-label" for="comment-text">Комментарий</label>
              <textarea
                id="comment-text"
                v-model="commentText"
                class="form-control"
                rows="3"
                required
              />
            </div>
            <button type="submit" class="btn btn-vice btn-vice-primary" :disabled="commentBusy">
              Отправить
            </button>
          </form>
        </div>

        <aside class="col-lg-4">
          <div class="stroke-box sidebar-sticky">
            <h2 class="h4 mb-3">Ингредиенты</h2>
            <ul class="ingredient-list">
              <li v-for="ing in recipe.ingredients || []" :key="ing">{{ ing }}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </template>

  <div
    id="shareModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="shareModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="shareModalLabel" class="modal-title">Поделиться</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          />
        </div>
        <div class="modal-body">
          <p class="mb-0">Заглушка: скопируй ссылку из адресной строки браузера.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import LikeButton from '@/components/LikeButton.vue'
import AuthorBox from '@/components/AuthorBox.vue'
import CommentList from '@/components/CommentList.vue'
import {
  recipesApi,
  authorsApi,
  commentsApi,
  likesApi,
  followingApi,
  apiURL,
} from '@/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const recipe = ref(null)
const author = ref(null)
const comments = ref([])
const liked = ref(false)
const likes = ref(0)
const followRow = ref(null)
const followBusy = ref(false)
const videoLoaded = ref(false)
const apiDown = ref(false)
const loadError = ref('')
const commentName = ref('')
const commentText = ref('')
const commentBusy = ref(false)

function todayRu() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

async function load() {
  apiDown.value = false
  loadError.value = ''
  recipe.value = null

  try {
    await fetch(`${apiURL}/recipes`)
  } catch {
    apiDown.value = true
    return
  }

  const id = route.params.id
  try {
    const authors = await authorsApi.getAll()
    recipe.value = await recipesApi.getById(id)
    author.value =
      authors.find((a) => Number(a.id) === Number(recipe.value.authorId)) ||
      (await authorsApi.getById(recipe.value.authorId))
    comments.value = await commentsApi.getByRecipe(id)
    likes.value = Number(recipe.value.likes || 0)
    document.title = `${recipe.value.title} — VICE BITES`

    if (auth.isLoggedIn) {
      commentName.value = auth.user.name || auth.user.email || ''
      const likeRows = await likesApi.get({
        recipeId: id,
        userId: auth.user.id,
      })
      liked.value = likeRows.length > 0
      const follows = await followingApi.getByUser(auth.user.id)
      followRow.value =
        follows.find(
          (f) => Number(f.authorId) === Number(recipe.value.authorId)
        ) || null
    }
  } catch (e) {
    loadError.value = e.message || 'Ошибка загрузки'
  }
}

function onLikeUpdate(next) {
  liked.value = next.liked
  likes.value = next.likes
}

async function toggleFollow() {
  if (!auth.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  followBusy.value = true
  try {
    if (followRow.value) {
      await followingApi.remove(followRow.value.id)
      followRow.value = null
    } else {
      followRow.value = await followingApi.add(
        recipe.value.authorId,
        auth.user.id
      )
    }
  } catch (e) {
    alert(e.message)
  } finally {
    followBusy.value = false
  }
}

async function sendComment() {
  if (!auth.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const text = commentText.value.trim()
  if (!text) return

  commentBusy.value = true
  try {
    await commentsApi.create({
      recipeId: Number(recipe.value.id),
      userId: Number(auth.user.id),
      author:
        commentName.value.trim() || auth.user.name || auth.user.email,
      text,
      date: todayRu(),
    })
    commentText.value = ''
    comments.value = await commentsApi.getByRecipe(recipe.value.id)
  } catch (e) {
    alert(e.message || 'Не удалось отправить комментарий')
  } finally {
    commentBusy.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)
</script>
