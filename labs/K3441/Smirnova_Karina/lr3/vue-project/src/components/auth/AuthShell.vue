<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
import spriteUrl from '@/assets/sprite.svg'

defineProps({
  image: { type: String, required: true }
})
</script>

<template>
  <main id="main-content" class="auth-page">
    <section class="auth-hero" :style="{ backgroundImage: `url(${image})` }">
      <div class="auth-hero__copy">
        <h1>Найдите место, которое станет вашим домом</h1>
        <p>Посуточная и долгосрочная аренда недвижимости в одном сервисе</p>
      </div>
    </section>
    <section class="auth-panel">
      <ThemeToggle class="auth-theme" />
      <div class="auth-form">
        <RouterLink class="rs-brand" :to="{ name: 'login' }">
          <span class="rs-brand-mark"><svg class="icon"><use :href="`${spriteUrl}#house-door`" /></svg></span>
          RentSpace
        </RouterLink>
        <slot />
      </div>
      <footer class="auth-footer">2026 RentSpace</footer>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr .9fr;
}
.auth-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 100vh;
  padding: 70px;
  background-size: cover;
  background-position: center;
  color: #fff;
}
.auth-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 72%));
}
.auth-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 650px;
}
.auth-hero h1 {
  font-size: clamp(38px, 4vw, 62px);
  font-weight: 700;
}
.auth-hero p {
  font-size: 20px;
}
.auth-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 70px
  clamp(28px, 7vw, 110px);
  background: var(--rs-surface);
}
.auth-theme {
  position: absolute;
  top: 24px;
  right: 24px;
}
.auth-form {
  width: min(470px, 100%);
  margin: auto;
}
.auth-form :deep(h2) {
  margin-top: 32px;
  font-size: 34px;
  font-weight: 700;
}
.auth-footer {
  margin-top: 32px;
  text-align: center;
  color: var(--rs-muted);
}
@media (max-width: 900px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-hero { min-height: 340px; padding: 36px; }
  .auth-panel { min-height: 650px; }
}
@media (max-width: 576px) {
  .auth-hero { display: none; }
  .auth-panel { min-height: 100vh; padding: 80px 20px 30px; }
}
</style>
