<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { recipesApi, socialApi, usersApi } from '@/api'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseModal from '@/components/BaseModal.vue'
import CookCard from '@/components/CookCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ProfileHeader from '@/components/ProfileHeader.vue'
import RecipeFormModal from '@/components/RecipeFormModal.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useApiError } from '@/composables/useApiError'
import { useSaved } from '@/composables/useSaved'
import { useToast } from '@/composables/useToast'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'
import { plural } from '@/utils/format'

const auth = useAuthStore()
const { handleError } = useApiError()
const { showToast } = useToast()
const { saved, loadSaved, toggleSave } = useSaved()

const user = ref(null)
const mine = ref([])
const savedRecipes = ref([])
const following = ref([])
const followersCount = ref(0)
const loading = ref(true)

const recipeForm = ref(null)
const deleteModal = ref(null)
const profileModal = ref(null)
const toDelete = ref(null)
const profile = reactive({ name: '', city: '', bio: '' })
const profileValidated = ref(false)

/* ---------- вкладки ---------- */

const TABS = [
  { key: 'mine', label: 'Мои рецепты', heading: 'Мои рецепты' },
  { key: 'saved', label: 'Сохранённые', heading: 'Сохранённые рецепты' },
  { key: 'following', label: 'Подписки', heading: 'Подписки' }
]
const activeTab = ref('mine')
const tabCounts = computed(() => ({
  mine: mine.value.length,
  saved: savedRecipes.value.length,
  following: following.value.length
}))

// стрелки влево/вправо переключают вкладки, как требует шаблон ARIA tabs
function moveTab(step) {
  const index = TABS.findIndex((tab) => tab.key === activeTab.value)
  const next = TABS[(index + step + TABS.length) % TABS.length]
  activeTab.value = next.key
  document.getElementById(`tab-${next.key}`).focus()
}

const stats = computed(() => [
  { value: mine.value.length, label: plural(mine.value.length, 'публикация', 'публикации', 'публикаций') },
  { value: savedRecipes.value.length, label: 'сохранено' },
  { value: following.value.length, label: plural(following.value.length, 'подписка', 'подписки', 'подписок') },
  { value: followersCount.value, label: plural(followersCount.value, 'подписчик', 'подписчика', 'подписчиков') }
])

/* ---------- загрузка ---------- */

async function loadMine() {
  const { data } = await recipesApi.getAll({ userId: auth.user.id, _sort: 'createdAt', _order: 'desc' })
  mine.value = data
}

async function loadSavedRecipes() {
  await loadSaved()
  const ids = [...saved.value.keys()]
  // все сохранённые одним запросом: /recipes?id=1&id=3...
  savedRecipes.value = ids.length ? (await recipesApi.getAll({ id: ids })).data : []
}

async function loadFollowing() {
  const { data: subs } = await socialApi.getSubscriptions({ userId: auth.user.id })
  const authors = subs.length ? (await usersApi.getAll({ id: subs.map((sub) => sub.authorId) })).data : []
  following.value = subs.map((subscription) => ({
    subscription,
    author: authors.find((author) => author.id === subscription.authorId)
  }))
}

