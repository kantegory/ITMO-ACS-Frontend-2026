<template>
  <div class="profile-page">
    <section class="profile-hero" aria-labelledby="profile-name">
      <div class="container">
        <div class="profile-head">
          <img
            class="profile-avatar"
            :src="avatar"
            :alt="user?.name || 'Профиль'"
            width="96"
            height="96"
          >
          <div>
            <h1 id="profile-name">{{ user?.name || user?.email }}</h1>
            <p class="profile-handle mb-1">{{ user?.handle || user?.email }}</p>
            <p class="mb-0">{{ user?.bio || 'Пользователь VICE BITES' }}</p>
          </div>
          <div class="ms-md-auto">
            <button
              type="button"
              class="btn btn-vice btn-vice-outline"
              data-bs-toggle="modal"
              data-bs-target="#editProfileModal"
            >
              Редактировать
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <ul class="nav profile-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: tab === 'saved' }"
              type="button"
              role="tab"
              :aria-selected="tab === 'saved'"
              @click="tab = 'saved'"
            >
              <Icon name="heart" class-name="icon--sm" />
              Сохранённые
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: tab === 'pub' }"
              type="button"
              role="tab"
              :aria-selected="tab === 'pub'"
              @click="tab = 'pub'"
            >
              Мои публикации
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: tab === 'follow' }"
              type="button"
              role="tab"
              :aria-selected="tab === 'follow'"
              @click="tab = 'follow'"
            >
              Подписки
            </button>
          </li>
        </ul>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <p v-if="loading" class="text-muted">Загрузка…</p>

        <div v-show="tab === 'saved'">
          <h2 class="section-title h3">Сохранённые рецепты</h2>
          <div class="recipe-grid">
            <div
              v-if="!savedRecipes.length"
              class="empty-state"
              style="grid-column: 1 / -1"
            >
              <p>Сохранённых рецептов пока нет.</p>
            </div>
            <RecipeCard
              v-for="r in savedRecipes"
              :key="r.id"
              :recipe="r"
              :author="authorMap.get(Number(r.authorId))"
              :show-like="false"
            />
          </div>
        </div>

        <div v-show="tab === 'pub'">
          <h2 class="section-title h3">Мои публикации</h2>
          <div class="recipe-grid">
            <div
              v-if="!published.length"
              class="empty-state"
              style="grid-column: 1 / -1"
            >
              <p>Вы ещё ничего не опубликовали.</p>
            </div>
            <RecipeCard
              v-for="r in published"
              :key="r.id"
              :recipe="r"
              :author="authorMap.get(Number(r.authorId))"
              :show-like="false"
            />
          </div>
        </div>

        <div v-show="tab === 'follow'">
          <h2 class="section-title h3">Подписки</h2>
          <p v-if="!following.length" class="text-muted">Подписок нет.</p>
          <div
            v-for="row in following"
            :key="row.id"
            class="follow-card"
          >
            <img
              :src="authorMap.get(Number(row.authorId))?.avatar"
              :alt="authorMap.get(Number(row.authorId))?.name"
            >
            <div class="flex-grow-1">
              <strong>{{ authorMap.get(Number(row.authorId))?.name }}</strong>
              <div class="small text-muted">
                {{ authorMap.get(Number(row.authorId))?.handle }} ·
                {{
                  Number(
                    authorMap.get(Number(row.authorId))?.followers || 0
                  ).toLocaleString('ru-RU')
                }}
                подписчиков
              </div>
              <p class="mb-0 small">
                {{ authorMap.get(Number(row.authorId))?.bio || '' }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-vice btn-vice-ghost btn-sm"
              @click="unfollow(row.id)"
            >
              Отписаться
            </button>
          </div>
        </div>
      </div>
    </section>

    <div
      id="editProfileModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="editProfileLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="editProfileLabel" class="modal-title">Редактирование</h2>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Закрыть"
            />
          </div>
          <div class="modal-body">
            <p class="mb-0">Заглушка: редактирование профиля будет позже.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { useAuth } from '@/composables/useAuth'
import {
  authorsApi,
  recipesApi,
  likesApi,
  followingApi,
} from '@/api'

const { user } = useAuth()

const tab = ref('saved')
const loading = ref(false)
const error = ref('')
const authors = ref([])
const savedRecipes = ref([])
const published = ref([])
const following = ref([])

const authorMap = computed(() => {
  const map = new Map()
  authors.value.forEach((a) => map.set(Number(a.id), a))
  return map
})

const avatar = computed(
  () =>
    user.value?.avatar ||
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop'
)

function samePerson(author, currentUser) {
  if (!author || !currentUser) return false
  const name = (currentUser.name || '').trim().toLowerCase()
  const handle = (currentUser.handle || '').trim().toLowerCase()
  return (
    (name && author.name?.trim().toLowerCase() === name) ||
    (handle && author.handle?.trim().toLowerCase() === handle)
  )
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [a, likeRows, pubs, follows] = await Promise.all([
      authorsApi.getAll(),
      likesApi.get({ userId: user.value.id }),
      recipesApi.getByUser(user.value.id),
      followingApi.getByUser(user.value.id),
    ])
    authors.value = a
    following.value = follows
    published.value = pubs.filter((recipe) =>
      samePerson(
        a.find((author) => Number(author.id) === Number(recipe.authorId)),
        user.value
      )
    )

    const recipes = await Promise.all(
      likeRows
        .filter((row) => row && row.recipeId != null)
        .map((row) => recipesApi.getById(row.recipeId).catch(() => null))
    )
    savedRecipes.value = recipes.filter(Boolean)
  } catch (e) {
    error.value = e.message || 'Не удалось загрузить кабинет. Запущен ли API?'
  } finally {
    loading.value = false
  }
}

async function unfollow(id) {
  try {
    await followingApi.remove(id)
    following.value = following.value.filter((f) => f.id !== id)
  } catch (e) {
    alert(e.message)
  }
}

onMounted(load)
</script>
