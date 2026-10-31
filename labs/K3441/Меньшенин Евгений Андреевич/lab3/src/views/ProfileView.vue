<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "../services/api.js";
import { useAuth } from "../composables/useAuth.js";
import { useFavorites } from "../composables/useFavorites.js";
import { useApiState } from "../composables/useApiState.js";
import RecipeGrid from "../components/RecipeGrid.vue";
import ApiState from "../components/ApiState.vue";

const emit = defineEmits(["notify"]);
const { user, updateUser } = useAuth();
const { favorites, load: loadFavorites, toggle, isFavorite } = useFavorites();
const { loading, error, run } = useApiState();
const savedRecipes = ref([]);
const ownRecipes = ref([]);
const followerCount = ref(0);
const followingCount = ref(0);
const activeTab = ref("saved");
const showEdit = ref(false);
const showCreate = ref(false);
const savingProfile = ref(false);
const creatingRecipe = ref(false);
const editForm = reactive({ name: "", surname: "", city: "", bio: "" });
const recipeForm = reactive({
  title: "",
  description: "",
  ingredients: "",
  steps: "",
});

const initials = computed(() =>
  `${user.value.name[0]}${user.value.surname[0]}`.toUpperCase(),
);

function prepareEdit() {
  Object.assign(editForm, {
    name: user.value.name,
    surname: user.value.surname,
    city: user.value.city || "",
    bio: user.value.bio || "",
  });
  showEdit.value = true;
}

async function load() {
  try {
    await run(async () => {
      await loadFavorites();
      const [publications, followers, following, ...savedResponses] =
        await Promise.all([
          api.get("/recipes", { params: { authorId: user.value.id } }),
          api.get("/follows", { params: { authorId: user.value.id } }),
          api.get("/follows", { params: { userId: user.value.id } }),
          ...favorites.value.map((item) =>
            api.get(`/recipes/${item.recipeId}`),
          ),
        ]);
      ownRecipes.value = publications.data;
      followerCount.value = followers.data.length;
      followingCount.value = following.data.length;
      savedRecipes.value = savedResponses.map((item) => item.data);
    });
  } catch {}
}

async function toggleFavorite(id) {
  try {
    await toggle(id);
    savedRecipes.value = savedRecipes.value.filter(
      (recipe) => String(recipe.id) !== String(id),
    );
    emit("notify", "Рецепт удалён из сохранённых");
  } catch (errorValue) {
    emit("notify", errorValue.message);
  }
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    const { data } = await api.patch(`/users/${user.value.id}`, editForm);
    updateUser(data);
    showEdit.value = false;
    emit("notify", "Профиль обновлён");
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  } finally {
    savingProfile.value = false;
  }
}

const lines = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

