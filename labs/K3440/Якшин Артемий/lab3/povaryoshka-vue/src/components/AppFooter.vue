<script setup>
import BaseIcon from '@/components/BaseIcon.vue'
</script>

<template>
  <footer class="site-footer">
    <div class="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
      <RouterLink class="brand text-decoration-none" :to="{ name: 'search' }">
        <span class="brand__icon"><BaseIcon name="ladle" /></span>
        Поварёшка
      </RouterLink>
      <p class="mb-0">Сервис для обмена рецептами. Учебный проект, ИТМО, 2026</p>
      <nav aria-label="Ссылки в подвале">
        <ul class="list-inline mb-0">
          <li class="list-inline-item"><RouterLink :to="{ name: 'search' }">Рецепты</RouterLink></li>
          <li class="list-inline-item"><RouterLink :to="{ name: 'register' }">Стать автором</RouterLink></li>
        </ul>
      </nav>
    </div>
  </footer>
</template>
