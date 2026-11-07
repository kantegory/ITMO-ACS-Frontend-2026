<script setup>
import { formatDate, getInitials } from '@/utils/format'

// Карточка пользователя со статистикой. Пока данные грузятся, вместо чисел — прочерк
defineProps({
  user: { type: Object, required: true },
  stats: { type: Object, required: true },
})
const emit = defineEmits(['edit'])

const show = (value) => value ?? '—'
</script>

<template>
  <section class="profile-card mb-4" aria-labelledby="profileName">
    <span class="avatar mb-3" aria-hidden="true">{{ getInitials(user.name) }}</span>
    <h2 id="profileName" class="h4 mb-1">{{ user.name }}</h2>
    <p class="text-muted-warm mb-1">{{ user.email }}</p>
    <p class="text-muted-warm mb-1">{{ user.phone || 'Телефон не указан' }}</p>
    <p class="small text-muted-warm mb-3">С нами с {{ formatDate(user.createdAt, { year: true }) }}</p>
    <button class="btn btn-outline-primary w-100" type="button" @click="emit('edit', $event.currentTarget)">Редактировать профиль</button>

    <dl class="profile-stats">
      <div><dt>{{ show(stats.visits) }}</dt><dd>визитов</dd></div>
      <div><dt>{{ show(stats.reviews) }}</dt><dd>отзывов</dd></div>
      <div><dt>{{ show(stats.favorites) }}</dt><dd>избранных</dd></div>
    </dl>
  </section>
</template>
