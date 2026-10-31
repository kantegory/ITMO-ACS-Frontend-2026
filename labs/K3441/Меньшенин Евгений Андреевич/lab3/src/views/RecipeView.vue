<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { api } from "../services/api.js";
import { useApiState } from "../composables/useApiState.js";
import { useFavorites } from "../composables/useFavorites.js";
import { useAuth } from "../composables/useAuth.js";
import ApiState from "../components/ApiState.vue";

const props = defineProps({ id: String });
const emit = defineEmits(["notify"]);
const recipe = ref(null);
const comments = ref([]);
const author = ref(null);
const authorRecipeCount = ref(0);
const follow = ref(null);
const text = ref("");
const sending = ref(false);
const showShare = ref(false);
const { user } = useAuth();
const { loading, error, run } = useApiState();
const { load: loadFavorites, toggle, isFavorite } = useFavorites();

const authorId = computed(() =>
  String(recipe.value?.authorId || recipe.value?.userId || ""),
);
const authorName = computed(() =>
  author.value
    ? `${author.value.name} ${author.value.surname}`
    : "Автор Ложки",
);
const authorInitials = computed(() =>
  authorName.value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2),
);
const ownRecipe = computed(
  () => user.value && String(user.value.id) === authorId.value,
);
const shareUrl = computed(() => window.location.href);

async function load() {
  try {
    await run(async () => {
      const { data: recipeData } = await api.get(`/recipes/${props.id}`);
      recipe.value = recipeData;
      const id = String(recipeData.authorId || recipeData.userId || "");
      const [commentResponse, , authorResponse, recipesResponse] =
        await Promise.all([
          api.get("/comments", {
            params: {
              recipeId: props.id,
              _sort: "createdAt",
              _order: "desc",
            },
          }),
          loadFavorites(),
          id ? api.get(`/users/${id}`).catch(() => ({ data: null })) : null,
          id ? api.get("/recipes", { params: { authorId: id } }) : null,
        ]);
      comments.value = commentResponse.data;
      author.value = authorResponse?.data || null;
      authorRecipeCount.value = recipesResponse?.data.length || 0;
      follow.value = null;
      if (user.value && id && String(user.value.id) !== id) {
        const { data } = await api.get("/follows", {
          params: { userId: user.value.id, authorId: id },
        });
        follow.value = data[0] || null;
      }
    });
  } catch {}
}

async function toggleFavorite() {
  try {
    await toggle(props.id);
    emit(
      "notify",
      isFavorite(props.id) ? "Рецепт сохранён" : "Рецепт удалён из сохранённых",
    );
  } catch (errorValue) {
    emit("notify", errorValue.message);
  }
}

async function toggleFollow() {
  if (!user.value) return emit("notify", "Войдите, чтобы подписаться");
  try {
    if (follow.value) {
      await api.delete(`/follows/${follow.value.id}`);
      follow.value = null;
      emit("notify", "Подписка отменена");
    } else {
      const { data } = await api.post("/follows", {
        userId: String(user.value.id),
        authorId: authorId.value,
      });
      follow.value = data;
      emit("notify", "Автор добавлен в подписки");
    }
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  }
}

async function addComment() {
  if (!user.value) return emit("notify", "Войдите, чтобы оставить комментарий");
  if (!text.value.trim()) return;
  sending.value = true;
  try {
    const { data } = await api.post("/comments", {
      recipeId: String(props.id),
      userId: String(user.value.id),
      author: `${user.value.name} ${user.value.surname}`,
      text: text.value.trim(),
      createdAt: new Date().toISOString(),
    });
    comments.value.unshift(data);
    text.value = "";
    emit("notify", "Комментарий опубликован");
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  } finally {
    sending.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    emit("notify", "Ссылка скопирована");
  } catch {
    emit("notify", "Не удалось скопировать ссылку");
  }
}

const cleanStep = (step) => step.replace(/^\d+[.)]\s*/, "");
onMounted(load);
watch(() => props.id, load);
</script>

