<script setup>
import CatalogSection from "../components/CatalogSection.vue";
</script>
<template>
  <section class="hero container">
    <div class="hero-copy">
      <h1>Платформа для тренировок и статей о здоровье</h1>
      <p class="platform-features-title">Возможности платформы:</p>
      <ul class="platform-features">
        <li>Тренировки</li>
        <li>Отслеживание личного прогресса</li>
        <li>Блог о здоровье и питании</li>
      </ul>
    </div>
  </section>
  <CatalogSection kind="workouts" title="Тренировки" />
  <CatalogSection kind="articles" title="Блог о здоровье и питании" />
</template>
