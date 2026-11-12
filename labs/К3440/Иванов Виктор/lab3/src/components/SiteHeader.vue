<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '../composables/useAuth';
const auth = useAuth();
const profileLink = computed(() => auth.user.value ? '/profile' : '/login');
const profileText = computed(() => auth.user.value ? 'Кабинет' : 'Войти');
</script>
<template>
  <header class="site-header"><nav class="navbar navbar-expand-md container" aria-label="Основная навигация">
    <RouterLink class="brand navbar-brand" to="/"><span class="brand-mark" aria-hidden="true">●</span>Столик</RouterLink>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Открыть меню"><span class="navbar-toggler-icon"></span></button>
    <div id="nav" class="collapse navbar-collapse"><ul class="navbar-nav ms-auto align-items-md-center gap-md-3">
      <li class="nav-item"><RouterLink class="nav-link" to="/">Рестораны</RouterLink></li>
      <li class="nav-item"><RouterLink class="nav-link" :to="profileLink">{{ profileText }}</RouterLink></li>
      <li class="nav-item"><RouterLink class="btn btn-primary" to="/#search">Найти столик</RouterLink></li>
    </ul></div>
  </nav></header>
</template>
