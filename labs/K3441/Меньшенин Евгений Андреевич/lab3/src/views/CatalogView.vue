<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../services/api.js";
import { useApiState } from "../composables/useApiState.js";
import { useFavorites } from "../composables/useFavorites.js";
import RecipeGrid from "../components/RecipeGrid.vue";
import ApiState from "../components/ApiState.vue";

const emit = defineEmits(["notify"]);
const route = useRoute();
const recipes = ref([]);
const filters = reactive({
  q: route.query.q || "",
  type: route.query.type || "",
  difficulty: "",
  time: route.query.time || "",
});
const { loading, error, run } = useApiState();
const { load: loadFavorites, toggle, isFavorite } = useFavorites();
const filtered = computed(() =>
  recipes.value.filter((recipe) => {
    const text =
      `${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase();
    return (
      (!filters.q || text.includes(filters.q.toLowerCase())) &&
      (!filters.type || recipe.type === filters.type) &&
      (!filters.difficulty || recipe.difficulty === filters.difficulty) &&
      (!filters.time || recipe.time <= Number(filters.time))
    );
  }),
);
async function load() {
  try {
    await run(async () => {
      const [{ data }] = await Promise.all([
        api.get("/recipes"),
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
function reset() {
  Object.assign(filters, { q: "", type: "", difficulty: "", time: "" });
}
onMounted(load);
</script>
<template>
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">Каталог рецептов</span>
      <h1 class="section-title">Найдите свой новый любимый рецепт</h1>
      <p class="lead">
        Ищите по названию и ингредиентам, выбирайте тип блюда, сложность и
        время.
      </p>
    </div>
  </section>
  <section class="section-pad">
    <div class="container catalog-layout">
      <aside class="paper-card filters">
        <h2>Фильтры</h2>
        <label
          >Поиск<input
            v-model.trim="filters.q"
            placeholder="Название или ингредиент" /></label
        ><label
          >Тип блюда<select v-model="filters.type">
            <option value="">Все</option>
            <option value="breakfast">Завтраки</option>
            <option value="main">Основные блюда</option>
            <option value="dessert">Десерты</option>
          </select></label
        ><label
          >Сложность<select v-model="filters.difficulty">
            <option value="">Любая</option>
            <option value="easy">Легко</option>
            <option value="medium">Средне</option>
          </select></label
        ><label
          >Время<select v-model="filters.time">
            <option value="">Любое</option>
            <option value="20">До 20 минут</option>
            <option value="40">До 40 минут</option>
          </select></label
        ><button class="button outline" type="button" @click="reset">
          Сбросить
        </button>
      </aside>
      <div>
        <div class="result-line">
          <strong>{{ filtered.length }} рецептов</strong>
        </div>
        <ApiState v-if="loading" message="Загружаем каталог…" /><ApiState
          v-else-if="error"
          kind="error"
          :message="error"
          @retry="load"
        /><ApiState
          v-else-if="!filtered.length"
          kind="empty"
          message="По вашему запросу ничего не найдено."
        /><RecipeGrid
          v-else
          :recipes="filtered"
          :is-favorite="isFavorite"
          @toggle-favorite="toggleFavorite"
        />
      </div>
    </div>
  </section>
</template>
