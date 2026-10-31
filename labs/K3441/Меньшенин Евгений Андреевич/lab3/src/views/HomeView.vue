<script setup>
import { onMounted, ref } from "vue";
import { api } from "../services/api.js";
import { useApiState } from "../composables/useApiState.js";
import { useFavorites } from "../composables/useFavorites.js";
import RecipeGrid from "../components/RecipeGrid.vue";
import ApiState from "../components/ApiState.vue";

const emit = defineEmits(["notify"]);
const recipes = ref([]);
const { loading, error, run } = useApiState();
const { load: loadFavorites, toggle, isFavorite } = useFavorites();
async function load() {
  try {
    await run(async () => {
      const [{ data }] = await Promise.all([
        api.get("/recipes", { params: { featured: true } }),
        loadFavorites(),
      ]);
      recipes.value = data;
    });
  } catch {}
}
async function toggleFavorite(id) {
  try {
    await toggle(id);
    emit(
      "notify",
      isFavorite(id) ? "Рецепт сохранён" : "Рецепт удалён из сохранённых",
    );
  } catch (e) {
    emit("notify", e.message);
  }
}
onMounted(load);
</script>
<template>
  <section class="hero">
    <div class="container hero-copy">
      <span class="eyebrow">✦ Вкус начинается здесь</span>
      <h1 class="display-title">
        Готовьте.<br />Делитесь.<br /><em>Вдохновляйте.</em>
      </h1>
      <p class="lead">
        Проверенные рецепты на каждый день, а любимые идеи всегда под рукой в
        вашей личной коллекции.
      </p>
      <form
        class="search-shell"
        @submit.prevent="
          $router.push({ name: 'catalog', query: { q: $event.target.q.value } })
        "
      >
        <input
          name="q"
          aria-label="Поиск рецептов"
          placeholder="Что приготовить сегодня?"
        /><button class="button dark">Найти</button>
      </form>
    </div>
  </section>
  <section class="section-pad">
    <div class="container">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Выбор редакции</span>
          <h2 class="section-title">Попробуйте сегодня</h2>
        </div>
        <RouterLink class="button outline" to="/recipes">Все рецепты →</RouterLink>
      </div>
      <ApiState v-if="loading" message="Загружаем рецепты…" /><ApiState
        v-else-if="error"
        kind="error"
        :message="error"
        @retry="load"
      /><RecipeGrid
        v-else
        :recipes="recipes"
        :is-favorite="isFavorite"
        @toggle-favorite="toggleFavorite"
      />
    </div>
  </section>
  <section class="section-pad soft-section">
    <div class="container community-promo">
      <div>
        <span class="eyebrow">Ваши люди уже здесь</span>
        <h2 class="section-title">Не просто сборник рецептов</h2>
        <p class="lead">
          Публикуйте открытия, сохраняйте идеи, общайтесь с авторами и
          собирайте собственную кулинарную книгу.
        </p>
        <RouterLink class="button primary" to="/community">
          Войти в сообщество
        </RouterLink>
      </div>
      <div class="promo-stats">
        <div class="paper-card promo-stat">
          <strong>48 тыс.</strong><span class="muted">домашних кулинаров</span>
        </div>
        <div class="paper-card promo-stat">
          <strong>1,2 млн</strong><span class="muted">сохранений</span>
        </div>
        <div class="paper-card promo-quote">
          <div class="avatar">АК</div>
          <div>
            <strong>«Здесь я наконец перестала бояться теста»</strong>
            <small class="muted">Анна Котова · автор недели</small>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
