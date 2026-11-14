<template>
  <footer class="bg-body border-top py-4 mt-auto">
    <div class="container">
      <div class="row gy-3">
        <div class="col-md-6">
          <p class="fw-semibold mb-1">RecipeHub</p>
          <p class="text-muted small mb-0">
            Учебный проект по фронтенд-разработке, ИТМО.
          </p>
        </div>
        <div class="col-md-6">
          <nav aria-label="Навигация в подвале">
            <ul
              class="list-unstyled d-flex flex-wrap gap-3 mb-0 justify-content-md-end"
            >
              <li><RouterLink to="/">Главная</RouterLink></li>
              <li><RouterLink to="/search">Поиск</RouterLink></li>
              <li><RouterLink to="/login">Вход</RouterLink></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>
