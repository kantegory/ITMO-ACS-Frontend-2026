<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkoutCard from './components/WorkoutCard.vue'
import WorkoutFilter from './components/WorkoutFilter.vue'
import { workouts, type Workout } from './workouts'

const category = ref<'Все' | Workout['category']>('Все')
const visibleWorkouts = computed(() => {
  if (category.value === 'Все') return workouts
  return workouts.filter((workout) => workout.category === category.value)
})
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#" aria-label="Качалочка, начало страницы">
        <span class="brand-mark" aria-hidden="true">К</span>
        Качалочка
      </a>
      <nav aria-label="Основная навигация">
        <a href="#catalog">Каталог тренировок</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <h1 id="hero-title">Тренировки<br>дома</h1>
        <p>Выберите занятие по настроению, уровню и времени.</p>
        <a class="hero-link" href="#catalog">Выбрать тренировку <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <section id="catalog" class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-heading">
        <div>
          <h2 id="catalog-title">Каталог тренировок</h2>
          <p class="result-count" role="status">Показано {{ visibleWorkouts.length }} из {{ workouts.length }}</p>
        </div>
        <WorkoutFilter v-model="category" />
      </div>
      <div class="workout-grid">
        <WorkoutCard v-for="workout in visibleWorkouts" :key="workout.id" :workout="workout" />
      </div>
    </section>
  </main>
</template>
