<template>
  <main id="main-content" class="rh-page py-5" tabindex="-1">
    <div class="container">
      <h1 class="h3">Страница не найдена</h1>
      <p class="text-muted">
        Такой страницы нет или она была перемещена.
      </p>
      <div class="d-flex flex-wrap gap-2">
        <RouterLink class="btn btn-rh-primary" to="/">
          На главную
        </RouterLink>
        <RouterLink class="btn btn-outline-secondary" to="/search">
          К поиску рецептов
        </RouterLink>
      </div>
    </div>
  </main>
</template>
