<script setup>
import UserAvatar from '@/components/UserAvatar.vue'

defineProps({
  user: { type: Object, required: true },
  meta: { type: String, default: '' }
})
</script>

<template>
  <div class="cook-card h-100 position-relative">
    <UserAvatar :user="user" size="lg" />
    <div class="me-auto">
      <RouterLink class="cook-card__name" :class="{ 'stretched-link': !$slots.default }" :to="{ name: 'author', params: { id: user.id } }">
        {{ user.name }}
      </RouterLink>
      <p class="cook-card__meta">{{ user.city }}</p>
      <p v-if="meta" class="cook-card__meta">{{ meta }}</p>
    </div>
    <!-- слот для кнопки, например «Отписаться» в кабинете -->
    <slot />
  </div>
</template>
