<script setup>
import { onMounted, ref } from "vue";
import { api } from "../services/api.js";
import { useAuth } from "../composables/useAuth.js";

const emit = defineEmits(["notify"]);
const { user } = useAuth();
const follows = ref([]);
const showPublication = ref(false);
const publicationText = ref("");
const liked = ref(new Set());
const saved = ref(new Set());
const userPosts = ref([]);

const posts = [
  {
    id: "anna",
    authorId: "2",
    name: "Анна Котова",
    initials: "АК",
    time: "2 часа назад",
    text: "Поймала последние летние томаты и собрала яркий обед. Секрет — щепотка копчёной паприки в заправке.",
    visual: "visual-1",
    emoji: "🥗",
    likes: 248,
    comments: 31,
  },
  {
    id: "maxim",
    authorId: "3",
    name: "Максим Серов",
    initials: "МС",
    time: "вчера",
    text: "Проверил три способа сделать хрустящую корочку у домашнего хлеба. Победил пар в первые 15 минут выпечки.",
    visual: "visual-4",
    emoji: "🥖",
    likes: 184,
    comments: 22,
  },
];

const weeklyAuthors = [
  { id: "4", name: "Елена Соколова", initials: "ЕС", role: "Выпечка · 42k" },
  { id: "5", name: "Денис Романов", initials: "ДР", role: "Азия · 31k" },
  { id: "6", name: "Ирина Волкова", initials: "ИВ", role: "Веган · 28k" },
];

onMounted(async () => {
  if (!user.value) return;
  try {
    follows.value = (
      await api.get("/follows", { params: { userId: user.value.id } })
    ).data;
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  }
});

const followed = (id) =>
  follows.value.some((item) => String(item.authorId) === String(id));

async function toggleFollow(authorId) {
  if (!user.value) return emit("notify", "Войдите, чтобы подписаться");
  try {
    const item = follows.value.find(
      (value) => String(value.authorId) === String(authorId),
    );
    if (item) {
      await api.delete(`/follows/${item.id}`);
      follows.value = follows.value.filter((value) => value.id !== item.id);
      emit("notify", "Подписка отменена");
    } else {
      const { data } = await api.post("/follows", {
        userId: String(user.value.id),
        authorId: String(authorId),
      });
      follows.value.push(data);
      emit("notify", "Автор добавлен в подписки");
    }
  } catch (errorValue) {
    emit("notify", errorValue.userMessage || errorValue.message);
  }
}

function toggleLike(post) {
  if (liked.value.has(post.id)) {
    liked.value.delete(post.id);
    emit("notify", "Отметка снята");
  } else {
    liked.value.add(post.id);
    emit("notify", "Публикация понравилась");
  }
}

function toggleSave(post) {
  if (saved.value.has(post.id)) {
    saved.value.delete(post.id);
    emit("notify", "Публикация удалена из сохранённых");
  } else {
    saved.value.add(post.id);
    emit("notify", "Публикация сохранена");
  }
}

function openPublication() {
  if (!user.value) return emit("notify", "Войдите, чтобы создать публикацию");
  showPublication.value = true;
}

function publish() {
  const value = publicationText.value.trim();
  if (!value) return;
  userPosts.value.unshift({
    id: Date.now(),
    name: `${user.value.name} ${user.value.surname}`,
    initials: `${user.value.name[0]}${user.value.surname[0]}`.toUpperCase(),
    text: value,
  });
  publicationText.value = "";
  showPublication.value = false;
  emit("notify", "Публикация добавлена в ленту");
}
</script>