<template>
  <section class="section-pad">
    <div class="container">
      <ApiState v-if="loading" message="Загружаем рецепт…" />
      <ApiState
        v-else-if="error"
        kind="error"
        :message="error"
        @retry="load"
      />
      <template v-else-if="recipe">
        <nav class="breadcrumbs" aria-label="Хлебные крошки">
          <RouterLink to="/">Главная</RouterLink><span>/</span>
          <RouterLink to="/recipes">Рецепты</RouterLink><span>/</span>
          <span>{{ recipe.shortTitle || recipe.title }}</span>
        </nav>
        <div class="recipe-intro">
          <div :class="['recipe-visual', 'recipe-photo', recipe.visual]">
            <span class="food-emoji">{{ recipe.emoji }}</span>
          </div>
          <div>
            <span class="eyebrow">
              {{ recipe.typeLabel }} · {{ recipe.cuisine }}
            </span>
            <h1 class="display-title compact">{{ recipe.title }}</h1>
            <p class="lead">{{ recipe.description }}</p>
            <div class="facts">
              <div>
                <small>Подготовка</small>
                <strong>{{ recipe.prepTime }} минут</strong>
              </div>
              <div>
                <small>Готовка</small>
                <strong>{{ recipe.cookTime }} минут</strong>
              </div>
              <div>
                <small>Порции</small><strong>{{ recipe.servings }}</strong>
              </div>
              <div>
                <small>Сложность</small>
                <strong>{{ recipe.difficultyLabel }}</strong>
              </div>
              <div>
                <small>Рейтинг</small>
                <strong class="rating">
                  ★ {{ String(recipe.rating).replace(".", ",") }}
                </strong>
              </div>
            </div>
            <div class="action-row">
              <button
                :class="['button', isFavorite(recipe.id) ? 'primary' : 'outline']"
                type="button"
                @click="toggleFavorite"
              >
                {{ isFavorite(recipe.id) ? "♥ Сохранено" : "♡ Сохранить" }}
              </button>
              <button
                class="button outline"
                type="button"
                @click="showShare = true"
              >
                ↗ Поделиться
              </button>
            </div>
            <div class="recipe-author">
              <div class="avatar">{{ authorInitials }}</div>
              <div class="author-copy">
                <strong>{{ authorName }}</strong>
                <small class="muted">
                  Автор {{ authorRecipeCount }} рецептов
                </small>
              </div>
              <span v-if="ownRecipe" class="tag-pill">Это вы</span>
              <button
                v-else
                :class="['button', 'small', follow ? 'primary' : 'outline']"
                type="button"
                @click="toggleFollow"
              >
                {{ follow ? "Вы подписаны" : "Подписаться" }}
              </button>
            </div>
          </div>
        </div>
        <div class="recipe-content">
          <div>
            <h2>Ингредиенты</h2>
            <ul class="lined-list">
              <li v-for="item in recipe.ingredients" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <h2>Как готовить</h2>
            <ol class="steps">
              <li v-for="step in recipe.steps" :key="step">
                {{ cleanStep(step) }}
              </li>
            </ol>
          </div>
        </div>
        <section class="comments">
          <h2>
            Комментарии <span class="muted">{{ comments.length }}</span>
          </h2>
          <form class="paper-card comment-form" @submit.prevent="addComment">
            <label for="comment">Ваш комментарий</label>
            <textarea id="comment" v-model="text" rows="3" required></textarea>
            <button class="button primary" :disabled="sending">
              {{ sending ? "Публикуем…" : "Опубликовать" }}
            </button>
          </form>
          <ApiState
            v-if="!comments.length"
            kind="empty"
            message="Комментариев пока нет. Будьте первым!"
          />
          <article v-for="comment in comments" :key="comment.id" class="comment">
            <div class="avatar">
              {{
                comment.author
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
              }}
            </div>
            <div>
              <strong>{{ comment.author }}</strong>
              <small class="muted">
                {{ new Date(comment.createdAt).toLocaleDateString("ru-RU") }}
              </small>
              <p>{{ comment.text }}</p>
            </div>
          </article>
        </section>
      </template>
    </div>
  </section>

  <div v-if="showShare" class="modal-backdrop" @click.self="showShare = false">
    <section
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareTitle"
    >
      <div class="modal-header">
        <h2 id="shareTitle">Поделиться рецептом</h2>
        <button
          class="close-button"
          type="button"
          aria-label="Закрыть"
          @click="showShare = false"
        >
          ×
        </button>
      </div>
      <div class="copy-row">
        <input :value="shareUrl" readonly />
        <button class="button dark" type="button" @click="copyLink">
          Копировать
        </button>
      </div>
    </section>
  </div>
</template>
