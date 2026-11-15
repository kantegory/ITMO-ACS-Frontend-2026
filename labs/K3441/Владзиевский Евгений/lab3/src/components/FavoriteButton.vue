<script setup>
import { computed, ref } from 'vue';
import AppIcon from './AppIcon.vue';
import { useFavorites } from '../composables/useFavorites.js';
import { useToasts } from '../composables/useToasts.js';

const props = defineProps({
  listingId: { type: [Number, String], required: true },
  inline: { type: Boolean, default: false }
});

const { isFavorite, toggle } = useFavorites();
const { toast } = useToasts();
const busy = ref(false);

const active = computed(() => isFavorite(props.listingId));

async function onClick() {
  busy.value = true;
  try {
    await toggle(props.listingId);
  } catch (error) {
    toast(error.message);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <button
    type="button"
    :class="inline ? 'btn btn-outline-secondary fav-inline' : 'fav-btn'"
    :disabled="busy"
    :aria-pressed="active"
    :aria-label="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    @click.prevent="onClick"
  >
    <AppIcon :name="active ? 'heart-fill' : 'heart'" />
  </button>
</template>
