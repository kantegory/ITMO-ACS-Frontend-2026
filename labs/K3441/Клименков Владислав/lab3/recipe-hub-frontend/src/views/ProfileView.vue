<script setup>
/**
 * ProfileView.vue — личный кабинет пользователя.
 *
 * Публикации, сохранённые рецепты и подписки загружаются из API.
 * Создание рецепта и редактирование профиля вынесены в модальные компоненты.
 */

import { computed, onMounted, ref } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';
import RecipeGrid from '@/components/RecipeGrid.vue';
import AuthorCard from '@/components/AuthorCard.vue';
import NewRecipeModal from '@/components/profile/NewRecipeModal.vue';
import EditProfileModal from '@/components/profile/EditProfileModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';
import { recipes as recipesApi } from '@/api/resources';

const auth = useAuthStore();
const catalog = useCatalogStore();

const published = ref([]);
const publishedLoading = ref(true);
const publishedError = ref(null);

const saved = ref([]);
const savedLoading = ref(true);
const savedError = ref(null);

const subscriptionsLoading = ref(true);
const subscriptionsError = ref(null);

const newRecipeModal = ref(null);
const editProfileModal = ref(null);

const subscribedAuthors = computed(() => {
  const ids = catalog.subscriptions.map((item) => String(item.authorId));
  return catalog.users.filter((user) =>
    ids.includes(String(user.id)),
  );
});

async function loadPublished() {
  if (!auth.user) return;

  publishedLoading.value = true;
  publishedError.value = null;

  try {
    published.value = await recipesApi.list({
      userId: auth.user.id,
      _sort: 'createdAt',
      _order: 'desc',
    });
  } catch (error) {
    publishedError.value = error;
  } finally {
    publishedLoading.value = false;
  }
}

async function loadSaved() {
  savedLoading.value = true;
  savedError.value = null;

  try {
    const ids = catalog.bookmarks
      .map((bookmark) => bookmark.recipeId)
      .filter((id) => id !== undefined && id !== null);

    saved.value = ids.length
      ? await recipesApi.list({ id: ids })
      : [];
  } catch (error) {
    savedError.value = error;
  } finally {
    savedLoading.value = false;
  }
}

async function loadSubscriptions() {
  subscriptionsLoading.value = true;
  subscriptionsError.value = null;

  try {
    await catalog.loadUsers();
  } catch (error) {
    subscriptionsError.value = error;
  } finally {
    subscriptionsLoading.value = false;
  }
}

function onRecipeCreated(created) {
  published.value = [created, ...published.value];
}

function messageOf(error) {
  return error?.message || 'Произошла ошибка. Попробуйте ещё раз.';
}

onMounted(() => {
  if (!auth.user) return;
  loadPublished();
  loadSaved();
  loadSubscriptions();
});
</script>

<template>
  <main id="main-content" class="rh-page py-4 py-lg-5" tabindex="-1">
    <div class="container">
      <h1 class="h3 mb-3">Личный кабинет</h1>

      <div v-if="!auth.user" class="alert alert-warning" role="status">
        Загрузка профиля…
      </div>

      <template v-else>
        <!-- Шапка профиля -->
        <div class="card shadow-sm mb-4">
          <div
            class="card-body d-flex flex-wrap align-items-center gap-3"
          >
            <div
              class="rh-placeholder rounded-circle"
              style="width: 4.5rem; height: 4.5rem"
              aria-hidden="true"
            >
              <BaseIcon name="user" class="fs-2" />
            </div>

            <div class="flex-grow-1">
              <h2 class="h4 mb-1">{{ auth.user.name }}</h2>
              <p class="text-muted mb-1">{{ auth.user.email }}</p>
              <p class="mb-0">
                {{ auth.user.bio || 'Расскажите о себе в настройках профиля.' }}
              </p>
            </div>

            <div class="d-flex gap-2">
              <button
                class="btn btn-rh-primary"
                type="button"
                aria-haspopup="dialog"
                @click="newRecipeModal?.open()"
              >
                <BaseIcon name="plus" class="me-1" />Новый рецепт
              </button>
              <button
                class="btn btn-outline-secondary"
                type="button"
                aria-haspopup="dialog"
                @click="editProfileModal?.open(auth.user)"
              >
                <BaseIcon name="edit" class="me-1" />Редактировать
              </button>
            </div>
          </div>
        </div>

        <!-- Разделы кабинета -->
        <ul
          class="nav nav-tabs mb-4"
          id="profileTabs"
          role="tablist"
          aria-label="Разделы личного кабинета"
        >
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="tab-published"
              data-bs-toggle="tab"
              data-bs-target="#pane-published"
              type="button"
              role="tab"
              aria-controls="pane-published"
              aria-selected="true"
            >
              Мои публикации
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="tab-saved"
              data-bs-toggle="tab"
              data-bs-target="#pane-saved"
              type="button"
              role="tab"
              aria-controls="pane-saved"
              aria-selected="false"
            >
              Сохранённые
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="tab-subscriptions"
              data-bs-toggle="tab"
              data-bs-target="#pane-subscriptions"
              type="button"
              role="tab"
              aria-controls="pane-subscriptions"
              aria-selected="false"
            >
              Подписки
            </button>
          </li>
        </ul>

        <div class="tab-content">
          <div
            class="tab-pane fade show active"
            id="pane-published"
            role="tabpanel"
            aria-labelledby="tab-published"
            tabindex="0"
          >
            <h2 class="visually-hidden">Мои публикации</h2>
            <RecipeGrid
              :recipes="published"
              :loading="publishedLoading"
              :error="publishedError"
              empty-text="Вы пока не опубликовали ни одного рецепта."
              row-class="row-cols-1 row-cols-md-2 row-cols-xl-3 g-4"
            />
          </div>

          <div
            class="tab-pane fade"
            id="pane-saved"
            role="tabpanel"
            aria-labelledby="tab-saved"
            tabindex="0"
          >
            <h2 class="visually-hidden">Сохранённые рецепты</h2>
            <RecipeGrid
              :recipes="saved"
              :loading="savedLoading"
              :error="savedError"
              empty-text="Вы пока не сохранили ни одного рецепта."
              row-class="row-cols-1 row-cols-md-2 row-cols-xl-3 g-4"
            />
          </div>


          <div
            class="tab-pane fade"
            id="pane-subscriptions"
            role="tabpanel"
            aria-labelledby="tab-subscriptions"
            tabindex="0"
          >
            <h2 class="visually-hidden">Подписки на кулинаров</h2>

            <div
              v-if="subscriptionsLoading"
              class="alert alert-light border"
              role="status"
            >
              Загрузка подписок…
            </div>

            <div
              v-else-if="subscriptionsError"
              class="alert alert-danger"
              role="alert"
            >
              {{ messageOf(subscriptionsError) }}
            </div>

            <div
              v-else-if="!subscribedAuthors.length"
              class="alert alert-light border text-center"
              role="status"
            >
              Вы пока ни на кого не подписаны. Найдите кулинаров на
              <RouterLink to="/search">странице поиска</RouterLink>.
            </div>

            <div v-else class="row row-cols-1 row-cols-md-3 g-4">
              <div
                v-for="author in subscribedAuthors"
                :key="author.id"
                class="col"
              >
                <AuthorCard :author="author" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>

  <NewRecipeModal
    ref="newRecipeModal"
    @created="onRecipeCreated"
  />
  <EditProfileModal ref="editProfileModal" />
</template>

