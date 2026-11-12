<script setup>
import { computed, ref } from 'vue';
const props = defineProps({ restaurant: { type: Object, default: null } });
const guests = ref(2);
const label = computed(() => props.restaurant ? `Столик в «${props.restaurant.name}» на ${guests.value} гостя(ей)` : 'Выберите ресторан выше');
</script>
<template>
  <aside class="summary" aria-labelledby="summary-title"><p class="eyebrow">Ваш выбор</p><h2 id="summary-title">План встречи</h2><p aria-live="polite">{{ label }}</p><label for="guests">Гостей</label><input id="guests" v-model.number="guests" type="number" min="1" max="10"></aside>
</template>
