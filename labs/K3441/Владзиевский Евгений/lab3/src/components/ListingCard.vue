<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import PriceTag from './PriceTag.vue';
import FavoriteButton from './FavoriteButton.vue';
import { useFormat } from '../composables/useFormat.js';

const props = defineProps({
  listing: { type: Object, required: true },
  row: { type: Boolean, default: false }
});

const { rooms } = useFormat();
const roomsLabel = computed(() => rooms(props.listing));
</script>

<template>
  <article class="listing">
    <div class="listing-photo">
      <img :src="`/img/${listing.img}.webp`" :alt="listing.title" loading="lazy" width="600" height="400">
      <FavoriteButton :listing-id="listing.id" />
      <PriceTag :value="listing.price" />
    </div>

    <div class="listing-body">
      <RouterLink class="listing-title" :to="{ name: 'property', params: { id: listing.id } }">
        {{ listing.title }}
      </RouterLink>
      <div class="listing-meta">{{ listing.city }}, {{ listing.district }} р-н</div>
      <div class="listing-meta">
        <svg class="icon" aria-hidden="true"><use href="/img/sprite.svg#signpost-2" /></svg>
        {{ listing.metro }}
      </div>

      <p v-if="row" class="mb-1 small text-muted-2 d-none d-md-block">{{ listing.text.slice(0, 120) }}…</p>

      <div class="listing-facts">
        <span>{{ roomsLabel }}</span>
        <span>{{ listing.area }} м²</span>
        <span>{{ listing.floor }}</span>
        <span v-if="listing.commission === 0" class="chip">без комиссии</span>
        <span v-if="listing.pets" class="chip">можно с животными</span>
      </div>
    </div>
  </article>
</template>