async function load() {
  try {
    const [userResponse, followers] = await Promise.all([
      usersApi.getById(auth.user.id),
      socialApi.getSubscriptions({ authorId: auth.user.id }),
      loadMine(),
      loadSavedRecipes(),
      loadFollowing()
    ])
    user.value = userResponse.data
    followersCount.value = followers.data.length
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

// закладку сняли или поставили — обновляем список «Сохранённые»
watch(() => saved.value.size, async () => {
  if (loading.value) return
  const ids = [...saved.value.keys()]
  savedRecipes.value = ids.length ? (await recipesApi.getAll({ id: ids })).data : []
})

/* ---------- действия ---------- */

async function onRecipeSaved() {
  await loadMine()
}

function askDelete(recipe) {
  toDelete.value = recipe
  deleteModal.value.show()
}

async function confirmDelete() {
  try {
    // json-server сам удалит связанные лайки, комментарии и сохранения
    await recipesApi.remove(toDelete.value.id)
    deleteModal.value.hide()
    showToast('Рецепт удалён')
    await Promise.all([loadMine(), loadSavedRecipes()])
  } catch (error) {
    handleError(error)
  }
}

function openProfile() {
  Object.assign(profile, { name: user.value.name, city: user.value.city ?? '', bio: user.value.bio ?? '' })
  profileValidated.value = false
  profileModal.value.show()
}

async function saveProfile(event) {
  profileValidated.value = true
  if (!event.target.checkValidity()) return
  try {
    const data = { name: profile.name.trim(), city: profile.city.trim(), bio: profile.bio.trim() }
    await auth.updateProfile(data)
    user.value = { ...user.value, ...data }
    profileModal.value.hide()
    showToast('Профиль сохранён')
  } catch (error) {
    handleError(error)
  }
}

async function unsubscribe(subscription) {
  try {
    await socialApi.unsubscribe(subscription.id)
    following.value = following.value.filter((item) => item.subscription.id !== subscription.id)
    showToast('Подписка отменена')
  } catch (error) {
    handleError(error)
  }
}

onMounted(load)
</script>

<template>
  <BaseLayout>
    <LoadingSpinner v-if="loading || !user" />

    <template v-else>
      <ProfileHeader :user="user" :stats="stats" :subtitle="`${user.city || 'Город не указан'} · ${user.email}`">
        <template #actions>
          <button class="btn btn-soft" type="button" @click="openProfile"><BaseIcon name="edit" /> Редактировать</button>
          <button class="btn btn-accent" type="button" @click="recipeForm.open()"><BaseIcon name="plus" /> Новый рецепт</button>
        </template>
      </ProfileHeader>

      <section class="container py-3">
        <div class="nav nav-pills profile-tabs" role="tablist" aria-label="Разделы кабинета">
          <button
            v-for="tab in TABS"
            :id="`tab-${tab.key}`"
            :key="tab.key"
            class="nav-link"
            :class="{ active: activeTab === tab.key }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            :aria-controls="`panel-${tab.key}`"
            :tabindex="activeTab === tab.key ? 0 : -1"
            @click="activeTab = tab.key"
            @keydown.right.prevent="moveTab(1)"
            @keydown.left.prevent="moveTab(-1)"
          >
            {{ tab.label }} <span class="badge rounded-pill">{{ tabCounts[tab.key] }}</span>
          </button>
        </div>

        <div
          v-for="tab in TABS"
          v-show="activeTab === tab.key"
          :id="`panel-${tab.key}`"
          :key="tab.key"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.key}`"
        >
          <h2 class="visually-hidden">{{ tab.heading }}</h2>

          <RecipeGrid v-if="tab.key === 'mine'" :recipes="mine" :saved-ids="saved" editable @toggle-save="toggleSave" @edit="recipeForm.open($event)" @delete="askDelete">
            <template #after>
              <div class="col">
                <button class="add-card w-100" type="button" @click="recipeForm.open()"><BaseIcon name="plus" /> Добавить рецепт</button>
              </div>
            </template>
          </RecipeGrid>

          <template v-if="tab.key === 'saved'">
            <RecipeGrid v-if="savedRecipes.length" :recipes="savedRecipes" :saved-ids="saved" @toggle-save="toggleSave" />
            <EmptyState v-else>Сохраняйте рецепты кнопкой с закладкой, и они появятся здесь.</EmptyState>
          </template>

          <template v-if="tab.key === 'following'">
            <div v-if="following.length" class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="item in following" :key="item.subscription.id" class="col">
                <CookCard :user="item.author">
                  <button class="btn btn-soft btn-sm" type="button" :aria-label="`Отписаться от ${item.author.name}`" @click="unsubscribe(item.subscription)">
                    Отписаться
                  </button>
                </CookCard>
              </div>
            </div>
            <EmptyState v-else>
              Вы пока ни на кого не подписаны. <RouterLink :to="{ name: 'cooks' }">Найти кулинаров</RouterLink>
            </EmptyState>
          </template>
        </div>
      </section>
    </template>

    <RecipeFormModal ref="recipeForm" @saved="onRecipeSaved" />

    <BaseModal ref="deleteModal" title="Удалить рецепт?" size="sm" centered>
      <div class="modal-body">
        <p class="mb-0">«{{ toDelete?.title }}» пропадёт вместе с комментариями и лайками.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-soft" type="button" data-bs-dismiss="modal">Отмена</button>
        <button class="btn btn-accent" type="button" @click="confirmDelete">Удалить</button>
      </div>
    </BaseModal>

    <BaseModal ref="profileModal" title="Редактировать профиль">
      <form :class="{ 'was-validated': profileValidated }" novalidate @submit.prevent="saveProfile">
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label" for="profileName">Имя и фамилия</label>
            <input id="profileName" v-model="profile.name" class="form-control" type="text" autocomplete="name" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="profileCity">Город</label>
            <input id="profileCity" v-model="profile.city" class="form-control" type="text" autocomplete="address-level2">
          </div>
          <div>
            <label class="form-label" for="profileBio">О себе</label>
            <textarea id="profileBio" v-model="profile.bio" class="form-control" rows="3" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-soft" type="button" data-bs-dismiss="modal">Отмена</button>
          <button class="btn btn-accent" type="submit">Сохранить</button>
        </div>
      </form>
    </BaseModal>
  </BaseLayout>
</template>