async function createRecipe() {
  creatingRecipe.value = true;
  try {
    const { data } = await api.post("/recipes", {
      title: recipeForm.title.trim(),
      shortTitle: recipeForm.title.trim(),
      description: recipeForm.description.trim(),
      ingredients: lines(recipeForm.ingredients),
      steps: lines(recipeForm.steps),
      authorId: String(user.value.id),
      userId: String(user.value.id),
      type: "main",
      typeLabel: "Авторский рецепт",
      cuisine: "Домашняя кухня",
      difficulty: "medium",
      difficultyLabel: "Средняя",
      time: 45,
      prepTime: 15,
      cookTime: 30,
      servings: "2 персоны",
      rating: 5,
      visual: "visual-1",
      emoji: "🍽️",
      featured: false,
    });
    ownRecipes.value.unshift(data);
    Object.assign(recipeForm, {
      title: "",
      description: "",
      ingredients: "",
      steps: "",
    });
    showCreate.value = false;
    activeTab.value = "mine";
    emit("notify", "Рецепт опубликован");
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  } finally {
    creatingRecipe.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="profile-cover" aria-hidden="true"></section>
  <section class="container profile-layout">
    <aside class="paper-card profile-card">
      <div class="avatar large">{{ initials }}</div>
      <h1>{{ user.name }} {{ user.surname }}</h1>
      <p class="muted profile-meta">
        @{{ user.username || user.email.split("@")[0] }} ·
        {{ user.city || "Город не указан" }}
      </p>
      <p>{{ user.bio || "Описание пока не заполнено." }}</p>
      <button class="button outline wide" type="button" @click="prepareEdit">
        ✎ Редактировать профиль
      </button>
      <div class="profile-stats">
        <div><strong>{{ ownRecipes.length }}</strong><span>рецептов</span></div>
        <div><strong>{{ followerCount }}</strong><span>читателей</span></div>
        <div><strong>{{ followingCount }}</strong><span>подписок</span></div>
      </div>
    </aside>

    <div class="profile-content">
      <div class="section-heading profile-heading">
        <div>
          <span class="eyebrow">Личная коллекция</span>
          <h2 class="section-title">Моя кухня</h2>
        </div>
        <button class="button primary" type="button" @click="showCreate = true">
          ＋ Новый рецепт
        </button>
      </div>
      <div class="profile-tabs" role="tablist">
        <button
          :class="{ active: activeTab === 'saved' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'saved'"
          @click="activeTab = 'saved'"
        >
          Сохранённые
        </button>
        <button
          :class="{ active: activeTab === 'mine' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'mine'"
          @click="activeTab = 'mine'"
        >
          Мои публикации
        </button>
        <button
          :class="{ active: activeTab === 'drafts' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'drafts'"
          @click="activeTab = 'drafts'"
        >
          Черновики
        </button>
      </div>

      <ApiState v-if="loading" message="Загружаем вашу кухню…" />
      <ApiState
        v-else-if="error"
        kind="error"
        :message="error"
        @retry="load"
      />
      <template v-else>
        <template v-if="activeTab === 'saved'">
          <ApiState
            v-if="!savedRecipes.length"
            kind="empty"
            message="Сохранённых рецептов пока нет."
          />
          <RecipeGrid
            v-else
            :recipes="savedRecipes"
            :is-favorite="isFavorite"
            @toggle-favorite="toggleFavorite"
          />
        </template>
        <template v-else-if="activeTab === 'mine'">
          <ApiState
            v-if="!ownRecipes.length"
            kind="empty"
            message="Опубликуйте первый рецепт — он появится здесь."
          />
          <RecipeGrid
            v-else
            :recipes="ownRecipes"
            :is-favorite="isFavorite"
            @toggle-favorite="toggleFavorite"
          />
        </template>
        <div v-else class="paper-card empty-panel">
          <h3>Черновиков пока нет</h3>
          <p class="muted">
            Начните новый рецепт и опубликуйте его, когда будете готовы.
          </p>
        </div>
      </template>
    </div>
  </section>

  <div v-if="showEdit" class="modal-backdrop" @click.self="showEdit = false">
    <form class="modal-card" @submit.prevent="saveProfile">
      <div class="modal-header">
        <h2>Редактировать профиль</h2>
        <button class="close-button" type="button" aria-label="Закрыть" @click="showEdit = false">×</button>
      </div>
      <div class="form-grid">
        <label>Имя<input v-model.trim="editForm.name" required /></label>
        <label>Фамилия<input v-model.trim="editForm.surname" required /></label>
      </div>
      <label>Город<input v-model.trim="editForm.city" /></label>
      <label>О себе<textarea v-model.trim="editForm.bio" rows="4" required></textarea></label>
      <div class="modal-actions">
        <button class="button outline" type="button" @click="showEdit = false">Отмена</button>
        <button class="button primary" :disabled="savingProfile">Сохранить</button>
      </div>
    </form>
  </div>

  <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
    <form class="modal-card modal-wide" @submit.prevent="createRecipe">
      <div class="modal-header">
        <h2>Новый рецепт</h2>
        <button class="close-button" type="button" aria-label="Закрыть" @click="showCreate = false">×</button>
      </div>
      <label>Название<input v-model.trim="recipeForm.title" required /></label>
      <label>Описание<textarea v-model.trim="recipeForm.description" rows="3" required></textarea></label>
      <div class="form-grid">
        <label>
          Ингредиенты — по одному в строке
          <textarea v-model="recipeForm.ingredients" rows="6" required></textarea>
        </label>
        <label>
          Шаги — по одному в строке
          <textarea v-model="recipeForm.steps" rows="6" required></textarea>
        </label>
      </div>
      <div class="modal-actions">
        <button class="button outline" type="button" @click="showCreate = false">Отмена</button>
        <button class="button primary" :disabled="creatingRecipe">Опубликовать</button>
      </div>
    </form>
  </div>
</template>
