<script setup>
import ListingCard from './ListingCard.vue';

defineProps({
  listings: { type: Array, required: true },
  favorites: { type: Array, default: () => [] }
});

const emit = defineEmits(['toggle-favorite']);
</script>

<template>
  <!-- Пусто или нет — решает v-if, список рисует v-for -->
  <p v-if="listings.length === 0" class="empty">
    По этим условиям ничего нет. Попробуйте поднять цену или сбросить фильтры.
  </p>

  <div v-else class="grid">
    <ListingCard
      v-for="listing in listings"
      :key="listing.id"
      :listing="listing"
      :is-favorite="favorites.includes(listing.id)"
      @toggle-favorite="emit('toggle-favorite', $event)"
    />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.empty {
  margin: 0;
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--muted);
  border: 2px dashed var(--line);
  border-radius: 12px;
  background: var(--surface);
}
</style>
