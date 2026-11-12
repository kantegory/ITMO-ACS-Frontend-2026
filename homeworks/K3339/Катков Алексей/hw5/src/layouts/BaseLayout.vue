<template>
  <a class="skip-link" href="#main">К содержимому</a>
  <header class="border-bottom">
    <div class="container d-flex align-items-center justify-content-between py-4 gap-3">
      <RouterLink class="brand" to="/">Кулинарные заметки<span aria-hidden="true">.</span></RouterLink>
      <span class="text-secondary small">Моя записная книжка</span>
    </div>
  </header>
  <main id="main" class="container py-5" tabindex="-1"><slot /></main>
  <footer class="container py-4 border-top text-secondary small">Катков Алексей · K3339 · ДЗ5</footer>
</template>
