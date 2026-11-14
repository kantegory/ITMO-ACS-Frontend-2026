<script setup>
import ListingCard from './ListingCard.vue';
import SkeletonCard from './SkeletonCard.vue';

defineProps({
  listings: { type: Array, default: () => [] },
  pending: { type: Boolean, default: false },
  row: { type: Boolean, default: false },
  skeletons: { type: Number, default: 6 },
  columns: { type: String, default: 'col-sm-6 col-lg-4' }
});
</script>

<template>
  <div class="row g-4" :class="{ 'listing-row': row }">
    <template v-if="pending">
      <div v-for="n in skeletons" :key="`sk-${n}`" :class="row ? 'col-12' : columns">
        <SkeletonCard />
      </div>
    </template>

    <template v-else>
      <div v-for="listing in listings" :key="listing.id" :class="row ? 'col-12' : columns">
        <ListingCard :listing="listing" :row="row" />
      </div>
    </template>
  </div>
</template>
