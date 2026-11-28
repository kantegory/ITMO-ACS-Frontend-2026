<template>
  <footer class="site-footer">
    <div class="container">
      <div class="row gy-3 align-items-center">
        <div class="col-md-6">
          <div class="brand">VICE BITES</div>
          <p class="mb-1">Обмен рецептами · кулинарные блоги</p>
          <p class="footer-neon mb-0">NEON KITCHEN</p>
        </div>
        <div class="col-md-6 text-md-end">
          <nav aria-label="Подвал">
            <RouterLink to="/">Рецепты</RouterLink>
            ·
            <RouterLink to="/profile">Кабинет</RouterLink>
            ·
            <RouterLink to="/login">Вход</RouterLink>
          </nav>
          <p class="small mt-2 mb-0 opacity-75">ЛР3 · ИТМО ACS Frontend 2026</p>
        </div>
      </div>
    </div>
  </footer>
</template>
