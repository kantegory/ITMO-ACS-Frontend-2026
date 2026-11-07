<script setup>
import { formatPrice } from '@/utils/formatters'
defineProps({
  listing: { type: Object, required: true },
  incoming: { type: Number, default: 0 },
  pending: Boolean,
})
defineEmits(['toggle'])
</script>

<template>
  <article class="rs-card owner-card">
    <img :src="`/${listing.image}`" :alt="listing.title" />
    <div class="owner-body">
      <div class="d-flex gap-2">
        <span :class="['rs-badge', listing.active ? 'badge-green' : 'badge-gray']">{{
          listing.active ? 'Активно' : 'Неактивно'
        }}</span>
        <span class="rs-badge badge-blue"
          >{{ listing.mode === 'DAILY' ? 'Посуточно' : 'Помесячно' }}
        </span>
      </div>
      <h3>{{ listing.title }}</h3>
      <p class="rs-muted">{{ listing.location }}, {{ listing.address }}</p>
      <div class="fs-4 fw-bold">
        {{ formatPrice(listing.price) }} / {{ listing.mode === 'DAILY' ? 'ночь' : 'месяц' }}
      </div>
      <p class="rs-muted">Входящих заявок: {{ incoming }}</p>
      <RouterLink
        class="btn btn-primary w-100"
        :to="{ name: 'listing', params: { id: listing.id } }"
        >Посмотреть</RouterLink
      >
      <button class="btn btn-link w-100" :disabled="pending" @click="$emit('toggle')">
        {{ listing.active ? 'Скрыть объявление' : 'Показать объявление' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.owner-card {
  overflow: hidden;
}
.owner-card > img {
  width: 100%;
  height: 210px;
  object-fit: cover;
}
.owner-body {
  padding: 20px;
}
.owner-body h3 {
  margin: 14px 0 8px;
  font-size: 20px;
}
</style>
