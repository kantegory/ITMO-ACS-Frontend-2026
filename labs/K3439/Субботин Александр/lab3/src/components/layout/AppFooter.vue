<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-5">
          <RouterLink class="brand-logo mb-2" :to="{ name: 'home' }">
            <AppIcon class="icon-lg" name="logo" />
            Столик
          </RouterLink>
          <p class="small mb-0">Бронирование столиков в ресторанах Санкт-Петербурга.</p>
        </div>
        <div class="col-6 col-md-3">
          <h2 id="footerServiceTitle" class="h6 text-white">Сервис</h2>
          <nav aria-labelledby="footerServiceTitle">
            <ul class="list-unstyled small mb-0">
              <li class="mb-1"><RouterLink :to="{ name: 'search' }">Рестораны</RouterLink></li>
              <li class="mb-1"><RouterLink :to="{ name: 'bookings' }">Мои брони</RouterLink></li>
            </ul>
          </nav>
        </div>
        <div class="col-6 col-md-4">
          <h2 id="footerAccountTitle" class="h6 text-white">Аккаунт</h2>
          <nav aria-labelledby="footerAccountTitle">
            <ul class="list-unstyled small mb-0">
              <li class="mb-1"><RouterLink :to="{ name: 'login' }">Вход</RouterLink></li>
              <li class="mb-1"><RouterLink :to="{ name: 'register' }">Регистрация</RouterLink></li>
              <li class="mb-1"><RouterLink :to="{ name: 'profile' }">Личный кабинет</RouterLink></li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="footer-bottom d-flex flex-wrap justify-content-between gap-2">
        <span>© {{ year }} Столик</span>
        <span>Учебный проект, ИТМО</span>
      </div>
    </div>
  </footer>
</template>
