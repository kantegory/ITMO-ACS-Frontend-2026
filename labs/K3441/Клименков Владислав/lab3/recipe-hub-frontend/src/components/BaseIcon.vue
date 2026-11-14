<script setup>
/**
 * BaseIcon.vue — иконка из общего SVG-спрайта (ДР4).
 *
 * Все иконки подключаются через <use>, а путь собирается от BASE_URL,
 * поэтому спрайт работает и на вложенных маршрутах.
 */

import { computed } from 'vue';
import { spriteHref } from '@/utils/assets';

const props = defineProps({
  name: { type: String, required: true },
});

const href = computed(() => spriteHref(props.name));
</script>

<template>
  <svg class="rh-icon" aria-hidden="true">
    <use :href="href" />
  </svg>
</template>
