<template>
  <a class="skip-link" href="#main">К содержимому</a>
  <header class="border-bottom">
    <div class="container py-2"><RouterLink to="/">Заметки</RouterLink></div>
  </header>
  <main id="main" class="container py-3" tabindex="-1"><slot /></main>
  <footer class="border-top small"><div class="container py-2">Катков Алексей, K3439, ДЗ5.</div></footer>
</template>