<template>
  <section class="page-hero community-hero">
    <div class="container hero-centered">
      <span class="eyebrow">Люди и истории</span>
      <h1 class="display-title compact">Готовить вместе вкуснее</h1>
      <p class="lead">
        Подписывайтесь на любимых авторов и находите новые идеи каждый день.
      </p>
    </div>
  </section>
  <section class="section-pad">
    <div class="container community-layout">
      <div>
        <div class="section-heading">
          <div>
            <span class="eyebrow">Свежие публикации</span>
            <h2 class="section-title">Лента сообщества</h2>
          </div>
          <button class="button primary" type="button" @click="openPublication">
            ＋ Публикация
          </button>
        </div>

        <article v-for="post in userPosts" :key="post.id" class="paper-card post-card">
          <div class="post-author">
            <div class="avatar">{{ post.initials }}</div>
            <div><strong>{{ post.name }}</strong><small class="muted">только что</small></div>
          </div>
          <p>{{ post.text }}</p>
        </article>

        <article v-for="post in posts" :key="post.id" class="paper-card post-card">
          <div class="post-author">
            <div class="avatar">{{ post.initials }}</div>
            <div class="author-copy">
              <strong>{{ post.name }}</strong><small class="muted">{{ post.time }}</small>
            </div>
            <button
              :class="['button', 'small', followed(post.authorId) ? 'primary' : 'outline']"
              type="button"
              @click="toggleFollow(post.authorId)"
            >
              {{ followed(post.authorId) ? "Вы подписаны" : "Подписаться" }}
            </button>
          </div>
          <p>{{ post.text }}</p>
          <div :class="['recipe-visual', post.visual, 'post-visual']">
            <span class="food-emoji">{{ post.emoji }}</span>
          </div>
          <div class="post-actions">
            <button
              :class="{ active: liked.has(post.id) }"
              type="button"
              @click="toggleLike(post)"
            >
              {{ liked.has(post.id) ? "♥" : "♡" }}
              {{ post.likes + (liked.has(post.id) ? 1 : 0) }}
            </button>
            <button type="button" @click="$emit('notify', 'Обсуждение публикации скоро откроется')">
              ◯ {{ post.comments }}
            </button>
            <button
              :class="{ active: saved.has(post.id) }"
              type="button"
              @click="toggleSave(post)"
            >
              {{ saved.has(post.id) ? "▣ Сохранено" : "▢ Сохранить" }}
            </button>
          </div>
        </article>
      </div>

      <aside>
        <section class="paper-card aside-card">
          <h2>Авторы недели</h2>
          <div class="weekly-authors">
            <div v-for="authorItem in weeklyAuthors" :key="authorItem.id" class="weekly-author">
              <div class="avatar">{{ authorItem.initials }}</div>
              <div class="author-copy">
                <strong>{{ authorItem.name }}</strong>
                <small class="muted">{{ authorItem.role }}</small>
              </div>
              <button
                :class="['short-follow', { active: followed(authorItem.id) }]"
                type="button"
                :aria-label="`Подписаться на ${authorItem.name}`"
                @click="toggleFollow(authorItem.id)"
              >
                {{ followed(authorItem.id) ? "✓" : "+" }}
              </button>
            </div>
          </div>
        </section>
        <section class="paper-card aside-card">
          <h2>Популярные темы</h2>
          <div class="topic-list">
            <RouterLink :to="{ name: 'catalog', query: { q: 'сезонное' } }">#сезонное</RouterLink>
            <RouterLink :to="{ name: 'catalog', query: { time: 30 } }">#ужинза30минут</RouterLink>
            <RouterLink :to="{ name: 'catalog', query: { q: 'выпечка' } }">#выпечка</RouterLink>
            <RouterLink :to="{ name: 'catalog', query: { type: 'breakfast' } }">#завтраки</RouterLink>
            <RouterLink :to="{ name: 'catalog', query: { q: 'без сахара' } }">#безсахара</RouterLink>
          </div>
        </section>
      </aside>
    </div>
  </section>

  <div v-if="showPublication" class="modal-backdrop" @click.self="showPublication = false">
    <form class="modal-card" @submit.prevent="publish">
      <div class="modal-header">
        <h2>Новая публикация</h2>
        <button class="close-button" type="button" aria-label="Закрыть" @click="showPublication = false">×</button>
      </div>
      <label>
        Поделитесь кулинарной находкой
        <textarea v-model="publicationText" rows="5" required></textarea>
      </label>
      <div class="modal-actions">
        <button class="button outline" type="button" @click="showPublication = false">Отмена</button>
        <button class="button primary">Опубликовать</button>
      </div>
    </form>
  </div>
</template>
