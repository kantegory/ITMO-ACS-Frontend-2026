<script setup>
import BaseIcon from '@/components/BaseIcon.vue'
import UserAvatar from '@/components/UserAvatar.vue'

// Шапка профиля: одинаковая у кулинара и в личном кабинете,
// отличаются только кнопки справа (слот actions) и подписи под именем
defineProps({
  user: { type: Object, required: true },
  stats: { type: Array, default: () => [] },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="profile-cover" />
  <section class="container">
    <div class="profile-head">
      <UserAvatar :user="user" size="xl" />
      <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div>
          <h1 class="profile-head__name">{{ user.name }}</h1>
          <p class="text-muted-warm mb-2">
            <BaseIcon name="pin" /> {{ subtitle || user.city || 'Город не указан' }}
          </p>
          <p class="mb-0" style="max-width: 40rem">{{ user.bio || 'Пока ничего о себе не рассказал.' }}</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <slot name="actions" />
        </div>
      </div>
      <ul class="profile-stats" aria-label="Статистика">
        <li v-for="stat in stats" :key="stat.label">
          <strong>{{ stat.value }}</strong><span>{{ stat.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
