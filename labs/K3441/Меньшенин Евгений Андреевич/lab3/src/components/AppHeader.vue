<script setup>
import { ref } from "vue";
defineProps({ authenticated: Boolean });
defineEmits(["logout"]);
const open = ref(false);
</script>

<template>
  <header class="navbar">
    <div class="container nav-inner">
      <RouterLink class="navbar-brand" to="/" @click="open = false"
        ><span class="brand-mark">Л</span>Ложка</RouterLink
      >
      <button
        class="menu-button"
        type="button"
        aria-label="Открыть меню"
        :aria-expanded="open"
        @click="open = !open"
      >
        ☰
      </button>
      <nav :class="['nav-links', { open }]" aria-label="Основная навигация">
        <RouterLink to="/recipes" @click="open = false">Рецепты</RouterLink>
        <RouterLink to="/community" @click="open = false"
          >Сообщество</RouterLink
        >
        <RouterLink to="/profile" @click="open = false">Моя кухня</RouterLink>
        <RouterLink v-if="!authenticated" to="/login" @click="open = false"
          >Войти</RouterLink
        >
        <RouterLink
          v-if="!authenticated"
          class="button primary small"
          to="/register"
          @click="open = false"
          >Начать</RouterLink
        >
        <button
          v-else
          class="button outline small"
          type="button"
          @click="
            $emit('logout');
            open = false;
          "
        >
          Выйти
        </button>
      </nav>
    </div>
  </header>
</template>
