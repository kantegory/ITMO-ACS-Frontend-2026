<script setup>
import { computed } from 'vue';
import { formatPrice, TYPE_NAMES } from '../data/listings.js';
import StatBadge from './StatBadge.vue';

const props = defineProps({
  listing: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false }
});

// Карточка не меняет избранное сама — сообщает наверх, что на неё нажали
const emit = defineEmits(['toggle-favorite']);

const rooms = computed(() => {
  const { type, rooms: count } = props.listing;
  if (type === 'studio') return 'Студия';
  if (type === 'room') return 'Комната';
  if (type === 'house') return `Дом, ${count} комн.`;
  return `${count}-комн. квартира`;
});

const price = computed(() => formatPrice(props.listing.price));
const typeName = computed(() => TYPE_NAMES[props.listing.type]);
</script>

<template>
  <article class="card">
    <div class="photo">
      <img :src="`img/${listing.img}.webp`" :alt="listing.title" width="600" height="400" loading="lazy">

      <button
        class="fav"
        type="button"
        :class="{ 'fav--on': isFavorite }"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
        @click="emit('toggle-favorite', listing.id)"
      >
        {{ isFavorite ? '♥' : '♡' }}
      </button>

      <span class="price">{{ price }} <small>/ мес</small></span>
    </div>

    <div class="body">
      <h3 class="title">{{ listing.title }}</h3>
      <p class="meta">{{ listing.city }}, {{ listing.district }} р-н</p>

      <div class="badges">
        <StatBadge>{{ rooms }}</StatBadge>
        <StatBadge>{{ listing.area }} м²</StatBadge>
        <StatBadge v-if="listing.commission === 0" tone="accent">без комиссии</StatBadge>
        <StatBadge v-if="listing.pets" tone="accent">можно с животными</StatBadge>
      </div>

      <p class="type">{{ typeName }}</p>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.photo {
  position: relative;
  aspect-ratio: 3 / 2;
  background: var(--line);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fav {
  position: absolute;
  inset: 0.6rem 0.6rem auto auto;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--ink);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.fav--on {
  color: #b92d2d;
}

.price {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  background: var(--tag);
  color: #2b2200;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.price small {
  font-weight: 500;
  font-size: 0.75em;
}

.body {
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

.title {
  margin: 0;
  font-size: 1.05rem;
}

.meta,
.type {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
