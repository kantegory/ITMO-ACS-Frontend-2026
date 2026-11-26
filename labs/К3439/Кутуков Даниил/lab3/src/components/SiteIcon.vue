<script setup>
import sprite from '@homework/hw4/sprite.svg?url&no-inline';
defineProps({ name: { type: String, required: true } });
</script>

<template>
  <svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <use :href="sprite + '#' + name"></use>
  </svg>
</template>
